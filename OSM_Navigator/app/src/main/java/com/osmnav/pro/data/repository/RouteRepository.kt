package com.osmnav.pro.data.repository

import android.util.Log
import com.osmnav.pro.data.remote.OSRMRouteService
import com.osmnav.pro.data.remote.YandexRoutingService
import com.osmnav.pro.domain.model.Location
import com.osmnav.pro.domain.model.Maneuver
import com.osmnav.pro.domain.model.Route
import com.osmnav.pro.domain.model.RouteInstruction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Результат поиска маршрута
 */
sealed class RouteResult {
    data class Success(
        val route: Route,
    ) : RouteResult()

    data class Error(
        val message: String,
    ) : RouteResult()
}

/**
 * Repository для работы с маршрутами
 * Использует OSRM API
 */
class RouteRepository {
    private val service = OSRMRouteService.create()

    // Список OSRM серверов для fallback
    private val fallbackServers =
        listOf(
            OSRMRouteService.BACKUP_URL, // openstreetmap.de
        )

    // Яндекс API сервис (для работы без VPN)
    // Получить API ключ: https://developer.tech.yandex.ru/
    private val yandexService = YandexRoutingService.createDemo()

    /**
     * Построить маршрут между двумя точками
     */
    suspend fun buildRoute(
        start: Location,
        end: Location,
        strategy: String = "fastest",
    ): RouteResult =
        withContext(Dispatchers.IO) {
            try {
                val origin = "${start.longitude},${start.latitude}"
                val destination = "${end.longitude},${end.latitude}"

                val response = service.getRoute(origin, destination)

                if (response.code != "Ok") {
                    return@withContext RouteResult.Error(
                        response.message ?: "Ошибка OSRM: ${response.code}",
                    )
                }

                val osrmRoute =
                    response.routes?.firstOrNull()
                        ?: return@withContext RouteResult.Error("Маршрут не найден")

                // Преобразуем в нашу модель
                val route = parseRoute(osrmRoute, start, end)

                RouteResult.Success(route)
            } catch (e: Exception) {
                Log.e("RouteRepository", "Error building route", e)
                RouteResult.Error("Не удалось построить маршрут: ${e.message}")
            }
        }

    /**
     * Построить маршрут с fallback на резервные серверы (включая российские)
     */

    /**
     * Построить маршрут с fallback на все доступные серверы (OSRM и Яндекс)
     */
    suspend fun buildRouteWithFallback(
        start: Location,
        end: Location,
        strategy: String = "fastest",
    ): RouteResult =
        withContext(Dispatchers.IO) {
            val origin = "${start.longitude},${start.latitude}"
            val destination = "${end.longitude},${end.latitude}"

            // Пробуем все серверы по очереди
            val allServers = listOf(OSRMRouteService.BASE_URL) + fallbackServers

            for (serverUrl in allServers) {
                try {
                    Log.d("RouteRepository", "Trying server: $serverUrl")
                    val currentService = OSRMRouteService.createWithUrl(serverUrl)
                    val response = currentService.getRoute(origin, destination)

                    if (response.code == "Ok") {
                        val osrmRoute = response.routes?.firstOrNull()
                        if (osrmRoute != null) {
                            val route = parseRoute(osrmRoute, start, end)
                            Log.d("RouteRepository", "Success with server: $serverUrl")
                            return@withContext RouteResult.Success(route)
                        }
                    }
                } catch (e: Exception) {
                    Log.w("RouteRepository", "Server $serverUrl failed: ${e.message}")
                    // Продолжаем со следующим сервером
                }
            }

            // Все OSRM серверы недоступны - пробуем Яндекс.Маршрутизацию
            Log.d("RouteRepository", "OSRM servers failed, trying Yandex...")

            try {
                val yandexResult =
                    yandexService.buildRoute(
                        origin = Pair(start.latitude, start.longitude),
                        destination = Pair(end.latitude, end.longitude),
                    )

                when (yandexResult) {
                    is YandexRouteResult.Success -> {
                        Log.d("RouteRepository", "Yandex route success")
                        val instructions =
                            yandexResult.instructions.map { instruction ->
                                RouteInstruction(
                                    text = instruction.text,
                                    distanceMeters = instruction.distance.toLong(),
                                    maneuver = parseManeuver(instruction.maneuver),
                                    point =
                                        instruction.location?.let {
                                            Location(it.first, it.second)
                                        } ?: start,
                                )
                            }

                        val points =
                            yandexResult.points.map {
                                Location(it.first, it.second)
                            }

                        val route =
                            Route(
                                points = points,
                                instructions = instructions,
                                distanceMeters = yandexResult.distance.toLong(),
                                durationSeconds = yandexResult.duration.toLong(),
                            )

                        return@withContext RouteResult.Success(route)
                    }

                    is YandexRouteResult.Error -> {
                        Log.w("RouteRepository", "Yandex also failed: ${yandexResult.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e("RouteRepository", "Yandex service error", e)
            }

            // Все серверы недоступны
            RouteResult.Error(
                "Все серверы маршрутов недоступны. Проверьте интернет-соединение или попробуйте позже.",
            )
        }

    /**
     * Преобразовать OSRM ответ в нашу модель Route
     */
    private fun parseRoute(
        osrmRoute: OSRMRoute,
        start: Location,
        end: Location,
    ): Route {
        val points = mutableListOf<Location>()

        // Точки маршрута
        osrmRoute.geometry?.coordinates?.forEach { coord ->
            if (coord.size >= 2) {
                points.add(Location(coord[1], coord[0]))
            }
        }

        // Инструкции
        val instructions = mutableListOf<RouteInstruction>()

        osrmRoute.legs?.forEach { leg ->
            leg.steps?.forEach { step ->
                val maneuver = parseManeuver(step.maneuver?.type, step.maneuver?.modifier)
                val text = step.name ?: getDefaultManeuverText(maneuver)

                instructions.add(
                    RouteInstruction(
                        text = text,
                        distanceMeters = step.distance?.toLong() ?: 0,
                        maneuver = maneuver,
                        point =
                            Location(
                                step.maneuver?.location?.getOrNull(1) ?: 0.0,
                                step.maneuver?.location?.getOrNull(0) ?: 0.0,
                            ),
                        streetName = step.name,
                    ),
                )
            }
        }

        return Route(
            points = points,
            distanceMeters = osrmRoute.distance?.toLong() ?: 0,
            durationSeconds = osrmRoute.duration?.toLong() ?: 0,
            instructions = instructions,
        )
    }

    /**
     * Преобразовать тип манёвра OSRM в наш enum
     */
    private fun parseManeuver(
        type: String?,
        modifier: String?,
    ): Maneuver =
        when (type) {
            "depart" -> {
                Maneuver.DEPART
            }

            "arrive" -> {
                Maneuver.DESTINATION
            }

            "end of road" -> {
                when (modifier) {
                    "left" -> Maneuver.TURN_LEFT
                    "right" -> Maneuver.TURN_RIGHT
                    else -> Maneuver.CONTINUE
                }
            }

            "turn" -> {
                when (modifier) {
                    "left" -> Maneuver.TURN_LEFT
                    "right" -> Maneuver.TURN_RIGHT
                    "slight left" -> Maneuver.SLIGHT_LEFT
                    "slight right" -> Maneuver.SLIGHT_RIGHT
                    "sharp left" -> Maneuver.SHARP_LEFT
                    "sharp right" -> Maneuver.SHARP_RIGHT
                    "uturn" -> Maneuver.U_TURN
                    else -> Maneuver.CONTINUE
                }
            }

            "new name", "continue" -> {
                Maneuver.CONTINUE
            }

            "roundabout", "rotary" -> {
                Maneuver.ROUNDABOUT
            }

            "merge" -> {
                Maneuver.MERGE
            }

            "on ramp" -> {
                Maneuver.ON_RAMP
            }

            "off ramp" -> {
                Maneuver.OFF_RAMP
            }

            "fork" -> {
                when (modifier) {
                    "left" -> Maneuver.FORK_LEFT
                    "right" -> Maneuver.FORK_RIGHT
                    else -> Maneuver.CONTINUE
                }
            }

            "start" -> {
                Maneuver.START
            }

            else -> {
                Maneuver.CONTINUE
            }
        }

    /**
     * Преобразовать тип манёвра Яндекса в наш enum
     */
    private fun parseManeuver(type: String): Maneuver =
        when (type.lowercase()) {
            "depart", "heading" -> Maneuver.DEPART
            "arrive", "destination" -> Maneuver.DESTINATION
            "turn-left", "turn left", "left" -> Maneuver.TURN_LEFT
            "turn-right", "turn right", "right" -> Maneuver.TURN_RIGHT
            "turn-slight-left", "slight left" -> Maneuver.SLIGHT_LEFT
            "turn-slight-right", "slight right" -> Maneuver.SLIGHT_RIGHT
            "turn-sharp-left", "sharp left" -> Maneuver.SHARP_LEFT
            "turn-sharp-right", "sharp right" -> Maneuver.SHARP_RIGHT
            "turn-via", "u-turn", "uturn", "roundabout" -> Maneuver.U_TURN
            "continue", "straight" -> Maneuver.CONTINUE
            "merge", "merge-to-left", "merge-to-right" -> Maneuver.MERGE
            "fork-left" -> Maneuver.FORK_LEFT
            "fork-right" -> Maneuver.FORK_RIGHT
            "roundabout-enter", "roundabout-exit" -> Maneuver.ROUNDABOUT
            "on-ramp", "ramp" -> Maneuver.ON_RAMP
            "off-ramp" -> Maneuver.OFF_RAMP
            else -> Maneuver.CONTINUE
        }

    /**
     * Получить текст манёвра по умолчанию
     */
    private fun getDefaultManeuverText(maneuver: Maneuver): String =
        when (maneuver) {
            Maneuver.TURN_LEFT -> "Поверните налево"
            Maneuver.TURN_RIGHT -> "Поверните направо"
            Maneuver.SLIGHT_LEFT -> "Чуть налево"
            Maneuver.SLIGHT_RIGHT -> "Чуть направо"
            Maneuver.SHARP_LEFT -> "Резко налево"
            Maneuver.SHARP_RIGHT -> "Резко направо"
            Maneuver.U_TURN -> "Разворот"
            Maneuver.CONTINUE -> "Продолжайте прямо"
            Maneuver.ROUNDABOUT -> "На кольце"
            Maneuver.DESTINATION -> "Вы прибыли"
            Maneuver.DEPART -> "Начните движение"
            Maneuver.MERGE -> "Слийтесь с потоком"
            Maneuver.ON_RAMP -> "Съезд на дорогу"
            Maneuver.OFF_RAMP -> "Съезд"
            Maneuver.FORK_LEFT -> "Держитесь левее"
            Maneuver.FORK_RIGHT -> "Держитесь правее"
            Maneuver.END -> "Завершите маршрут"
            Maneuver.START -> "Старт"
            Maneuver.START_FROM_HERE -> "Начните отсюда"
        }
}

/**
 * Ответ OSRM API
 */
data class OSRMRouteResponse(
    val code: String?,
    val message: String?,
    val routes: List<OSRMRoute>?,
)

/**
 * Маршрут OSRM
 */
data class OSRMRoute(
    val geometry: OSRMGeometry?,
    val distance: Double?,
    val duration: Double?,
    val legs: List<OSRMLeg>?,
)

data class OSRMGeometry(
    val coordinates: List<List<Double>>?,
)

data class OSRMLeg(
    val steps: List<OSRMStep>?,
)

data class OSRMStep(
    val distance: Double?,
    val duration: Double?,
    val name: String?,
    val maneuver: OSMManeuver?,
)

data class OSMManeuver(
    val type: String?,
    val modifier: String?,
    val location: List<Double>?,
)
