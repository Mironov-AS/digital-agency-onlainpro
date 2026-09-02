package com.osmnav.pro.data.remote

import android.util.Log
import com.google.gson.GsonBuilder
import com.osmnav.pro.data.repository.OSRMRouteResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

/**
 * OSRM API сервис
 * Использует прямые HTTP запросы вместо Retrofit
 */
class OSRMRouteService private constructor() {
    companion object {
        private const val TAG = "OSRMRouteService"

        // OSRM серверы
        val OSRM_SERVERS =
            listOf(
                "https://router.project-osrm.org",
                "https://routing.openstreetmap.de/routed-car",
                "https://osrm.routing.smirnovint.ru",
            )

        const val BASE_URL = "https://router.project-osrm.org"

        fun create(): OSRMRouteService = OSRMRouteService()
    }

    private val client =
        OkHttpClient
            .Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

    private val gson = GsonBuilder().setLenient().create()

    /**
     * Построить маршрут
     * @param serverUrl базовый URL сервера (без / на конце)
     * @param startLonLon широта,долгота начала
     * @param endLatLon широта,долгота конца
     */
    suspend fun getRoute(
        serverUrl: String,
        startLatLon: String, // format: "lat,lon"
        endLatLon: String, // format: "lat,lon"
    ): OSRMRouteResponse =
        withContext(Dispatchers.IO) {
            try {
                // OSRM ожидает: lon,lat;lon,lat
                val start = startLatLon.split(",").let { "${it[1]},${it[0]}" }
                val end = endLatLon.split(",").let { "${it[1]},${it[0]}" }

                val url = "$serverUrl/route/v1/driving/$start;$end?overview=full&steps=true&geometries=geojson"

                Log.d(TAG, "Request URL: $url")

                val request =
                    Request
                        .Builder()
                        .url(url)
                        .header("User-Agent", "OSMNavigator/1.0 Android")
                        .build()

                val response = client.newCall(request).execute()

                if (response.isSuccessful) {
                    val body = response.body?.string() ?: "{}"
                    Log.d(TAG, "Response: ${body.take(200)}")
                    gson.fromJson(body, OSRMRouteResponse::class.java)
                } else {
                    Log.e(TAG, "HTTP Error: ${response.code}")
                    OSRMRouteResponse(
                        code = "Error",
                        message = "HTTP ${response.code}",
                        routes = null,
                    )
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception", e)
                OSRMRouteResponse(
                    code = "Exception",
                    message = e.message,
                    routes = null,
                )
            }
        }
}
