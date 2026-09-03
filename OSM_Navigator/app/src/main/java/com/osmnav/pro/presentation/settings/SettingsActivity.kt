package com.osmnav.pro.presentation.settings

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.osmnav.pro.R
import com.osmnav.pro.data.remote.LogUploader
import com.osmnav.pro.data.remote.SatelliteInfoService
import com.osmnav.pro.data.remote.TBoxTelemetryService
import com.osmnav.pro.data.util.DownloadProgress
import com.osmnav.pro.data.util.OfflineMapDownloader
import com.osmnav.pro.databinding.ActivitySettingsBinding
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

/**
 * Экран настроек приложения
 */
class SettingsActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySettingsBinding
    private lateinit var mapDownloader: OfflineMapDownloader
    private var downloadJob: Job? = null
    private var downloadDialog: AlertDialog? = null
    private var satelliteService: SatelliteInfoService? = null
    private var telemetryService: TBoxTelemetryService? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        mapDownloader = OfflineMapDownloader(this)

        setupUI()
        updateCacheInfo()
        setupSatelliteMonitor()
        setupTelemetryMonitor()
    }

    private fun setupTelemetryMonitor() {
        // Используем синглтон - получаем те же данные что и MainActivity
        telemetryService = TBoxTelemetryService.shared

        // Наблюдаем за обновлениями телематики
        lifecycleScope.launch {
            telemetryService?.telemetryState?.collect { state ->
                updateTelemetryUI(state)
            }
        }

        LogUploader.i("SettingsActivity", "Telemetry monitor started (singleton)")
    }

    private fun updateTelemetryUI(state: TBoxTelemetryService.ExtendedVehicleTelemetry) {
        // Статус подключения
        if (state.isConnected) {
            binding.ivTelemetryStatus.setImageResource(android.R.drawable.presence_online)
            binding.tvTelemetryStatus.text = "Подключено"
        } else {
            binding.ivTelemetryStatus.setImageResource(android.R.drawable.presence_invisible)
            binding.tvTelemetryStatus.text = "Отключено"
        }

        // === БАТАРЕЯ ===
        binding.tvBatterySoc.text = "${state.batterySoc}%"
        binding.progressBatterySoc.progress = state.batterySoc

        // Цвет SOC
        val socColor =
            when {
                state.batterySoc <= 20 -> ContextCompat.getColor(this, R.color.error)
                state.batterySoc <= 50 -> ContextCompat.getColor(this, R.color.warning)
                else -> ContextCompat.getColor(this, R.color.charging_green)
            }
        binding.tvBatterySoc.setTextColor(socColor)

        binding.tvBatteryVoltage.text = "${String.format("%.1f", state.batteryVoltage)} V"
        binding.tvBatteryCurrent.text = "${String.format("%.1f", state.batteryCurrent)} A"
        binding.tvBatteryTemp.text = "${state.batteryTemp} °C"
        binding.tvBatteryTempRange.text = "${state.batteryMaxTemp}/${state.batteryMinTemp} °C"

        // === ДВИГАТЕЛЬ ===
        binding.tvSpeed.text = "${state.speed} км/ч"
        binding.tvMotorSpeed.text = "${state.motorSpeed} об/мин"
        binding.tvMotorTorque.text = "${String.format("%.1f", state.motorTorque)} Нм"
        binding.tvMotorPower.text = "${state.motorPower} кВт"
        binding.tvMotorTemp.text = "${state.motorTemp} °C"

        // === АВТОМОБИЛЬ ===
        binding.tvOdometer.text = "${state.odometer} км"
        binding.tvGear.text = state.gear.shortName
        binding.tvIgnition.text = state.ignitionStatus.displayName
        binding.tvDoors.text = state.doorStatus.displayName

        // === ЗАРЯДКА ===
        binding.tvChargingStatus.text = state.chargingStatus.displayName
        binding.tvChargeGun.text = if (state.chargeGunConnected) "Подключен" else "Отключен"

        // Цвет статуса зарядки
        val chargingColor =
            when (state.chargingStatus) {
                TBoxTelemetryService.ChargingStatus.SLOW_CHARGE,
                TBoxTelemetryService.ChargingStatus.FAST_CHARGE,
                TBoxTelemetryService.ChargingStatus.TRICKLE_CHARGE,
                -> ContextCompat.getColor(this, R.color.charging_green)

                TBoxTelemetryService.ChargingStatus.COMPLETED -> ContextCompat.getColor(this, R.color.success)

                TBoxTelemetryService.ChargingStatus.ERROR -> ContextCompat.getColor(this, R.color.error)

                else -> ContextCompat.getColor(this, R.color.on_surface_variant)
            }
        binding.tvChargingStatus.setTextColor(chargingColor)

        // === ОХЛАЖДЕНИЕ ===
        binding.tvCoolantTemp.text = "${state.coolantTemp} °C"

        // === TPMS ===
        binding.tvTireFL.text = "${String.format("%.1f", state.tireFLPressure)} PSI"
        binding.tvTireFR.text = "${String.format("%.1f", state.tireFRPressure)} PSI"
        binding.tvTireRL.text = "${String.format("%.1f", state.tireRLPressure)} PSI"
        binding.tvTireRR.text = "${String.format("%.1f", state.tireRRPressure)} PSI"

        // === 12V ===
        binding.tvBattery12V.text = "${String.format("%.1f", state.battery12V)} V"

        // === CAN ===
        binding.tvCanFrames.text = "CAN фреймов: ${state.canFramesReceived}"

        // Время обновления
        if (state.lastUpdate > 0) {
            val updateTime =
                java.text
                    .SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault())
                    .format(java.util.Date(state.lastUpdate))
            binding.tvLastTelemetryUpdate.text = "Обновление: $updateTime"
        }

        // Логируем телематику каждые 30 секунд
        if (state.lastUpdate > 0 && System.currentTimeMillis() - state.lastUpdate < 31000) {
            LogUploader.d("SettingsActivity", "Telemetry: ${telemetryService?.getTelemetrySummary()}")
        }
    }

    private fun setupSatelliteMonitor() {
        // Проверяем разрешение
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED
        ) {
            binding.tvSatellitesTotal.text = "--"
            binding.tvSatellitesUsed.text = "--"
            binding.tvLastSatelliteUpdate.text = "Нет разрешения на геолокацию"
            return
        }

        satelliteService = SatelliteInfoService(this)
        satelliteService?.start()

        // Наблюдаем за изменениями
        lifecycleScope.launch {
            satelliteService?.satelliteState?.collect { state ->
                updateSatelliteUI(state)
            }
        }
    }

    private fun updateSatelliteUI(state: SatelliteInfoService.SatelliteState) {
        binding.tvSatellitesTotal.text = state.totalSatellites.toString()
        binding.tvSatellitesUsed.text = state.usedInFix.toString()

        // Обновляем прогресс-бары
        val byConst = state.getByConstellation()

        val gpsSats = byConst["GPS"] ?: emptyList()
        val glonassSats = byConst["ГЛОНАСС"] ?: emptyList()
        val beidouSats = byConst["BeiDou"] ?: emptyList()
        val galileoSats = byConst["Galileo"] ?: emptyList()

        binding.tvGpsCount.text = gpsSats.size.toString()
        binding.progressGps.progress = gpsSats.size

        binding.tvGlonassCount.text = glonassSats.size.toString()
        binding.progressGlonass.progress = glonassSats.size

        binding.tvBeidouCount.text = beidouSats.size.toString()
        binding.progressBeidou.progress = beidouSats.size

        binding.tvGalileoCount.text = galileoSats.size.toString()
        binding.progressGalileo.progress = galileoSats.size

        // Время обновления
        val updateTime =
            java.text
                .SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault())
                .format(java.util.Date(state.lastUpdate))
        binding.tvLastSatelliteUpdate.text = "Обновление: $updateTime"

        // Логируем каждые 10 секунд
        if (System.currentTimeMillis() - state.lastUpdate < 11000) {
            LogUploader.i("SettingsActivity", "Satellite state: ${state.getSummary()}")
        }
    }

    private fun setupUI() {
        binding.toolbar.setNavigationOnClickListener { finish() }

        // Офлайн-режим
        binding.switchOfflineMode.setOnCheckedChangeListener { _, isChecked ->
            // Сохраняем настройку
            getSharedPreferences("osmnav_prefs", MODE_PRIVATE)
                .edit()
                .putBoolean("offline_mode", isChecked)
                .apply()
        }

        // Загрузка текущего состояния
        val prefs = getSharedPreferences("osmnav_prefs", MODE_PRIVATE)
        binding.switchOfflineMode.isChecked = prefs.getBoolean("offline_mode", false)

        // Избегать платных дорог
        binding.switchAvoidTolls.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean("avoid_tolls", isChecked).apply()
        }
        binding.switchAvoidTolls.isChecked = prefs.getBoolean("avoid_tolls", false)

        // Избегать автострад
        binding.switchAvoidHighways.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean("avoid_highways", isChecked).apply()
        }
        binding.switchAvoidHighways.isChecked = prefs.getBoolean("avoid_highways", false)

        // Избегать паромов
        binding.switchAvoidFerries.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean("avoid_ferries", isChecked).apply()
        }
        binding.switchAvoidFerries.isChecked = prefs.getBoolean("avoid_ferries", true)

        // Скачать карты
        binding.btnDownloadMaps.setOnClickListener {
            showDownloadDialog()
        }

        // Зарядные станции - показывать ближайшую
        binding.switchShowChargingStations.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean("show_nearest_charging", isChecked).apply()
        }
        binding.switchShowChargingStations.isChecked = prefs.getBoolean("show_nearest_charging", false)

        // Типы разъёмов
        setupConnectorChips(prefs)
    }

    private fun setupConnectorChips(prefs: android.content.SharedPreferences) {
        // Загружаем сохранённые типы
        val savedConnectors = prefs.getStringSet("charging_connectors", setOf("CCS", "Type 2")) ?: setOf("CCS", "Type 2")

        binding.chipCcs.isChecked = savedConnectors.contains("CCS")
        binding.chipType2.isChecked = savedConnectors.contains("Type 2")
        binding.chipChademo.isChecked = savedConnectors.contains("CHAdeMO")
        binding.chipTesla.isChecked = savedConnectors.contains("Tesla")

        // Сохраняем при изменении
        val listener =
            android.widget.CompoundButton.OnCheckedChangeListener { _, _ ->
                saveConnectorPreferences()
            }

        binding.chipCcs.setOnCheckedChangeListener(listener)
        binding.chipType2.setOnCheckedChangeListener(listener)
        binding.chipChademo.setOnCheckedChangeListener(listener)
        binding.chipTesla.setOnCheckedChangeListener(listener)
    }

    private fun saveConnectorPreferences() {
        val connectors = mutableSetOf<String>()
        if (binding.chipCcs.isChecked) connectors.add("CCS")
        if (binding.chipType2.isChecked) connectors.add("Type 2")
        if (binding.chipChademo.isChecked) connectors.add("CHAdeMO")
        if (binding.chipTesla.isChecked) connectors.add("Tesla")

        // Если ничего не выбрано, выбираем CCS по умолчанию
        if (connectors.isEmpty()) {
            connectors.add("CCS")
            binding.chipCcs.isChecked = true
        }

        getSharedPreferences("osmnav_prefs", MODE_PRIVATE)
            .edit()
            .putStringSet("charging_connectors", connectors)
            .apply()
    }

    companion object {
        /**
         * Получить выбранные типы разъёмов
         */
        fun getSelectedConnectors(prefs: android.content.SharedPreferences): Set<String> =
            prefs.getStringSet("charging_connectors", setOf("CCS", "Type 2")) ?: setOf("CCS", "Type 2")
    }

    private fun updateCacheInfo() {
        val size = mapDownloader.getDownloadedMapsSize()
        if (size > 0) {
            val sizeMB = size / (1024 * 1024)
            binding.btnDownloadMaps.text = "Скачать карты для России (загружено: $sizeMB MB)"
        }
    }

    private fun showDownloadDialog() {
        val regions =
            arrayOf(
                "Россия (все регионы)",
                "Москва и область",
                "Санкт-Петербург и область",
                "Другой регион",
            )

        AlertDialog
            .Builder(this)
            .setTitle("Скачать офлайн-карты")
            .setItems(regions) { _, which ->
                when (which) {
                    0 -> startDownloadRussia()
                    1 -> startDownloadMoscow()
                    2 -> startDownloadSpb()
                    3 -> showCustomRegionDialog()
                }
            }.setNegativeButton("Отмена", null)
            .show()
    }

    private fun startDownloadRussia() {
        startDownload(
            OfflineMapDownloader.RUSSIA_BOUNDING_BOX,
            "Скачивание карты России...",
        )
    }

    private fun startDownloadMoscow() {
        startDownload(
            OfflineMapDownloader.MOSCOW_BOUNDING_BOX,
            "Скачивание карты Москвы...",
        )
    }

    private fun startDownloadSpb() {
        startDownload(
            OfflineMapDownloader.SPB_BOUNDING_BOX,
            "Скачивание карты Санкт-Петербурга...",
        )
    }

    private fun showCustomRegionDialog() {
        Toast.makeText(this, "Для выбора региона используйте карту в главном экране", Toast.LENGTH_LONG).show()
    }

    private fun startDownload(
        boundingBox: org.osmdroid.util.BoundingBox,
        title: String,
    ) {
        // Отменяем предыдущую загрузку
        downloadJob?.cancel()

        val progressView = layoutInflater.inflate(R.layout.dialog_download_progress, null)

        downloadDialog =
            AlertDialog
                .Builder(this)
                .setTitle(title)
                .setView(progressView)
                .setCancelable(false)
                .setNegativeButton("Отмена") { _, _ ->
                    downloadJob?.cancel()
                    Toast.makeText(this, "Загрузка отменена", Toast.LENGTH_SHORT).show()
                }.create()

        downloadDialog?.show()

        downloadJob =
            lifecycleScope.launch {
                mapDownloader.downloadRegion(boundingBox, 10, 14).collect { progress ->
                    updateProgressDialog(progress)
                }
            }
    }

    private fun updateProgressDialog(progress: DownloadProgress) {
        if (progress.isComplete) {
            downloadDialog?.dismiss()
            val sizeMB = mapDownloader.getDownloadedMapsSize() / (1024 * 1024)
            Toast
                .makeText(
                    this,
                    "Загрузка завершена! Размер: $sizeMB MB",
                    Toast.LENGTH_LONG,
                ).show()
            updateCacheInfo()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        downloadJob?.cancel()
        downloadDialog?.dismiss()
        satelliteService?.stop()
    }
}
