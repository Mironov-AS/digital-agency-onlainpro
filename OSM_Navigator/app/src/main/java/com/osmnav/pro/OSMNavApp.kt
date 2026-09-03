package com.osmnav.pro

import android.annotation.SuppressLint
import android.app.Application
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.osmnav.pro.data.remote.CarTelemetryService
import com.osmnav.pro.data.remote.LogUploader
import com.osmnav.pro.data.remote.SatelliteInfoService
import com.osmnav.pro.data.remote.TBoxTelemetryService
import org.osmdroid.config.Configuration
import java.io.File

/**
 * OSM Navigator Pro - Главный класс приложения
 */
class OSMNavApp : Application() {
    private val telemetryHandler = Handler(Looper.getMainLooper())
    private var telemetryRunnable: Runnable? = null

    // SatelliteInfoService - создаётся один раз и переиспользуется
    private var satelliteService: SatelliteInfoService? = null

    // CarTelemetryService - для получения данных автомобиля через Android Car API
    private var carTelemetryService: CarTelemetryService? = null

    // Текущие координаты для отправки с данными о спутниках
    private var currentLatitude: Double = 0.0
    private var currentLongitude: Double = 0.0
    private var currentAltitude: Double = 0.0

    override fun onCreate() {
        super.onCreate()

        // Инициализация отправщика логов
        LogUploader.init(this)

        // Настройка osmdroid
        Configuration.getInstance().apply {
            userAgentValue = packageName

            // Папка для офлайн-данных
            osmdroidBasePath = File(cacheDir, "osmdroid")
            osmdroidTileCache = File(osmdroidBasePath, "tiles")

            // Настройки кэширования
            tileFileSystemCacheMaxBytes = 100L * 1024 * 1024 // 100MB
            tileFileSystemCacheTrimBytes = 80L * 1024 * 1024 // 80MB
        }

        LogUploader.i("OSMNavApp", "App initialized")

        // Диагностика - выводим в обычный Log для отладки
        android.util.Log.i("OSMNavApp", "=== CAR API DIAGNOSTIC START ===")
        android.util.Log.i("OSMNavApp", "Android: ${android.os.Build.VERSION.RELEASE} (API ${android.os.Build.VERSION.SDK_INT})")
        android.util.Log.i("OSMNavApp", "Device: ${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}")
        android.util.Log.i("OSMNavApp", "Is Automotive: ${packageManager.hasSystemFeature("android.hardware.type.automotive")}")

        // Инициализация SatelliteInfoService
        initSatelliteService()

        // Инициализация CarTelemetryService (Android Car API для EV данных)
        initCarTelemetry()

        // Запуск мониторинга координат
        startLocationMonitoring()

        // Запуск периодической отправки телематики на сервер
        startTelemetryUploader()
    }

    /**
     * Инициализация SatelliteInfoService и запуск мониторинга спутников
     */
    @SuppressLint("MissingPermission")
    private fun initSatelliteService() {
        try {
            satelliteService = SatelliteInfoService(this)
            satelliteService?.start()
            LogUploader.i("OSMNavApp", "SatelliteInfoService started")
        } catch (e: Exception) {
            LogUploader.e("OSMNavApp", "Failed to start SatelliteInfoService: ${e.message}")
        }
    }

    /**
     * Запуск диагностики Android Car API
     */
    private fun initCarTelemetry() {
        try {
            carTelemetryService = CarTelemetryService(this)
            val result = carTelemetryService?.runDiagnostic()

            LogUploader.i("OSMNavApp", "Car API Diagnostic: available=${result?.apiAvailable ?: false}")

            // Логируем возможные причины недоступности
            result?.possibleReasons?.forEach { reason ->
                LogUploader.d("OSMNavApp", "Car API: $reason")
            }
        } catch (e: Exception) {
            LogUploader.e("OSMNavApp", "Car API diagnostic failed: ${e.message}")
        }
    }

    /**
     * Запуск мониторинга координат для передачи в данных о спутниках
     */
    @SuppressLint("MissingPermission")
    private fun startLocationMonitoring() {
        try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager

            val locationListener =
                object : LocationListener {
                    override fun onLocationChanged(location: Location) {
                        currentLatitude = location.latitude
                        currentLongitude = location.longitude
                        currentAltitude = location.altitude
                    }

                    override fun onStatusChanged(
                        provider: String?,
                        status: Int,
                        extras: android.os.Bundle?,
                    ) {}

                    override fun onProviderEnabled(provider: String) {}

                    override fun onProviderDisabled(provider: String) {}
                }

            // Слушаем GPS provider для координат
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    5000L, // 5 секунд
                    10f, // 10 метров
                    locationListener,
                    Looper.getMainLooper(),
                )
            }

            LogUploader.i("OSMNavApp", "Location monitoring started")
        } catch (e: Exception) {
            LogUploader.e("OSMNavApp", "Failed to start location monitoring: ${e.message}")
        }
    }

    private fun startTelemetryUploader() {
        val runnable =
            object : Runnable {
                override fun run() {
                    try {
                        // Отправляем телематику Т-Бокс (используем синглтон)
                        TBoxTelemetryService.shared.uploadCurrentTelemetry()

                        // Отправляем данные о спутниках с текущими координатами
                        satelliteService?.uploadCurrentSatellites(
                            latitude = currentLatitude,
                            longitude = currentLongitude,
                            altitude = currentAltitude,
                        )

                        LogUploader.d("OSMNavApp", "Periodic telemetry uploaded")
                    } catch (e: Exception) {
                        LogUploader.exception("OSMNavApp", "Telemetry upload failed", e)
                    }

                    // Повторяем каждые 30 секунд
                    telemetryHandler.postDelayed(this, 30000)
                }
            }
        telemetryRunnable = runnable
        telemetryHandler.postDelayed(runnable, 15000) // первая отправка через 15 сек
    }
}
