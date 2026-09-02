package com.osmnav.pro.data.repository

import com.google.gson.Gson
import com.osmnav.pro.domain.model.Location
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.URLEncoder

/**
 * Репозиторий для поиска адресов через Nominatim (OpenStreetMap)
 */
class SearchRepository {
    private val client = OkHttpClient()
    private val gson = Gson()

    companion object {
        private const val NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"
    }

    suspend fun searchAddress(query: String): List<Location> =
        withContext(Dispatchers.IO) {
            try {
                val encodedQuery = URLEncoder.encode(query, "UTF-8")
                // format=jsonv2 для лучшей точности адресов
                // БЕЗ layer=address - он даёт низкий приоритет домам
                val url = "$NOMINATIM_BASE_URL/search?q=$encodedQuery&format=jsonv2&addressdetails=1&limit=15&accept-language=ru"

                val request =
                    Request
                        .Builder()
                        .url(url)
                        .header("User-Agent", "OSMNavigator/1.0")
                        .build()

                val response = client.newCall(request).execute()
                val body = response.body?.string() ?: return@withContext emptyList()

                val results =
                    gson.fromJson(body, Array<NominatimResult>::class.java)
                        ?: return@withContext emptyList()

                // КРИТИЧНО: сортируем результаты - сначала те, у которых есть номер дома
                val sortedResults =
                    results.sortedWith(
                        compareByDescending<NominatimResult> { result ->
                            // Приоритет 1: есть номер дома (AND building - точное здание)
                            !result.address?.houseNumber.isNullOrBlank() &&
                                !result.address?.building.isNullOrBlank()
                        }.thenByDescending { result ->
                            // Приоритет 2: есть только номер дома
                            !result.address?.houseNumber.isNullOrBlank()
                        }.thenByDescending { result ->
                            // Приоритет 3: есть название улицы
                            !result.address?.road.isNullOrBlank()
                        }.thenByDescending { result ->
                            // Приоритет 4: по importance от Nominatim
                            result.importance
                        },
                    )

                sortedResults.map { result ->
                    val displayName = buildDisplayName(result)

                    Location(
                        latitude = result.lat.toDouble(),
                        longitude = result.lon.toDouble(),
                        name = displayName,
                        address = result.address?.let { formatAddressWithHouse(it) },
                    )
                }
            } catch (e: Exception) {
                emptyList()
            }
        }

    suspend fun searchNearby(
        location: Location,
        category: String,
    ): List<Location> =
        withContext(Dispatchers.IO) {
            try {
                val url = "$NOMINATIM_BASE_URL/search?q=[$category]&nearby=${location.latitude},${location.longitude},5000&format=json&addressdetails=1&limit=20&accept-language=ru"

                val request =
                    Request
                        .Builder()
                        .url(url)
                        .header("User-Agent", "OSMNavigator/1.0")
                        .build()

                val response = client.newCall(request).execute()
                val body = response.body?.string() ?: return@withContext emptyList()

                val results = gson.fromJson(body, Array<NominatimResult>::class.java)

                results.map { result ->
                    Location(
                        latitude = result.lat.toDouble(),
                        longitude = result.lon.toDouble(),
                        name = result.displayName,
                        address = result.address?.let { formatAddress(it) },
                    )
                }
            } catch (e: Exception) {
                emptyList()
            }
        }

    /**
     * Формирование полного названия для отображения с приоритетом номера дома
     */
    private fun buildDisplayName(result: NominatimResult): String {
        val addr = result.address ?: return result.displayName

        // Если есть номер дома - формируем короткий но точный адрес
        if (!addr.houseNumber.isNullOrBlank()) {
            val street = addr.road ?: addr.pedestrian ?: addr.footway ?: ""
            val city = addr.city ?: addr.town ?: addr.village ?: addr.municipality ?: ""

            if (street.isNotBlank() && city.isNotBlank()) {
                return "$street, ${addr.houseNumber}, $city"
            }
        }

        // Иначе возвращаем полный адрес от Nominatim
        return result.displayName
    }

    /**
     * Форматирование адреса с приоритетом номера дома
     */
    private fun formatAddressWithHouse(address: NominatimAddress): String {
        val parts = mutableListOf<String>()

        // Номер дома - самый важный элемент
        if (!address.houseNumber.isNullOrBlank()) {
            parts.add(address.houseNumber)
        }

        // Улица
        val street = address.road ?: address.pedestrian ?: address.footway
        if (!street.isNullOrBlank()) {
            parts.add(street)
        }

        // Город/населённый пункт
        val locality = address.city ?: address.town ?: address.village ?: address.municipality
        if (!locality.isNullOrBlank()) {
            parts.add(locality)
        }

        return parts.joinToString(", ")
    }

    private fun formatAddress(address: NominatimAddress): String {
        val parts =
            listOfNotNull(
                address.houseNumber,
                address.road,
                address.city ?: address.town ?: address.village,
            )
        return parts.joinToString(", ")
    }
}

// Модели для Nominatim API
data class NominatimResult(
    val lat: String,
    val lon: String,
    val displayName: String,
    val address: NominatimAddress?,
    val importance: Double = 0.0,
)

data class NominatimAddress(
    val road: String? = null,
    val houseNumber: String? = null,
    val city: String? = null,
    val town: String? = null,
    val village: String? = null,
    val municipality: String? = null,
    val state: String? = null,
    val country: String? = null,
    val postcode: String? = null,
    // Дополнительные поля для номера дома
    val pedestrian: String? = null,
    val footway: String? = null,
    val residential: String? = null,
    val building: String? = null,
)
