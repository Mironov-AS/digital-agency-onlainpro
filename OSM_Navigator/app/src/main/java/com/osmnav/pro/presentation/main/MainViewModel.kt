package com.osmnav.pro.presentation.main

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.osmnav.pro.domain.model.Location

/**
 * ViewModel для главного экрана
 */
class MainViewModel : ViewModel() {

    private val _currentLocation = MutableLiveData<Location?>()
    val currentLocation: LiveData<Location?> = _currentLocation

    private val _destination = MutableLiveData<Location?>()
    val destination: LiveData<Location?> = _destination
    
    private val _homeLocation = MutableLiveData<Location?>()
    val homeLocation: LiveData<Location?> = _homeLocation

    init {
        // Загрузка домашней локации из настроек (пример)
        _homeLocation.value = null
    }

    fun setDestination(location: Location) {
        _destination.value = location
    }

    fun clearDestination() {
        _destination.value = null
    }

    fun setCurrentLocation(location: Location) {
        _currentLocation.value = location
    }

    fun navigateHome() {
        _homeLocation.value?.let {
            _destination.value = it
        }
    }

    fun setHomeLocation(location: Location) {
        _homeLocation.value = location
        // Сохранить в SharedPreferences
    }
}
