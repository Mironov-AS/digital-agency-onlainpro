package com.osmnav.pro.presentation.search

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.osmnav.pro.data.repository.SearchRepository
import com.osmnav.pro.domain.model.Location
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * ViewModel для экрана поиска
 */
class SearchViewModel : ViewModel() {

    private val searchRepository = SearchRepository()
    
    private val _searchResults = MutableLiveData<List<Location>>()
    val searchResults: LiveData<List<Location>> = _searchResults
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private var searchJob: Job? = null
    
    fun search(query: String) {
        searchJob?.cancel()
        
        if (query.length < 3) {
            _searchResults.value = emptyList()
            return
        }
        
        searchJob = viewModelScope.launch {
            _isLoading.value = true
            delay(300) // Debounce
            
            try {
                val results = searchRepository.searchAddress(query)
                _searchResults.value = results
            } catch (e: Exception) {
                _searchResults.value = emptyList()
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun searchNearby(category: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // Получить текущую локацию (заглушка)
                val currentLocation = Location(55.7558, 37.6173)
                val results = searchRepository.searchNearby(currentLocation, category)
                _searchResults.value = results
            } catch (e: Exception) {
                _searchResults.value = emptyList()
            } finally {
                _isLoading.value = false
            }
        }
    }
}
