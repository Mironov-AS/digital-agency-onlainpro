package com.osmnav.pro.data.repository

import com.google.gson.Gson
import com.osmnav.pro.domain.model.ChargingStation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.osmdroid.util.BoundingBox
import java.util.concurrent.TimeUnit

/**
 * Репозиторий для зарядных станций через Overpass API (OpenStreetMap)
 */
class ChargingStationRepository {
    private val client =
        OkHttpClient
            .Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    private val gson = Gson()

    companion object {
        private const val OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
    }

    /**
     * Получить зарядные станции в указанной области
     * @param boundingBox границы области для поиска
     * @param zoom текущий зум карты (влияет на радиус поиска)
     */
    suspend fun getStationsInArea(
        boundingBox: BoundingBox,
        zoom: Int = 14,
    ): List<ChargingStation> =
        withContext(Dispatchers.IO) {
            try {
                // Overpass QL запрос для поиска зарядных станций
                val query = buildOverpassQuery(boundingBox)
                val encodedQuery = java.net.URLEncoder.encode(query, "UTF-8")
                val url = "$OVERPASS_API_URL?data=$encodedQuery"

                val request =
                    Request
                        .Builder()
                        .url(url)
                        .header("User-Agent", "OSMNavigator/1.0")
                        .build()

                val response = client.newCall(request).execute()
                val body = response.body?.string() ?: return@withContext emptyList()

                parseOverpassResponse(body)
            } catch (e: Exception) {
                e.printStackTrace()
                emptyList()
            }
        }

    /**
     * Построить Overpass QL запрос
     */
    private fun buildOverpassQuery(boundingBox: BoundingBox): String {
        // Расширяем bbox для большего покрытия
        val padding = 0.01
        val south = boundingBox.latSouth - padding
        val west = boundingBox.lonWest - padding
        val north = boundingBox.latNorth + padding
        val east = boundingBox.lonEast + padding

        return """
            [out:json][timeout:25];
            (
              node["amenity"="charging_station"]($south,$west,$north,$east);
              way["amenity"="charging_station"]($south,$west,$north,$east);
            );
            out center;
            """.trimIndent()
    }

    /**
     * Парсинг ответа Overpass API
     */
    private fun parseOverpassResponse(response: String): List<ChargingStation> =
        try {
            val json = gson.fromJson(response, OverpassResponse::class.java)
            json.elements.mapNotNull { element ->
                parseElement(element)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }

    /**
     * Парсинг одного элемента (node или way)
     */
    private fun parseElement(element: OverpassElement): ChargingStation? {
        val tags = element.tags ?: return null

        // Проверяем что это зарядная станция
        if (tags["amenity"] != "charging_station") return null

        // Получаем координаты
        val (lat, lon) =
            if (element.lat != null && element.lon != null) {
                element.lat to element.lon
            } else if (element.center != null) {
                element.center.lat to element.center.lon
            } else {
                return null
            }

        // Парсим разъёмы
        val connectorTypes = parseConnectorTypes(tags)

        // Парсим мощность
        val powerKw = parsePower(tags)

        return ChargingStation(
            id = "osm_${element.id}",
            latitude = lat,
            longitude = lon,
            name = tags["name"] ?: tags["operator"],
            operator = tags["operator"],
            network = tags["network"],
            address = buildAddress(tags),
            powerKw = powerKw,
            connectorTypes = connectorTypes,
            count = tags["charging_station"]?.toIntOrNull() ?: 1,
            status = parseStatus(tags),
            isFree = tags["fee"]?.lowercase()?.let { it == "no" || it == "free" },
            is24h = tags["opening_hours"]?.contains("24") == true,
        )
    }

    /**
     * Парсинг типов разъёмов из тегов OSM
     */
    private fun parseConnectorTypes(tags: Map<String, String>): List<String> {
        val connectors = mutableListOf<String>()

        // Стандартные теги для разъёмов
        listOf(
            "socket:iec62196_type2" to "Type 2",
            "socket:iec62196:type2" to "Type 2",
            "socket:type2" to "Type 2",
            "plug:iec62196_type2" to "Type 2 Plug",
            "connector:iec62196_type2" to "Type 2",
            "socket:ccs" to "CCS",
            "socket:ccs_combo" to "CCS Combo",
            "socket:chademo" to "CHAdeMO",
            "socket:tesla" to "Tesla",
            "socket:type1" to "Type 1",
            "socket:type1_combo" to "Type 1 Combo",
            "socket:cee_7_4" to "CEE 7/4",
            "socket:cee_7_5" to "CEE 7/5",
        ).forEach { (tag, displayName) ->
            if (tags[tag] != null) {
                connectors.add(displayName)
            }
        }

        // Проверяем tesla и другие сети
        val network = tags["network"]?.lowercase() ?: ""
        if (network.contains("tesla") && connectors.none { it.contains("Tesla") }) {
            connectors.add("Tesla Supercharger")
        }

        // Если ничего не найдено, добавляем базовый
        if (connectors.isEmpty()) {
            connectors.add("AC Charging")
        }

        return connectors.distinct()
    }

    /**
     * Парсинг мощности
     */
    private fun parsePower(tags: Map<String, String>): Double? {
        // Пробуем разные теги
        val powerStr =
            tags["max_power"]
                ?: tags["charging_power"]
                ?: tags["power"]

        return powerStr?.replace(Regex("[^0-9.]"), "")?.toDoubleOrNull()
    }

    /**
     * Парсинг статуса
     */
    private fun parseStatus(tags: Map<String, String>): String =
        when (tags["access"]) {
            "no" -> {
                "Private"
            }

            "customers" -> {
                "Customers Only"
            }

            "permit" -> {
                "Permit Required"
            }

            else -> {
                when (tags["status"]) {
                    "operational", "online" -> "Operational"
                    "offline", "maintenance" -> "Offline"
                    "planned", "construction" -> "Planned"
                    else -> "Operational"
                }
            }
        }

    /**
     * Построение адреса из тегов
     */
    private fun buildAddress(tags: Map<String, String>): String {
        val parts = mutableListOf<String>()

        tags["addr:housenumber"]?.let { parts.add(it) }
        tags["addr:street"]?.let { parts.add(it) }
        tags["addr:city"]?.let { parts.add(it) }
        tags["addr:suburb"]?.let { parts.add(it) }

        return parts.joinToString(", ").ifEmpty { tags["description"] ?: "" }
    }
}

// Модели для Overpass API
private data class OverpassResponse(
    val elements: List<OverpassElement>,
)

private data class OverpassElement(
    val type: String,
    val id: Long,
    val lat: Double? = null,
    val lon: Double? = null,
    val center: OverpassCenter? = null,
    val tags: Map<String, String>? = null,
)

private data class OverpassCenter(
    val lat: Double,
    val lon: Double,
)
