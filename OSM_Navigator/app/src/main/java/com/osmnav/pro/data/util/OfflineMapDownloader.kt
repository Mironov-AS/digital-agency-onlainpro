package com.osmnav.pro.data.util

import android.content.Context
import android.util.Log
import com.osmnav.pro.domain.model.Location
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.cachemanager.CacheManager
import org.osmdroid.tileprovider.cachemanager.DownloadManagerListener
import org.osmdroid.tileprovider.cachemanager.TileLoader
import org.osmdroid.tileprovider.cachemanager.TileLoaderListener
import org.osmdroid.tileprovider.modules.SqlTileWriter
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.BoundingBox
import org.osmdroid.util.BoundingBoxString
import org.osmdroid.util.GeoPoint
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit

/**
 * Утилита для скачивания офлайн-карт
 */
class OfflineMapDownloader(
    private val context: Context,
) {
    private val okHttpClient =
        OkHttpClient
            .Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

    companion object {
        private const val TAG = "OfflineMapDownloader"

        // zoom levels to download
        const val MIN_ZOOM = 10
        const val MAX_ZOOM = 16

        // Россия и основные города
        val RUSSIA_BOUNDING_BOX =
            BoundingBox(
                41.0, // northLat
                180.0, // southLat (wrap around)
                55.0, // eastLon
                19.0, // westLon
            )

        // Москва
        val MOSCOW_BOUNDING_BOX =
            BoundingBox(
                56.1, // northLat
                37.1, // southLat
                38.1, // eastLon
                36.1, // westLon
            )

        // Санкт-Петербург
        val SPB_BOUNDING_BOX =
            BoundingBox(
                60.2, // northLat
                29.5, // southLat
                30.8, // eastLon
                29.3, // westLon
            )
    }

    /**
     * Скачать карту для указанного региона
     * @param boundingBox границы региона
     * @param minZoom минимальный зум
     * @param maxZoom максимальный зум
     * @return Flow с прогрессом скачивания
     */
    fun downloadRegion(
        boundingBox: BoundingBox,
        minZoom: Int = MIN_ZOOM,
        maxZoom: Int = MAX_ZOOM,
    ): Flow<DownloadProgress> =
        flow {
            Log.d(TAG, "Starting download for bounding box: $boundingBox")
            Log.d(TAG, "Zoom levels: $minZoom - $maxZoom")

            // Проверяем свободное место
            val freeSpace = getAvailableSpace()
            Log.d(TAG, "Available space: $freeSpace MB")

            // Считаем примерное количество тайлов
            val estimatedTiles = estimateTileCount(boundingBox, minZoom, maxZoom)
            Log.d(TAG, "Estimated tiles to download: $estimatedTiles")

            var downloadedTiles = 0

            // Скачиваем тайлы для каждого зума
            for (zoom in minZoom..maxZoom) {
                val tilesInZoom = countTilesInZoom(boundingBox, zoom)

                for (tile in tilesInZoom) {
                    try {
                        val url = buildTileUrl(tile.x, tile.y, zoom)
                        val tileFile = getTileFile(tile.x, tile.y, zoom)

                        if (!tileFile.exists()) {
                            val success = downloadTile(url, tileFile)
                            if (success) {
                                downloadedTiles++
                            }
                        } else {
                            downloadedTiles++
                        }

                        // Отправляем прогресс
                        val progress = downloadedTiles.toFloat() / estimatedTiles.toFloat() * 100
                        emit(
                            DownloadProgress(
                                downloadedTiles = downloadedTiles,
                                totalTiles = estimatedTiles,
                                progressPercent = progress.toInt(),
                                currentZoom = zoom,
                                currentTile = tile,
                            ),
                        )
                    } catch (e: Exception) {
                        Log.w(TAG, "Failed to download tile: ${tile.x}, ${tile.y}, zoom=$zoom", e)
                    }
                }
            }

            emit(
                DownloadProgress(
                    downloadedTiles = downloadedTiles,
                    totalTiles = estimatedTiles,
                    progressPercent = 100,
                    currentZoom = maxZoom,
                    currentTile = null,
                    isComplete = true,
                ),
            )

            Log.d(TAG, "Download complete! Tiles downloaded: $downloadedTiles")
        }

    /**
     * Построить URL для тайла
     */
    private fun buildTileUrl(
        x: Int,
        y: Int,
        zoom: Int,
    ): String {
        // Используем OSM тайлы
        return "https://tile.openstreetmap.org/$zoom/$x/$y.png"
    }

    /**
     * Получить файл для сохранения тайла
     */
    private fun getTileFile(
        x: Int,
        y: Int,
        zoom: Int,
    ): File {
        val tileCache = Configuration.getInstance().osmdroidTileCache
        return File(tileCache, "$zoom/$x/$y.png")
    }

    /**
     * Скачать один тайл
     */
    private suspend fun downloadTile(
        url: String,
        destFile: File,
    ): Boolean =
        withContext(Dispatchers.IO) {
            try {
                // Создаем директорию
                destFile.parentFile?.mkdirs()

                val request =
                    Request
                        .Builder()
                        .url(url)
                        .header("User-Agent", "OSMNavigator/1.0")
                        .build()

                val response = okHttpClient.newCall(request).execute()

                if (response.isSuccessful) {
                    response.body?.byteStream()?.use { input ->
                        FileOutputStream(destFile).use { output ->
                            input.copyTo(output)
                        }
                    }
                    true
                } else {
                    Log.w(TAG, "Tile download failed: ${response.code} for $url")
                    false
                }
            } catch (e: Exception) {
                Log.w(TAG, "Error downloading tile: $url", e)
                false
            }
        }

    /**
     * Оценить количество тайлов
     */
    private fun estimateTileCount(
        bbox: BoundingBox,
        minZoom: Int,
        maxZoom: Int,
    ): Int {
        var count = 0
        for (zoom in minZoom..maxZoom) {
            count += countTilesInZoom(bbox, zoom).size
        }
        return count
    }

    /**
     * Подсчитать тайлы для конкретного зума
     */
    private fun countTilesInZoom(
        bbox: BoundingBox,
        zoom: Int,
    ): List<TileCoord> {
        val tiles = mutableListOf<TileCoord>()

        val n = Math.pow(2.0, zoom.toDouble()).toInt()

        // Используем метод MercatorProjection для конвертации координат
        val northLat = bbox.latNorth.coerceAtMost(85.05112878)
        val southLat = bbox.latSouth.coerceAtLeast(-85.05112878)

        // Конвертируем широту в Y
        val northY = latToTileY(northLat, zoom)
        val southY = latToTileY(southLat, zoom)

        // Конвертируем долготу в X
        val westX = lonToTileX(bbox.lonWest, zoom)
        val eastX = lonToTileX(bbox.lonEast, zoom)

        // Итерация по X
        val minX = minOf(westX, eastX).coerceIn(0, n - 1)
        val maxX = maxOf(westX, eastX).coerceIn(0, n - 1)

        // Итерация по Y
        val minY = southY.coerceIn(0, n - 1)
        val maxY = northY.coerceIn(0, n - 1)

        for (x in minX..maxX) {
            for (y in minY..maxY) {
                tiles.add(TileCoord(x, y))
            }
        }

        return tiles
    }

    private fun latToTileY(
        lat: Double,
        zoom: Int,
    ): Int {
        val n = Math.pow(2.0, zoom.toDouble()).toInt()
        val latRad = Math.toRadians(lat)
        val y = ((1.0 - Math.log(Math.tan(latRad) + 1.0 / Math.cos(latRad)) / Math.PI) / 2.0 * n).toInt()
        return y
    }

    private fun lonToTileX(
        lon: Double,
        zoom: Int,
    ): Int {
        val n = Math.pow(2.0, zoom.toDouble()).toInt()
        val x = ((lon + 180.0) / 360.0 * n).toInt()
        return x
    }

    /**
     * Получить свободное место на диске (в MB)
     */
    private fun getAvailableSpace(): Long =
        try {
            val cacheDir = Configuration.getInstance().osmdroidTileCache
            cacheDir.freeSpace / (1024 * 1024)
        } catch (e: Exception) {
            0
        }

    /**
     * Получить размер скачанных карт
     */
    fun getDownloadedMapsSize(): Long =
        try {
            val cacheDir = Configuration.getInstance().osmdroidTileCache
            calculateDirSize(cacheDir)
        } catch (e: Exception) {
            0
        }

    private fun calculateDirSize(dir: File): Long {
        var size = 0L
        dir.listFiles()?.forEach { file ->
            size +=
                if (file.isDirectory) {
                    calculateDirSize(file)
                } else {
                    file.length()
                }
        }
        return size
    }

    /**
     * Очистить кэш карт
     */
    fun clearCache() {
        try {
            val cacheDir = Configuration.getInstance().osmdroidTileCache
            cacheDir.deleteRecursively()
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing cache", e)
        }
    }
}

/**
 * Координаты тайла
 */
data class TileCoord(
    val x: Int,
    val y: Int,
)

/**
 * Прогресс скачивания
 */
data class DownloadProgress(
    val downloadedTiles: Int,
    val totalTiles: Int,
    val progressPercent: Int,
    val currentZoom: Int,
    val currentTile: TileCoord?,
    val isComplete: Boolean = false,
)
