package com.osmnav.pro

import android.app.Application
import org.osmdroid.config.Configuration
import java.io.File

/**
 * OSM Navigator Pro - Главный класс приложения
 */
class OSMNavApp : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Настройка osmdroid
        Configuration.getInstance().apply {
            userAgentValue = packageName
            
            // Папка для офлайн-данных
            osmdroidBasePath = File(cacheDir, "osmdroid")
            osmdroidTileCache = File(osmdroidBasePath, "tiles")
            
            // Настройки кэширования
            tileFileSystemCacheMaxBytes = 100L * 1024 * 1024 // 100MB
            tileFileSystemCacheTrimBytes = 80L * 1024 * 1024  // 80MB
        }
    }
}
