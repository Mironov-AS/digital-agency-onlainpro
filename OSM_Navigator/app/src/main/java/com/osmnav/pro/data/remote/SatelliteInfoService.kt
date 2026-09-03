package com.osmnav.pro.data.remote

import android.annotation.SuppressLint
import android.content.Context
import android.location.GnssStatus
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Сервис для получения информации о спутниках GNSS
 * Поддерживает: GPS, ГЛОНАСС, BeiDou, Galileo, SBAS, QZSS
 */
class SatelliteInfoService(
    context: Context,
) {
    companion object {
        private const val TAG = "SatelliteInfo"

        // Константы типов спутников из GnssStatus
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

    private var gnssCallback: GnssStatus.Callback? = null

    /**
     * Состояние спутников
     */
    data class SatelliteState(
        val totalSatellites: Int = 0,
        val usedInFix: Int = 0,
        val satellites: List<SatelliteInfo> = emptyList(),
        val lastUpdate: Long = 0L,
        val provider: String = "Unknown",
    ) {
        fun getByConstellation(): Map<String, List<SatelliteInfo>> = satellites.groupBy { it.constellation }

        fun getSummary(): String {
            val byConst = getByConstellation()
            val parts =
                byConst.map { (name, list) ->
                    val used = list.count { it.usedInFix }
                    "$name: ${list.size}($used)"
                }
            return "Всего: $totalSatellites, в фиксе: $usedInFix | ${parts.joinToString(", ")}"
        }
    }

    /**
     * Информация о спутнике
     */
    data class SatelliteInfo(
        val svid: Int, // Space Vehicle ID
        val constellation: String, // Тип созвездия
        val constellationName: String, // Читаемое имя
        val usedInFix: Boolean, // Используется в определении позиции
        val elevation: Float, // Угол возвышения (градусы)
        val azimuth: Float, // Азимут (градусы)
        val cn0DbHz: Float, // Отношение сигнал/шум (дБГц)
        val carrierFrequencyHz: Float = 0f,
    ) {
        fun getSignalQuality(): String =
            when {
                cn0DbHz >= 45 -> "Отличный"
                cn0DbHz >= 35 -> "Хороший"
                cn0DbHz >= 25 -> "Средний"
                cn0DbHz >= 15 -> "Слабый"
                else -> "Очень слабый"
            }

        fun getSignalBars(): Int =
            when {
                cn0DbHz >= 45 -> 4
                cn0DbHz >= 35 -> 3
                cn0DbHz >= 25 -> 2
                cn0DbHz >= 15 -> 1
                else -> 0
            }
    }

    /**
     * Запустить мониторинг спутников
     */
    @SuppressLint("MissingPermission")
    fun start() {
        try {
            gnssCallback =
                object : GnssStatus.Callback() {
                    override fun onSatelliteStatusChanged(status: GnssStatus) {
                        processGnssStatus(status)
                    }

                    override fun onStarted() {
                        Log.i(TAG, "GNSS monitoring started")
                        LogUploader.i(TAG, "GNSS satellite monitoring started")
                    }

                    override fun onStopped() {
                        Log.i(TAG, "GNSS monitoring stopped")
                    }
                }

            locationManager.registerGnssCallback(gnssCallback!!, Handler(Looper.getMainLooper()))
            Log.i(TAG, "Registered GNSS callback")
        } catch (e: Exception) {
            Log.e(TAG, "Error registering GNSS callback: ${e.message}")
            LogUploader.e(TAG, "GNSS callback error: ${e.message}")
        }
    }

    /**
     * Обработать статус GNSS
     */
    private fun processGnssStatus(status: GnssStatus) {
        val satellites = mutableListOf<SatelliteInfo>()
        var usedInFix = 0

        val satelliteCount = status.satelliteCount
        for (i in 0 until satelliteCount) {
            val svId = status.getSvid(i)
            val constellationType = status.getConstellationType(i)
            val constellation = getConstellationName(constellationType)
            val used = status.usedInFix(i)
            val elevation = status.getElevation(i)
            val azimuth = status.getAzimuth(i)
            val cn0 = status.getCn0DbHz(i)
            val freq =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    status.getCarrierFrequencyHz(i)
                } else {
                    0f
                }

            if (used) usedInFix++

            satellites.add(
                SatelliteInfo(
                    svid = svId,
                    constellation = constellation,
                    constellationName = getConstellationReadName(constellationType),
                    usedInFix = used,
                    elevation = elevation,
                    azimuth = azimuth,
                    cn0DbHz = cn0,
                    carrierFrequencyHz = freq,
                ),
            )
        }

        val state =
            SatelliteState(
                totalSatellites = satelliteCount,
                usedInFix = usedInFix,
                satellites = satellites,
                lastUpdate = System.currentTimeMillis(),
                provider = "GNSS",
            )

        _satelliteState.value = state

        // Логируем каждые 10 секунд (не чаще)
        if (System.currentTimeMillis() - state.lastUpdate < 100) {
            return
        }

        logSatelliteInfo(state)
    }

    /**
     * Получить название созвездия по типу
     */
    private fun getConstellationName(type: Int): String =
        when (type) {
            GnssStatus.CONSTELLATION_GPS -> CONSTELLATION_GPS
            GnssStatus.CONSTELLATION_GLONASS -> CONSTELLATION_GLONASS
            GnssStatus.CONSTELLATION_BEIDOU -> CONSTELLATION_BEIDOU
            GnssStatus.CONSTELLATION_GALILEO -> CONSTELLATION_GALILEO
            GnssStatus.CONSTELLATION_SBAS -> CONSTELLATION_SBAS
            GnssStatus.CONSTELLATION_QZSS -> CONSTELLATION_QZSS
            else -> CONSTELLATION_UNKNOWN
        }

    private fun getConstellationReadName(type: Int): String =
        when (type) {
            GnssStatus.CONSTELLATION_GPS -> "GPS 🇺🇸"
            GnssStatus.CONSTELLATION_GLONASS -> "ГЛОНАСС 🇷🇺"
            GnssStatus.CONSTELLATION_BEIDOU -> "BeiDou 🇨🇳"
            GnssStatus.CONSTELLATION_GALILEO -> "Galileo 🇪🇺"
            GnssStatus.CONSTELLATION_SBAS -> "SBAS"
            GnssStatus.CONSTELLATION_QZSS -> "QZSS 🇯🇵"
            else -> "Неизвестно"
        }

    /**
     * Логировать информацию о спутниках
     */
    private fun logSatelliteInfo(state: SatelliteState) {
        if (state.totalSatellites == 0) {
            LogUploader.w(TAG, "No satellites visible")
            return
        }

        val byConst = state.getByConstellation()
        val details =
            byConst.map { (name, sats) ->
                val used = sats.count { it.usedInFix }
                val avgCno = if (sats.isNotEmpty()) sats.map { it.cn0DbHz }.average() else 0.0
                "$name: ${sats.size}($used) avgCN0=${String.format("%.1f", avgCno)}dBHz"
            }

        LogUploader.i(TAG, "Satellites: total=${state.totalSatellites} used=${state.usedInFix} | ${details.joinToString(" | ")}")
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

        return "Всего: ${state.totalSatellites} | В фиксе: ${state.usedInFix}\n${parts.joinToString("\n")}"
    }

    /**
     * Остановить мониторинг
     */
    fun stop() {
        gnssCallback?.let {
            try {
                locationManager.unregisterGnssCallback(it)
            } catch (e: Exception) {
            }
        }
        gnssCallback = null
    }
}
