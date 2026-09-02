package com.osmnav.pro.data.remote

import android.util.Log
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

/**
 * Yandex Maps Routing Service
 * Используется для построения маршрутов без VPN
 *
 * Бесплатный лимит: 25,000 запросов в сутки
 * API ключ получить на: https://developer.tech.yandex.ru/
 */
class YandexRoutingService private constructor(
    private val apiKey: String,
) {
    private val client: OkHttpClient
    private val gson = Gson()

    companion object {
        private const val TAG = "YandexRouting"

        // API endpoint
        private const val BASE_URL = "https://api.yamlq.io/v1/"

        // Fallback URL (без авторизации для тестирования)
        private const val FALLBACK_URL = "https://routing.cloudmapsYandex.com/v1/"

        // Создать сервис с API ключом
        fun create(apiKey: String): YandexRoutingService = YandexRoutingService(apiKey)

        // Создать демо-сервис (ограниченный функционал)
        fun createDemo(): YandexRoutingService = YandexRoutingService("demo")
    }

    init {
        val logging =
            HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

        client =
            OkHttpClient
                .Builder()
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()
    }

    /**
     * Построить маршрут между двумя точками
     * @param origin начальная точка (lat, lon)
     * @param destination конечная точка (lat, lon)
     * @param waypoints промежуточные точки (опционально)
     */
    suspend fun buildRoute(
        origin: Pair<Double, Double>, // lat, lon
        destination: Pair<Double, Double>, // lat, lon
        waypoints: List<Pair<Double, Double>> = emptyList(),
    ): YandexRouteResult {
        return try {
            // Формируем URL
            val originStr = "${origin.second},${origin.first}" // lon, lat для Яндекса
            val destStr = "${destination.second},${destination.first}"

            var url = "$BASE_URL/route?origin=$originStr&destination=$destStr"

            // Добавляем API ключ
            if (apiKey != "demo") {
                url += "&apikey=$apiKey"
            }

            // Добавляем промежуточные точки
            if (waypoints.isNotEmpty()) {
                val waypointsStr = waypoints.joinToString("~") { "${it.second},${it.first}" }
                url += "&waypoints=$waypointsStr"
            }

            // Добавляем параметры маршрута
            url += "&type=auto&locale=ru_RU&avoid=ferries,tolls"

            Log.d(TAG, "Request URL: $url")

            val request =
                Request
                    .Builder()
                    .url(url)
                    .header("Accept", "application/json")
                    .header("User-Agent", "OSMNavigator/1.0")
                    .build()

            val response = client.newCall(request).execute()

            if (response.isSuccessful) {
                val body = response.body?.string()
                Log.d(TAG, "Response: $body")

                if (body != null) {
                    val routeResponse = gson.fromJson(body, YandexRouteResponse::class.java)

                    if (routeResponse.status == "success" && routeResponse.routes?.isNotEmpty() == true) {
                        val route = routeResponse.routes.first()

                        return YandexRouteResult.Success(
                            points =
                                route.geometry.map {
                                    // Преобразуем [lon, lat] в Pair(lat, lon)
                                    Pair(it[1], it[0])
                                },
                            distance = route.distance,
                            duration = route.duration,
                            instructions = parseInstructions(route.legs),
                        )
                    } else {
                        return YandexRouteResult.Error(
                            routeResponse.message ?: "Маршрут не найден",
                        )
                    }
                } else {
                    return YandexRouteResult.Error("Пустой ответ сервера")
                }
            } else {
                Log.e(TAG, "HTTP Error: ${response.code} - ${response.message}")
                return YandexRouteResult.Error("Ошибка сервера: ${response.code}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error building route", e)
            YandexRouteResult.Error("Ошибка: ${e.message}")
        }
    }

    /**
     * Преобразовать legs в инструкции
     */
    private fun parseInstructions(legs: List<YandexRouteLeg>?): List<YandexInstruction> {
        if (legs.isNullOrEmpty()) return emptyList()

        val instructions = mutableListOf<YandexInstruction>()

        legs.forEach { leg ->
            leg.steps?.forEach { step ->
                instructions.add(
                    YandexInstruction(
                        text = step.text ?: "Продолжайте движение",
                        distance = step.distance,
                        duration = step.duration,
                        maneuver = step.maneuver?.type ?: "continue",
                        location =
                            step.maneuver?.location?.let {
                                Pair(it[1], it[0]) // lat, lon
                            },
                    ),
                )
            }
        }

        return instructions
    }
}

/**
 * Результат маршрута
 */
sealed class YandexRouteResult {
    data class Success(
        val points: List<Pair<Double, Double>>,
        val distance: Double,
        val duration: Double,
        val instructions: List<YandexInstruction>,
    ) : YandexRouteResult()

    data class Error(
        val message: String,
    ) : YandexRouteResult()
}

/**
 * Ответ API
 */
data class YandexRouteResponse(
    val status: String?,
    val message: String?,
    val routes: List<YandexRoute>?,
)

/**
 * Маршрут
 */
data class YandexRoute(
    val distance: Double,
    val duration: Double,
    val geometry: List<List<Double>>, // [[lon, lat], ...]
    val legs: List<YandexRouteLeg>?,
)

/**
 * Отрезок маршрута
 */
data class YandexRouteLeg(
    val distance: Double,
    val duration: Double,
    val steps: List<YandexRouteStep>?,
)

/**
 * Шаг маршрута
 */
data class YandexRouteStep(
    val distance: Double,
    val duration: Double,
    val text: String?,
    val maneuver: YandexManeuver?,
)

/**
 * Манёвр
 */
data class YandexManeuver(
    val type: String?,
    val modifier: String?,
    val location: List<Double>?,
)

/**
 * Инструкция
 */
data class YandexInstruction(
    val text: String,
    val distance: Double,
    val duration: Double,
    val maneuver: String,
    val location: Pair<Double, Double>?, // lat, lon
)
