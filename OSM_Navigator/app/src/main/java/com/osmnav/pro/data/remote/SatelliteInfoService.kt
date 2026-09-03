package com.osmnav.pro.data.remote

import android.annotation.SuppressLint
import android.content.Context
import android.location.GpsStatus
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Сервис для получения информации о спутниках GPS/GNSS
 * Поддерживает: GPS, ГЛОНАСС, BeiDou, Galileo, SBAS, QZSS
 */
@Suppress("DEPRECATION")
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

    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

    // Состояние спутников
    private val _satelliteState = MutableStateFlow<SatelliteState>(SatelliteState())
    val satelliteState: StateFlow<SatelliteState> = _satelliteState.asStateFlow()

    private var gpsStatusListener: GpsStatus.Listener? = null
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
                    val avgCno = if (list.isNotEmpty()) list.map { it.cn0DbHz }.average() else 0.0
                    "$name: ${list.size}($used) avg=${String.format("%.1f", avgCno)}dB"
                }
            return "Всего: $totalSatellites, в фиксе: $usedInFix, acc=${String.format("%.1f", accuracy)}m | ${parts.joinToString(" | ")}"
        }
    }

    /**
     * Информация о спутнике
     */
    data class SatelliteInfo(
        val prn: Int, // PRN номер спутника
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
            // Слушатель GPS статуса
            gpsStatusListener =
                GpsStatus.Listener { event ->
                    when (event) {
                        GpsStatus.GPS_EVENT_SATELLITE_STATUS -> {
                            val status = locationManager.getGpsStatus(null)
                            status?.let { processGpsStatus(it) }
                        }

                        GpsStatus.GPS_EVENT_STARTED -> {
                            Log.i(TAG, "GPS started")
                            LogUploader.i(TAG, "GPS satellite monitoring started")
                        }

                        GpsStatus.GPS_EVENT_STOPPED -> {
                            Log.i(TAG, "GPS stopped")
                        }
                    }
                }

            locationManager.addGpsStatusListener(gpsStatusListener)

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

            Log.i(TAG, "GPS status listener added")
            LogUploader.i(TAG, "SatelliteInfoService started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting GPS monitoring: ${e.message}")
            LogUploader.e(TAG, "SatelliteInfo start error: ${e.message}")
        }
    }

    /**
     * Обработать статус GPS
     */
    private fun processGpsStatus(status: GpsStatus) {
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
                    prn = prn,
                    constellation = constellation.first,
                    constellationName = constellation.second,
                    usedInFix = used,
                    snr = satellite.signalStrength.toFloat(),
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

        // Логируем каждые 10 секунд
        logSatelliteInfo(newState)
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
     * Определить созвездие по PRN номеру
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

        val parts = mutableListOf<String>()

        state.getByConstellation().forEach { (name, sats) ->
            val used = sats.count { it.usedInFix }
            parts.add("$name: ${sats.size}/$used")
        }

        return "Всего: ${state.totalSatellites} | В фиксе: ${state.usedInFix} | Точность: ${String.format(
            "%.1f",
            state.accuracy,
        )}м\n${parts.joinToString("\n")}"
    }

    /**
     * Остановить мониторинг
     */
    fun stop() {
        gpsStatusListener?.let {
            try {
                locationManager.removeGpsStatusListener(it)
            } catch (e: Exception) {
            }
        }
        locationListener?.let {
            try {
                locationManager.removeUpdates(it)
            } catch (e: Exception) {
            }
        }
        gpsStatusListener = null
        locationListener = null
        Log.i(TAG, "SatelliteInfoService stopped")
    }
}
