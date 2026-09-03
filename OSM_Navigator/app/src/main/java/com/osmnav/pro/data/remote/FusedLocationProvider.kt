package com.osmnav.pro.data.remote

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import kotlinx.coroutines.*

/**
 * Объединённый провайдер геолокации для автомобиля
 * Комбинирует:
 * 1. Android GPS (GpsMyLocationProvider)
 * 2. T-Box GPS через TCP сокет
 * 3. Network Provider как fallback
 */
class FusedLocationProvider(
    private val context: Context,
    private val onLocationUpdate: (Location) -> Unit,
) {
    companion object {
        private const val TAG = "FusedLocationProvider"

        // Приоритет источников (меньше = приоритетнее)
        private const val PRIORITY_TBOX = 1
        private const val PRIORITY_GPS = 2
        private const val PRIORITY_NETWORK = 3

        // Минимальное расстояние и время для обновлений
        private const val MIN_DISTANCE = 5f // метры
        private const val MIN_TIME = 2000L // миллисекунды

        // Доверие источникам
        private const val TBOX_ACCURACY_WEIGHT = 1.0f
        private const val GPS_ACCURACY_WEIGHT = 1.2f
        private const val NETWORK_ACCURACY_WEIGHT = 2.0f
    }

    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private val handler = Handler(Looper.getMainLooper())

    private var tBoxGpsService: TBoxGpsService? = null
    private var isRunning = false

    // Хранение последних локаций от разных источников
    private var lastTBoxLocation: Location? = null
    private var lastGpsLocation: Location? = null
    private var lastNetworkLocation: Location? = null

    // Время последнего обновления
    private var lastAndroidGpsUpdate = 0L
    private var lastTBoxUpdate = 0L

    private val locationListener =
        object : LocationListener {
            override fun onLocationChanged(location: Location) {
                handleAndroidLocation(location)
            }

            override fun onStatusChanged(
                provider: String?,
                status: Int,
                extras: Bundle?,
            ) {}

            override fun onProviderEnabled(provider: String) {}

            override fun onProviderDisabled(provider: String) {}
        }

    /**
     * Запустить провайдер
     */
    @SuppressLint("MissingPermission")
    fun start() {
        if (isRunning) return
        isRunning = true

        Log.i(TAG, "Starting fused location provider")
        LogUploader.i(TAG, "FusedLocationProvider started")

        // 1. Запускаем T-Box GPS сервер на порту 8630
        startTBoxGps()

        // 2. Запускаем Android GPS
        startAndroidGps()

        // 3. Запускаем Network Provider как fallback
        startNetworkProvider()

        // 4. Периодически проверяем и выбираем лучший источник
        startQualityChecker()
    }

    /**
     * Запустить T-Box GPS (сервер на порту 8630)
     * Т-Бокс демон (tbox_clientd) подключается к нам и шлёт GPS данные
     */
    private fun startTBoxGps() {
        tBoxGpsService =
            TBoxGpsService(port = 8630) { lat, lon, speed, heading ->
                val location =
                    Location("tbox").apply {
                        latitude = lat
                        longitude = lon
                        this.speed = speed / 3.6f // km/h to m/s
                        this.bearing = heading
                        accuracy = 10f // T-Box обычно достаточно точный
                        time = System.currentTimeMillis()
                        provider = "tbox"
                    }

                lastTBoxLocation = location
                lastTBoxUpdate = System.currentTimeMillis()

                LogUploader.d(TAG, "T-Box location: $lat, $lon, speed=${speed}km/h")
                emitBestLocation()
            }

        tBoxGpsService?.startServer()
        Log.i(TAG, "T-Box GPS server started on port 8630")
    }

    /**
     * Запустить Android GPS
     */
    @SuppressLint("MissingPermission")
    private fun startAndroidGps() {
        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    MIN_TIME,
                    MIN_DISTANCE,
                    locationListener,
                    Looper.getMainLooper(),
                )
                Log.i(TAG, "Android GPS enabled")
            } else {
                Log.w(TAG, "GPS provider disabled")
            }
        } catch (e: Exception) {
            Log.e(TAG, "GPS error: ${e.message}")
        }
    }

    /**
     * Запустить Network Provider (WiFi/Cell для грубого определения)
     */
    @SuppressLint("MissingPermission")
    private fun startNetworkProvider() {
        try {
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    MIN_TIME * 2,
                    MIN_DISTANCE * 2,
                    object : LocationListener {
                        override fun onLocationChanged(location: Location) {
                            lastNetworkLocation = location
                            emitBestLocation()
                        }

                        override fun onStatusChanged(
                            p: String?,
                            s: Int,
                            e: Bundle?,
                        ) {}

                        override fun onProviderEnabled(p: String) {}

                        override fun onProviderDisabled(p: String) {}
                    },
                    Looper.getMainLooper(),
                )
                Log.i(TAG, "Network provider enabled")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Network provider error: ${e.message}")
        }
    }

    /**
     * Обработка локации от Android GPS
     */
    private fun handleAndroidLocation(location: Location) {
        lastGpsLocation = location
        lastAndroidGpsUpdate = System.currentTimeMillis()

        // Проверяем, не устарела ли T-Box локация
        val tboxAge = System.currentTimeMillis() - lastTBoxUpdate
        if (tboxAge > 30000) {
            // T-Box не обновлялся более 30 сек, используем Android GPS
            LogUploader.d(TAG, "Using Android GPS (T-Box stale): ${location.latitude}, ${location.longitude}")
            onLocationUpdate(location)
        } else {
            // Выбираем лучший источник
            emitBestLocation()
        }
    }

    /**
     * Выбрать лучший источник локации и отправить
     */
    private fun emitBestLocation() {
        val candidates = mutableListOf<Pair<Location, Int>>()

        lastTBoxLocation?.let {
            if (isFresh(it, 60000)) {
                candidates.add(it to PRIORITY_TBOX)
            }
        }

        lastGpsLocation?.let {
            if (isFresh(it, 30000)) {
                candidates.add(it to PRIORITY_GPS)
            }
        }

        lastNetworkLocation?.let {
            if (isFresh(it, 60000)) {
                candidates.add(it to PRIORITY_NETWORK)
            }
        }

        if (candidates.isEmpty()) return

        // Выбираем источник с наивысшим приоритетом
        val best = candidates.minByOrNull { it.second }?.first ?: return

        LogUploader.d(TAG, "Best location: ${best.latitude}, ${best.longitude} from ${best.provider}")
        onLocationUpdate(best)
    }

    /**
     * Периодическая проверка качества источников
     */
    private fun startQualityChecker() {
        scope.launch {
            while (isRunning) {
                delay(5000) // Каждые 5 секунд

                // Проверяем активность T-Box
                val tboxAge = System.currentTimeMillis() - lastTBoxUpdate
                if (tboxAge > 120000 && tBoxGpsService != null) {
                    Log.w(TAG, "T-Box GPS stale for ${tboxAge / 1000}s, reconnecting...")
                    tBoxGpsService?.stop()
                    delay(1000)
                    startTBoxGps()
                }

                // Логируем статистику
                if (tboxAge < 10000) {
                    LogUploader.i(TAG, "GPS status: T-Box=OK, AndroidGPS=${if (lastGpsLocation != null) "OK" else "NO"}")
                }
            }
        }
    }

    /**
     * Проверка актуальности локации
     */
    private fun isFresh(
        location: Location,
        maxAgeMs: Long,
    ): Boolean = System.currentTimeMillis() - location.time < maxAgeMs

    /**
     * Получить последнюю известную локацию
     */
    fun getLastLocation(): Location? = lastTBoxLocation ?: lastGpsLocation ?: lastNetworkLocation

    /**
     * Проверить, работает ли T-Box GPS
     */
    fun isTBoxGpsActive(): Boolean {
        val age = System.currentTimeMillis() - lastTBoxUpdate
        return age < 60000
    }

    /**
     * Получить источник лучшей локации
     */
    fun getBestSource(): String {
        if (isTBoxGpsActive()) return "T-Box"
        if (lastGpsLocation != null) return "Android GPS"
        if (lastNetworkLocation != null) return "Network"
        return "Unknown"
    }

    /**
     * Остановить провайдер
     */
    fun stop() {
        isRunning = false
        scope.cancel()
        tBoxGpsService?.stop()
        try {
            locationManager.removeUpdates(locationListener)
        } catch (e: Exception) {
        }
        Log.i(TAG, "FusedLocationProvider stopped")
    }
}
