package com.osmnav.pro.data.remote

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.GnssStatus
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Сервис для получения информации о спутниках GPS/GNSS
 * Поддерживает: GPS, ГЛОНАСС, BeiDou, Galileo, SBAS, QZSS
 * Использует GnssStatus API (Android 10+) с fallback на GpsStatus API
 */
class SatelliteInfoService(
    context: Context,
) {
    companion object {
        private const val TAG = "SatelliteInfo"

        // Константы типов созвездий
        const val CONSTELLATION_GPS = "GPS"
        const val CONSTELLATION_GLONASS = "ГЛОНАСС"
        const val CONSTELLATION_BEIDOU = "BeiDou"
        const val CONSTELLATION_GALILEO = "Galileo"
        const val CONSTELLATION_SBAS = "SBAS"
        const val CONSTELLATION_QZSS = "QZSS"
        const val CONSTELLATION_UNKNOWN = "Unknown"
    }

    private val context = context
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

    // Состояние спутников
    private val _satelliteState = MutableStateFlow<SatelliteState>(SatelliteState())
    val satelliteState: StateFlow<SatelliteState> = _satelliteState.asStateFlow()

    private var gnssStatusCallback: Any? = null
    private var locationListener: LocationListener? = null

    /**
     * Состояние спутников
     */
    data class SatelliteState(
        val totalSatellites: Int = 0,
        val usedInFix: Int = 0,
        val satellites: List<SatelliteInfo> = emptyList(),
        val lastUpdate: Long = 0L,
        val provider: String = "Unknown",
        val accuracy: Float = 0f,
        val hdop: Float = 0f,
    ) {
        fun getByConstellation(): Map<String, List<SatelliteInfo>> = satellites.groupBy { it.constellation }

        fun getSummary(): String {
            val byConst = getByConstellation()
            val parts =
                byConst.map { (name, list) ->
                    val used = list.count { it.usedInFix }
                    val avgCno = if (list.isNotEmpty()) list.map { it.snr }.average() else 0.0
                    "$name: ${list.size}($used) avg=${String.format("%.1f", avgCno)}dB"
                }
            return "Всего: $totalSatellites, в фиксе: $usedInFix, acc=${String.format("%.1f", accuracy)}m | ${parts.joinToString(" | ")}"
        }
    }

    /**
     * Информация о спутнике
     */
    data class SatelliteInfo(
        val svid: Int, // Space Vehicle ID
        val constellationType: Int, // GnssStatus.CONSTELLATION_*
        val constellation: String, // Тип созвездия
        val constellationName: String, // Читаемое имя
        val usedInFix: Boolean, // Используется в определении позиции
        val snr: Float, // Signal-to-Noise Ratio (дБ)
        val elevation: Float = 0f, // Угол возвышения (градусы)
        val azimuth: Float = 0f, // Азимут (градусы)
    ) {
        fun getSignalQuality(): String =
            when {
                snr >= 45 -> "Отличный"
                snr >= 35 -> "Хороший"
                snr >= 25 -> "Средний"
                snr >= 15 -> "Слабый"
                else -> "Очень слабый"
            }

        fun getSignalBars(): Int =
            when {
                snr >= 45 -> 4
                snr >= 35 -> 3
                snr >= 25 -> 2
                snr >= 15 -> 1
                else -> 0
            }
    }

    /**
     * Запустить мониторинг спутников
     */
    @SuppressLint("MissingPermission")
    fun start() {
        try {
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                Log.e(TAG, "Location permission not granted")
                LogUploader.e(TAG, "SatelliteInfo: permission denied")
                return
            }

            // Используем GnssStatus API (Android 10+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startGnssStatusMonitoring()
            } else {
                // Fallback для старых устройств
                startGpsStatusMonitoring()
            }

            // Запрашиваем обновления местоположения для получения точности
            locationListener =
                object : LocationListener {
                    override fun onLocationChanged(location: Location) {
                        updateLocationAccuracy(location)
                    }

                    override fun onStatusChanged(
                        provider: String?,
                        status: Int,
                        extras: Bundle?,
                    ) {}

                    override fun onProviderEnabled(provider: String) {}

                    override fun onProviderDisabled(provider: String) {}
                }

            locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                1000L,
                5f,
                locationListener!!,
                Looper.getMainLooper(),
            )

            Log.i(TAG, "GNSS status listener added (API ${Build.VERSION.SDK_INT})")
            LogUploader.i(TAG, "SatelliteInfoService started (GnssStatus API)")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting GPS monitoring: ${e.message}")
            LogUploader.e(TAG, "SatelliteInfo start error: ${e.message}")
        }
    }

    /**
     * Запуск мониторинга через GnssStatus API (Android 10+)
     */
    @SuppressLint("MissingPermission")
    private fun startGnssStatusMonitoring() {
        try {
            val callback =
                object : android.location.GnssStatus.Callback() {
                    override fun onSatelliteStatusChanged(status: GnssStatus) {
                        processGnssStatus(status)
                    }

                    override fun onStarted() {
                        Log.i(TAG, "GNSS started")
                        LogUploader.i(TAG, "GNSS satellite monitoring started")
                    }

                    override fun onStopped() {
                        Log.i(TAG, "GNSS stopped")
                    }
                }

            gnssStatusCallback = callback

            // Android 11+ (R) требует Executor, Android 10 использует Handler
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                // Создаём явный Executor для Android 11+
                val executor =
                    java.util.concurrent.Executors
                        .newSingleThreadExecutor()
                locationManager.registerGnssStatusCallback(executor, callback)
            } else {
                @Suppress("DEPRECATION")
                locationManager.registerGnssStatusCallback(
                    callback,
                    android.os.Handler(Looper.getMainLooper()),
                )
            }
            Log.i(TAG, "GnssStatus callback registered (API ${Build.VERSION.SDK_INT})")
        } catch (e: Exception) {
            Log.e(TAG, "GnssStatus registration failed: ${e.message}")
            LogUploader.e(TAG, "GnssStatus API error: ${e.message}")
        }
    }

    /**
     * Запуск мониторинга через устаревший GpsStatus API (Android 9 и ниже)
     */
    @SuppressLint("MissingPermission")
    @Suppress("DEPRECATION")
    private fun startGpsStatusMonitoring() {
        try {
            val listener =
                android.location.GpsStatus.Listener { event ->
                    when (event) {
                        android.location.GpsStatus.GPS_EVENT_SATELLITE_STATUS -> {
                            val status = locationManager.getGpsStatus(null)
                            status?.let { processGpsStatusLegacy(it) }
                        }

                        android.location.GpsStatus.GPS_EVENT_STARTED -> {
                            Log.i(TAG, "GPS started")
                            LogUploader.i(TAG, "GPS satellite monitoring started")
                        }

                        android.location.GpsStatus.GPS_EVENT_STOPPED -> {
                            Log.i(TAG, "GPS stopped")
                        }
                    }
                }

            gnssStatusCallback = listener
            locationManager.addGpsStatusListener(listener)
            Log.i(TAG, "GpsStatus callback registered (legacy)")
        } catch (e: Exception) {
            Log.e(TAG, "GpsStatus registration failed: ${e.message}")
            LogUploader.e(TAG, "GpsStatus API error: ${e.message}")
        }
    }

    /**
     * Обработать GnssStatus (Android 10+)
     */
    @SuppressLint("MissingPermission")
    private fun processGnssStatus(status: GnssStatus) {
        val satellites = mutableListOf<SatelliteInfo>()
        var usedInFix = 0

        val satelliteCount = status.satelliteCount
        for (i in 0 until satelliteCount) {
            val svid = status.getSvid(i)
            val constellationType = status.getConstellationType(i)
            val used = status.usedInFix(i)
            val snr = status.getCn0DbHz(i)
            val elevation = status.getElevationDegrees(i)
            val azimuth = status.getAzimuthDegrees(i)

            if (used) usedInFix++

            val constellation = getConstellationName(constellationType)

            satellites.add(
                SatelliteInfo(
                    svid = svid,
                    constellationType = constellationType,
                    constellation = constellation.first,
                    constellationName = constellation.second,
                    usedInFix = used,
                    snr = snr,
                    elevation = elevation,
                    azimuth = azimuth,
                ),
            )
        }

        val state = _satelliteState.value
        val newState =
            state.copy(
                totalSatellites = satellites.size,
                usedInFix = usedInFix,
                satellites = satellites,
                lastUpdate = System.currentTimeMillis(),
                provider = "GNSS",
            )

        _satelliteState.value = newState
        logSatelliteInfo(newState)
    }

    /**
     * Обработать устаревший GpsStatus (Android 9 и ниже)
     */
    @Suppress("DEPRECATION")
    private fun processGpsStatusLegacy(status: android.location.GpsStatus) {
        val satellites = mutableListOf<SatelliteInfo>()
        var usedInFix = 0

        val iterator = status.getSatellites().iterator()
        while (iterator.hasNext()) {
            val satellite = iterator.next()

            val used = satellite.usedInFix()
            if (used) usedInFix++

            // Определяем созвездие по PRN
            val prn = satellite.prn
            val constellation = getConstellationByPrn(prn)

            satellites.add(
                SatelliteInfo(
                    svid = prn,
                    constellationType = getConstellationType(prn),
                    constellation = constellation.first,
                    constellationName = constellation.second,
                    usedInFix = used,
                    snr = satellite.getSnr(),
                    elevation = satellite.elevation,
                    azimuth = satellite.azimuth,
                ),
            )
        }

        val state = _satelliteState.value
        val newState =
            state.copy(
                totalSatellites = satellites.size,
                usedInFix = usedInFix,
                satellites = satellites,
                lastUpdate = System.currentTimeMillis(),
                provider = "GPS",
            )

        _satelliteState.value = newState
        logSatelliteInfo(newState)
    }

    /**
     * Определить созвездие по типу GnssStatus (Android 10+)
     */
    private fun getConstellationName(constellationType: Int): Pair<String, String> =
        when (constellationType) {
            GnssStatus.CONSTELLATION_GPS -> CONSTELLATION_GPS to "GPS 🇺🇸"
            GnssStatus.CONSTELLATION_GLONASS -> CONSTELLATION_GLONASS to "ГЛОНАСС 🇷🇺"
            GnssStatus.CONSTELLATION_BEIDOU -> CONSTELLATION_BEIDOU to "BeiDou 🇨🇳"
            GnssStatus.CONSTELLATION_GALILEO -> CONSTELLATION_GALILEO to "Galileo 🇪🇺"
            GnssStatus.CONSTELLATION_QZSS -> CONSTELLATION_QZSS to "QZSS 🇯🇵"
            GnssStatus.CONSTELLATION_SBAS -> CONSTELLATION_SBAS to "SBAS"
            else -> CONSTELLATION_UNKNOWN to "Неизвестно"
        }

    /**
     * Определить созвездие по PRN номеру (legacy)
     * PRN 1-32: GPS
     * PRN 33-64: ГЛОНАСС
     * PRN 65-96: Galileo
     * PRN 121-160: BeiDou
     * PRN 183-192: QZSS
     * PRN 193-197: SBAS
     */
    private fun getConstellationByPrn(prn: Int): Pair<String, String> =
        when (prn) {
            in 1..32 -> CONSTELLATION_GPS to "GPS 🇺🇸"
            in 33..64 -> CONSTELLATION_GLONASS to "ГЛОНАСС 🇷🇺"
            in 65..96 -> CONSTELLATION_GALILEO to "Galileo 🇪🇺"
            in 121..160 -> CONSTELLATION_BEIDOU to "BeiDou 🇨🇳"
            in 183..192 -> CONSTELLATION_QZSS to "QZSS 🇯🇵"
            in 193..197 -> CONSTELLATION_SBAS to "SBAS"
            in 200..300 -> CONSTELLATION_GLONASS to "ГЛОНАСС 🇷🇺"
            else -> CONSTELLATION_UNKNOWN to "Неизвестно"
        }

    /**
     * Получить тип созвездия по PRN (для legacy)
     */
    private fun getConstellationType(prn: Int): Int =
        when (prn) {
            in 1..32 -> GnssStatus.CONSTELLATION_GPS
            in 33..64 -> GnssStatus.CONSTELLATION_GLONASS
            in 65..96 -> GnssStatus.CONSTELLATION_GALILEO
            in 121..160 -> GnssStatus.CONSTELLATION_BEIDOU
            in 183..192 -> GnssStatus.CONSTELLATION_QZSS
            in 193..197 -> GnssStatus.CONSTELLATION_SBAS
            else -> GnssStatus.CONSTELLATION_UNKNOWN
        }

    /**
     * Обновить точность из локации
     */
    private fun updateLocationAccuracy(location: Location) {
        val currentState = _satelliteState.value
        if (currentState.accuracy != location.accuracy) {
            _satelliteState.value =
                currentState.copy(
                    accuracy = location.accuracy,
                    lastUpdate = System.currentTimeMillis(),
                )

            LogUploader.d(TAG, "GPS accuracy: ${location.accuracy}m, provider=${location.provider}")
        }
    }

    /**
     * Логировать информацию о спутниках
     */
    private fun logSatelliteInfo(state: SatelliteState) {
        if (state.totalSatellites == 0) return

        val byConst = state.getByConstellation()
        val details =
            byConst.map { (name, sats) ->
                val used = sats.count { it.usedInFix }
                val avgSnr = if (sats.isNotEmpty()) sats.map { it.snr }.average() else 0.0
                "$name: ${sats.size}($used) avg=${String.format("%.1f", avgSnr)}dB"
            }

        LogUploader.i(
            TAG,
            "Satellites: total=${state.totalSatellites} used=${state.usedInFix} acc=${String.format(
                "%.1f",
                state.accuracy,
            )}m | ${details.joinToString(" | ")}",
        )
    }

    /**
     * Получить текстовую сводку для UI
     */
    fun getSummary(): String {
        val state = _satelliteState.value
        if (state.totalSatellites == 0) {
            return "Спутники не обнаружены"
        }

        return "Спутников: ${state.totalSatellites}, в фиксе: ${state.usedInFix}, точность: ${String.format("%.1f", state.accuracy)}м"
    }

    /**
     * Остановить мониторинг
     */
    fun stop() {
        try {
            // Останавливаем GnssStatus callback
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && gnssStatusCallback is android.location.GnssStatus.Callback) {
                locationManager.unregisterGnssStatusCallback(gnssStatusCallback as android.location.GnssStatus.Callback)
            } else if (gnssStatusCallback is android.location.GpsStatus.Listener) {
                @Suppress("DEPRECATION")
                locationManager.removeGpsStatusListener(gnssStatusCallback as android.location.GpsStatus.Listener)
            }

            // Останавливаем location updates
            locationListener?.let {
                locationManager.removeUpdates(it)
            }

            Log.i(TAG, "SatelliteInfoService stopped")
            LogUploader.i(TAG, "SatelliteInfoService stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping service: ${e.message}")
        }
    }

    /**
     * Загрузить текущее состояние спутников на сервер
     */
    fun uploadCurrentSatellites(
        latitude: Double = 0.0,
        longitude: Double = 0.0,
        altitude: Double = 0.0,
    ) {
        val state = _satelliteState.value
        val byConst = state.getByConstellation()
        val json =
            org.json.JSONObject().apply {
                put("totalSatellites", state.totalSatellites)
                put("usedInFix", state.usedInFix)
                put("gps", byConst["GPS"]?.size ?: 0)
                put("glonass", byConst["ГЛОНАСС"]?.size ?: 0)
                put("beidou", byConst["BeiDou"]?.size ?: 0)
                put("galileo", byConst["Galileo"]?.size ?: 0)
                put("sbas", byConst["SBAS"]?.size ?: 0)
                put("qzss", byConst["QZSS"]?.size ?: 0)
                put("provider", state.provider)
                put("accuracy", state.accuracy.toDouble())
                put("latitude", latitude)
                put("longitude", longitude)
                put("altitude", altitude)
            }
        LogUploader.uploadSatellites(json)
    }
}
