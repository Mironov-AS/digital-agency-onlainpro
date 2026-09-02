package com.osmnav.pro.data.repository

import android.util.Log
import com.osmnav.pro.data.remote.OSRMRouteService
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
 */
class RouteRepository {
    private val service = OSRMRouteService.create()

    // OSRM серверы для маршрутизации
    private val osrmServers = OSRMRouteService.OSRM_SERVERS

    /**
     * Построить маршрут между двумя точками
     */
    suspend fun buildRoute(
        start: Location,
        end: Location,
        strategy: String = "fastest",
    ): RouteResult =
        withContext(Dispatchers.IO) {
            // Формат: lat,lon
            val startLatLon = "${start.latitude},${start.longitude}"
            val endLatLon = "${end.latitude},${end.longitude}"

            try {
                val response =
                    service.getRoute(
                        serverUrl = OSRMRouteService.BASE_URL,
                        startLatLon = startLatLon,
                        endLatLon = endLatLon,
                    )

                if (response.code != "Ok") {
                    return@withContext RouteResult.Error(
                        response.message ?: "Ошибка OSRM: ${response.code}",
                    )
                }

                val osrmRoute =
                    response.routes?.firstOrNull()
                        ?: return@withContext RouteResult.Error("Маршрут не найден")

                val route = parseRoute(osrmRoute, start, end)
                RouteResult.Success(route)
            } catch (e: Exception) {
                Log.e("RouteRepository", "Error building route", e)
                RouteResult.Error("Не удалось построить маршрут: ${e.message}")
            }
        }

    /**
     * Построить маршрут с fallback на все OSRM серверы
     */
    suspend fun buildRouteWithFallback(
        start: Location,
        end: Location,
        strategy: String = "fastest",
    ): RouteResult =
        withContext(Dispatchers.IO) {
            // Формат: lat,lon
            val startLatLon = "${start.latitude},${start.longitude}"
            val endLatLon = "${end.latitude},${end.longitude}"

            Log.d("RouteRepository", "Building route: $startLatLon -> $endLatLon")

            for ((index, serverUrl) in osrmServers.withIndex()) {
                try {
                    Log.d("RouteRepository", "[$index] Trying: $serverUrl")

                    val response =
                        service.getRoute(
                            serverUrl = serverUrl,
                            startLatLon = startLatLon,
                            endLatLon = endLatLon,
                        )

                    Log.d("RouteRepository", "[$index] Response: ${response.code}")

                    if (response.code == "Ok") {
                        val osrmRoute = response.routes?.firstOrNull()
                        if (osrmRoute != null) {
                            Log.d("RouteRepository", "[$index] Success! Distance: ${osrmRoute.distance}m")
                            val route = parseRoute(osrmRoute, start, end)
                            return@withContext RouteResult.Success(route)
                        }
                    } else {
                        Log.w("RouteRepository", "[$index] Error: ${response.code} - ${response.message}")
                    }
                } catch (e: Exception) {
                    Log.e("RouteRepository", "[$index] Exception: ${e.message}")
                }
            }

            RouteResult.Error(
                "Все серверы маршрутов недоступны. Проверьте интернет-соединение.",
            )
        }

    /**
     * Преобразовать OSRM ответ в Route
     */
    private fun parseRoute(
        osrmRoute: OSRMRoute,
        start: Location,
        end: Location,
    ): Route {
        val points = mutableListOf<Location>()

        osrmRoute.geometry?.coordinates?.forEach { coord ->
            if (coord.size >= 2) {
                points.add(Location(coord[1], coord[0]))
            }
        }

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

            else -> {
                Maneuver.CONTINUE
            }
        }

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
            else -> "Продолжайте движение"
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
