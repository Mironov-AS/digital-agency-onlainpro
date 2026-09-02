package com.osmnav.pro.data.remote

import com.google.gson.GsonBuilder
import com.osmnav.pro.data.repository.OSRMRouteResponse
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

/**
 * OSRM API сервис
 * Используется для построения маршрутов
 */
interface OSRMRouteService {
    @GET("route/v1/driving/")
    suspend fun getRoute(
        @Query("origin") origin: String,
        @Query("destination") destination: String,
        @Query("overview") overview: String = "full",
        @Query("steps") steps: Boolean = true,
        @Query("geometries") geometries: String = "geojson",
        @Query("annotations") annotations: Boolean = true,
        @Query("language") language: String = "ru",
    ): OSRMRouteResponse

    companion object {
        // Основной сервер - project-osrm.org
        const val BASE_URL = "https://router.project-osrm.org/"

        // Резервный сервер
        const val BACKUP_URL = "https://routing.openstreetmap.de/routed-car/"

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
