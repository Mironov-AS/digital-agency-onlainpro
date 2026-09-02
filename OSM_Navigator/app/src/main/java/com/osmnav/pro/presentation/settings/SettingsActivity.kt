package com.osmnav.pro.presentation.settings

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.osmnav.pro.R
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        mapDownloader = OfflineMapDownloader(this)

        setupUI()
        updateCacheInfo()
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
    }
}
