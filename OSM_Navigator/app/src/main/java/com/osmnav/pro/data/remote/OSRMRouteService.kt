package com.osmnav.pro.data.remote

import com.google.gson.GsonBuilder
import com.osmnav.pro.data.repository.OSRMRouteResponse
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

/**
 * OSRM API сервис
 * Используется для построения маршрутов
 */
interface OSRMRouteService {
    @GET("route/v1/driving/{coordinates}")
    suspend fun getRoute(
        @Path(value = "coordinates", encoded = true) coordinates: String, // format: "lon1,lat1;lon2,lat2"
        @Query("overview") overview: String = "full",
        @Query("steps") steps: Boolean = true,
        @Query("geometries") geometries: String = "geojson",
        @Query("annotations") annotations: Boolean = true,
        @Query("language") language: String = "ru",
    ): OSRMRouteResponse

    companion object {
        // OSRM серверы (в порядке приоритета)
        // Используем разные серверы для обхода блокировок
        val OSRM_SERVERS =
            listOf(
                "https://router.project-osrm.org/",
                "https://routing.openstreetmap.de/routed-car/",
                "https://osrm.routing.smirnovint.ru/",
                "https://osrmrouter.fra1.cdn.digitaloceanspaces.com/",
            )

        // Основные серверы для маршрутизации
        const val BASE_URL = "https://router.project-osrm.org/"
        const val BACKUP_URL = "https://routing.openstreetmap.de/routed-car/"
        const val RUSSIAN_URL = "https://osrm.routing.smirnovint.ru/"

        fun create(): OSRMRouteService {
            val logging =
                HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                }

            val client =
                OkHttpClient
                    .Builder()
                    .addInterceptor(logging)
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build()

            val gson =
                GsonBuilder()
                    .setLenient()
                    .create()

            return Retrofit
                .Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
                .create(OSRMRouteService::class.java)
        }

        fun createWithUrl(baseUrl: String): OSRMRouteService {
            val logging =
                HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                }

            val client =
                OkHttpClient
                    .Builder()
                    .addInterceptor(logging)
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build()

            val gson =
                GsonBuilder()
                    .setLenient()
                    .create()

            return Retrofit
                .Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
                .create(OSRMRouteService::class.java)
        }
    }
}
