package com.osmnav.pro.presentation.settings

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.osmnav.pro.databinding.ActivitySettingsBinding

/**
 * Экран настроек приложения
 */
class SettingsActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivitySettingsBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupUI()
    }
    
    private fun setupUI() {
        binding.toolbar.setNavigationOnClickListener { finish() }
        
        // Настройки карты
        binding.switchOfflineMode.setOnCheckedChangeListener { _, isChecked ->
            // Включить/выключить офлайн-режим
        }
        
        binding.switchAvoidTolls.setOnCheckedChangeListener { _, isChecked ->
            // Избегать платных дорог
        }
        
        binding.switchAvoidHighways.setOnCheckedChangeListener { _, isChecked ->
            // Избегать автострад
        }
        
        binding.btnDownloadMaps.setOnClickListener {
            // Скачать офлайн-карты
        }
    }
}
