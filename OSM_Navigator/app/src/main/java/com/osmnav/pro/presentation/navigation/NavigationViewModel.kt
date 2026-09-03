package com.osmnav.pro.presentation.navigation

import android.app.Application
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.osmnav.pro.data.remote.LogUploader
import com.osmnav.pro.data.repository.RouteRepository
import com.osmnav.pro.data.repository.RouteResult
import com.osmnav.pro.domain.model.Location
import com.osmnav.pro.domain.model.NavigationState
import com.osmnav.pro.domain.model.Route
import com.osmnav.pro.domain.model.RouteInstruction
import com.osmnav.pro.presentation.dashboard.DashboardProjectionManager
import com.osmnav.pro.presentation.dashboard.NaviAIDLService
import kotlinx.coroutines.launch
import java.util.Locale
import android.location.Location as AndroidLocation

/**
 * ViewModel для экрана навигации
 * Управляет состоянием маршрута, голосовыми подсказками и проекцией на приборную панель
 */
class NavigationViewModel(
    application: Application,
) : AndroidViewModel(application) {
    companion object {
        private const val TAG = "NavigationViewModel"

        // Расстояния для голосовых подсказок (метры)
        val VOICE_DISTANCES = listOf(1000, 500, 200, 100, 50)
    }

    // Репозиторий для работы с маршрутами
    private val routeRepository = RouteRepository()

    // Менеджер проекции на приборную панель
    private var dashboardManager: DashboardProjectionManager? = null

    // AIDL Service для трансляции на HU
    private var naviAIDLService: NaviAIDLService? = null

    // Текущее состояние навигации
    private val _route = MutableLiveData<Route?>()
    val route: LiveData<Route?> = _route

    private val _currentInstruction = MutableLiveData<RouteInstruction?>()
    val currentInstruction: LiveData<RouteInstruction?> = _currentInstruction

    private val _nextInstruction = MutableLiveData<RouteInstruction?>()
    val nextInstruction: LiveData<RouteInstruction?> = _nextInstruction

    private val _currentLocation = MutableLiveData<AndroidLocation?>()
    val currentLocation: LiveData<AndroidLocation?> = _currentLocation

    private val _distanceRemaining = MutableLiveData<Long>()
    val distanceRemaining: LiveData<Long> = _distanceRemaining

    private val _timeRemaining = MutableLiveData<Long>()
    val timeRemaining: LiveData<Long> = _timeRemaining

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _isNavigating = MutableLiveData<Boolean>()
    val isNavigating: LiveData<Boolean> = _isNavigating

    // Голосовой движок
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false
    private var isTtsMuted = false

    // Текущий индекс инструкции
    private var currentInstructionIndex = 0
    private var lastSpokenDistance = 0
    private var lastLocationTime = 0L

    // Инициализация TTS
    init {
        initTts(application)
        initDashboardManager(application)
    }

    private fun initTts(context: Application) {
        textToSpeech =
            TextToSpeech(context) { status ->
                if (status == TextToSpeech.SUCCESS) {
                    val result = textToSpeech?.setLanguage(Locale("ru", "RU"))
                    isTtsReady = result != TextToSpeech.LANG_MISSING_DATA &&
                        result != TextToSpeech.LANG_NOT_SUPPORTED

                    // Настраиваем параметры голоса
                    textToSpeech?.setSpeechRate(0.9f)
                    textToSpeech?.setPitch(1.0f)

                    Log.d(TAG, "TTS initialized, ready: $isTtsReady")
                }
            }
    }

    private fun initDashboardManager(context: Application) {
        try {
            dashboardManager = DashboardProjectionManager(context)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to init dashboard manager", e)
        }

        // Инициализируем AIDL Service
        naviAIDLService = NaviAIDLService.getInstance()
    }

    /**
     * Установить ссылку на AIDL Service (вызывается из Activity)
     */
    fun setNaviAIDLService(service: NaviAIDLService?) {
        naviAIDLService = service
        Log.d(TAG, "NaviAIDLService set: ${service != null}")
    }

    /**
     * Начать навигацию к указанной точке
     */
    fun startNavigation(destination: Location) {
        _isLoading.value = true
        _error.value = null

        viewModelScope.launch {
            // Используем GPS позицию если доступна, иначе Москва
            val startLocation =
                _currentLocation.value?.let {
                    Location(it.latitude, it.longitude)
                } ?: Location(55.7558, 37.6173) // Москва по умолчанию

            LogUploader.i(
                TAG,
                "Building route from (${startLocation.latitude},${startLocation.longitude}) to (${destination.latitude},${destination.longitude})",
            )

            val result =
                routeRepository.buildRouteWithFallback(
                    start = startLocation,
                    end = destination,
                )

            _isLoading.value = false

            when (result) {
                is RouteResult.Success -> {
                    LogUploader.i(TAG, "Route built successfully: ${result.route.distanceMeters}m, ${result.route.durationSeconds}s")
                    _route.value = result.route
                    _distanceRemaining.value = result.route.distanceMeters
                    _timeRemaining.value = result.route.durationSeconds

                    // Устанавливаем первую инструкцию
                    if (result.route.instructions.isNotEmpty()) {
                        _currentInstruction.value = result.route.instructions[0]
                        if (result.route.instructions.size > 1) {
                            _nextInstruction.value = result.route.instructions[1]
                        }
                    }

                    // Запускаем проекцию
                    dashboardManager?.startProjection(
                        "Пункт назначения",
                        destination.latitude,
                        destination.longitude,
                    )

                    // Отправляем в AIDL Service для HU
                    naviAIDLService?.startRouteTo(
                        destination.latitude,
                        destination.longitude,
                        0, // fastest strategy
                    )

                    _isNavigating.value = true
                    currentInstructionIndex = 0
                    lastSpokenDistance = 0

                    Log.d(TAG, "Route built: ${result.route.distanceMeters}m, ${result.route.durationSeconds}s")
                }

                is RouteResult.Error -> {
                    _error.value = result.message
                    Log.e(TAG, "Route build error: ${result.message}")
                }
            }
        }
    }

    /**
     * Обновить текущее местоположение
     */
    fun updateLocation(location: AndroidLocation) {
        _currentLocation.value = location

        // Обновляем проекцию на приборной панели
        updateDashboardProjection(location)

        // Отправляем обновление в AIDL Service для HU
        naviAIDLService?.updateLocation(
            latitude = location.latitude,
            longitude = location.longitude,
            speed = location.speed,
            bearing = location.bearing,
        )

        // Проверяем, нужно ли обновить инструкцию
        checkInstructionProximity(location.latitude, location.longitude)
    }

    /**
     * Проверить приближение к точке манёвра
     */
    private fun checkInstructionProximity(
        lat: Double,
        lon: Double,
    ) {
        val instruction = _currentInstruction.value ?: return
        val route = _route.value ?: return

        // Вычисляем расстояние до точки манёвра
        val distanceToManeuver =
            calculateDistance(
                lat,
                lon,
                instruction.point.latitude,
                instruction.point.longitude,
            )

        // Проверяем, прошли ли мы точку манёвра
        if (distanceToManeuver < 30) { // Прошли точку (30 метров)
            // Переходим к следующей инструкции
            currentInstructionIndex++

            if (currentInstructionIndex < route.instructions.size) {
                val newInstruction = route.instructions[currentInstructionIndex]
                _currentInstruction.value = newInstruction

                if (currentInstructionIndex + 1 < route.instructions.size) {
                    _nextInstruction.value = route.instructions[currentInstructionIndex + 1]
                } else {
                    _nextInstruction.value = null
                }

                // Озвучиваем новую инструкцию
                speakInstruction(newInstruction)

                // Обновляем оставшееся расстояние
                val remainingDist =
                    route.instructions
                        .drop(currentInstructionIndex)
                        .sumOf { it.distanceMeters }
                _distanceRemaining.value = remainingDist

                Log.d(TAG, "Maneuver passed: ${newInstruction.text}")
            } else {
                // Маршрут завершён
                stopNavigation()
            }
        }

        // Проверяем голосовые подсказки
        checkVoicePrompts(distanceToManeuver)
    }

    /**
     * Проверить, нужно ли озвучить подсказку
     */
    private fun checkVoicePrompts(distanceToManeuver: Int) {
        if (!isTtsReady || isTtsMuted) return

        val instruction = _currentInstruction.value ?: return

        // Проверяем, входим ли мы в одну из ключевых дистанций
        for (targetDist in VOICE_DISTANCES) {
            if (distanceToManeuver <= targetDist && lastSpokenDistance > targetDist) {
                // Нужно озвучить
                speakInstruction(instruction)
                lastSpokenDistance = distanceToManeuver
                break
            }
        }
    }

    /**
     * Озвучить инструкцию
     */
    private fun speakInstruction(instruction: RouteInstruction) {
        if (!isTtsReady || isTtsMuted) return

        val text = buildVoiceText(instruction)
        textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "instruction_${System.currentTimeMillis()}")

        Log.d(TAG, "Speaking: $text")
    }

    /**
     * Построить текст для голосового озвучивания
     */
    private fun buildVoiceText(instruction: RouteInstruction): String {
        val maneuverText = instruction.text
        val street = instruction.streetName
        val distance = instruction.distanceMeters

        // Всегда добавляем название улицы если есть
        val streetSuffix = if (!street.isNullOrEmpty()) " на $street" else ""

        return when {
            distance <= 50 -> {
                "Сейчас $maneuverText$streetSuffix"
            }

            distance <= 200 -> {
                "Через $distance метров $maneuverText$streetSuffix"
            }

            distance <= 1000 -> {
                // "Через 500 метров поверните направо" или "Через 1 километр..."
                val km = distance / 1000.0
                if (distance >= 900) {
                    // Ближе к километру - говорим "километр"
                    "Через 1 километр $maneuverText$streetSuffix"
                } else {
                    "Через $distance метров $maneuverText$streetSuffix"
                }
            }

            else -> {
                // Для больших расстояний: "Через 4 километра поверните направо на улицу Ленина"
                val km = distance / 1000.0
                val kmInt = km.toInt()
                // Склонение: 1 километр, 2-4 километра, 5+ километров
                val kmWord =
                    when {
                        kmInt % 10 == 1 && kmInt % 100 != 11 -> "километр"
                        kmInt % 10 in 2..4 && kmInt % 100 !in 12..14 -> "километра"
                        else -> "километров"
                    }
                "Через $kmInt $kmWord $maneuverText$streetSuffix"
            }
        }
    }

    /**
     * Обновить проекцию на приборной панели
     */
    private fun updateDashboardProjection(location: AndroidLocation) {
        val state =
            NavigationState().apply {
                maneuverText = _currentInstruction.value?.text ?: "Продолжайте движение"
                maneuverType = _currentInstruction.value?.maneuver?.name ?: "CONTINUE"
                distanceMeters = _currentInstruction.value?.distanceMeters?.toInt() ?: 0
                streetName = _currentInstruction.value?.streetName
                totalDistanceMeters = _distanceRemaining.value ?: 0
                remainingSeconds = ((_timeRemaining.value ?: 0) * 60).toInt()
                nextManeuverText = _nextInstruction.value?.text
                nextDistanceMeters = _nextInstruction.value?.distanceMeters?.toInt() ?: 0
                currentLat = location.latitude
                currentLon = location.longitude
            }

        dashboardManager?.updateNavigationState(state)
    }

    /**
     * Включить/выключить голос
     */
    fun toggleVoice() {
        isTtsMuted = !isTtsMuted
        if (isTtsMuted) {
            textToSpeech?.stop()
        }
    }

    /**
     * Остановить навигацию
     */
    fun stopNavigation() {
        textToSpeech?.stop()
        dashboardManager?.stopProjection()
        naviAIDLService?.stopNavigation()
        _isNavigating.value = false
        _currentInstruction.value = null
        _nextInstruction.value = null
        currentInstructionIndex = 0
        lastSpokenDistance = 0
    }

    /**
     * Рассчитать расстояние между двумя точками (метры)
     */
    private fun calculateDistance(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double,
    ): Int {
        val r = 6371000 // Радиус Земли в метрах
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return (r * c).toInt()
    }

    override fun onCleared() {
        super.onCleared()
        textToSpeech?.stop()
        textToSpeech?.shutdown()
        dashboardManager?.stopProjection()
    }
}
