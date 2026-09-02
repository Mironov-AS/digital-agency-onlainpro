package com.osmnav.pro.data.repository

import com.google.gson.Gson
import com.osmnav.pro.domain.model.Location
import okhttp3.OkHttpClient
import okhttp3.Request
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
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
    
    suspend fun searchAddress(query: String): List<Location> = withContext(Dispatchers.IO) {
        try {
            val encodedQuery = URLEncoder.encode(query, "UTF-8")
            val url = "$NOMINATIM_BASE_URL/search?q=$encodedQuery&format=json&addressdetails=1&limit=10&accept-language=ru"
            
            val request = Request.Builder()
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
                    address = result.address?.let { formatAddress(it) }
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun searchNearby(location: Location, category: String): List<Location> = withContext(Dispatchers.IO) {
        try {
            val url = "$NOMINATIM_BASE_URL/search?q=[${category}]&nearby=${location.latitude},${location.longitude},5000&format=json&addressdetails=1&limit=20&accept-language=ru"
            
            val request = Request.Builder()
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
                    address = result.address?.let { formatAddress(it) }
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    private fun formatAddress(address: NominatimAddress): String {
        val parts = listOfNotNull(
            address.road,
            address.houseNumber,
            address.city ?: address.town ?: address.village
        )
        return parts.joinToString(", ")
    }
}

// Модели для Nominatim API
data class NominatimResult(
    val lat: String,
    val lon: String,
    val displayName: String,
    val address: NominatimAddress?
)

data class NominatimAddress(
    val road: String? = null,
    val houseNumber: String? = null,
    val city: String? = null,
    val town: String? = null,
    val village: String? = null,
    val state: String? = null,
    val country: String? = null,
    val postcode: String? = null
)
