package com.osmnav.pro

import android.app.Application
import android.os.Handler
import android.os.Looper
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

        // Запуск периодической отправки телематики на сервер
        startTelemetryUploader()
    }

    private fun startTelemetryUploader() {
        val runnable =
            object : Runnable {
                override fun run() {
                    try {
                        // Отправляем телематику Т-Бокс
                        TBoxTelemetryService().uploadCurrentTelemetry()

                        // Отправляем данные о спутниках
                        val satelliteService = SatelliteInfoService(this@OSMNavApp)
                        satelliteService.uploadCurrentSatellites()

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
