package com.osmnav.pro.presentation.dashboard

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.util.Log
import com.osmnav.pro.data.repository.RouteRepository
import com.osmnav.pro.data.repository.RouteResult
import com.osmnav.pro.domain.model.Location
import kotlinx.coroutines.*

/**
 * AIDL Service для трансляции навигации на приборную панель автомобиля (Skywell ET5).
 *
 * Реализует AutoNavi-совместимый протокол для i.MX 8QXP head unit.
 * Intent: com.astrob.turbodog.NAVI_AIDL_SERVICE
 *
 * Протокол основан на JSON-сообщениях:
 * - routeRemainDis: оставшееся расстояние (метры)
 * - routeRemainTime: оставшееся время (секунды)
 * - curRoadName: текущая улица
 * - carLatitude/carLongitude: координаты
 * - carDirection: направление движения
 * - segRemainDis: расстояние до следующего манёвра
 */
class NaviAIDLService : Service() {
    companion object {
        private const val TAG = "NaviAIDLService"

        // Intent для AutoNavi broadcast
        const val ACTION_NAVI_UPDATE = "AUTONAVI_STANDARD_BROADCAST_RECV"

        // Протокол ID для навигации
        const val PROTOCOL_NAVI_INFO = 0x76C0
        const val PROTOCOL_ROUTE_INFO = 0x76C2
        const val PROTOCOL_STOP_NAVI = 0x76C5

        // Singleton instance
        @Volatile
        private var instance: NaviAIDLService? = null

        fun getInstance(): NaviAIDLService? = instance
    }

    private val binder = NaviBinder()
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    // Navigation state
    private var isNavigating = false
    private var currentRoute: com.osmnav.pro.domain.model.Route? = null
    private var currentInstructionIndex = 0
    private var lastBroadcastTime = 0L

    // Navigation callbacks (for HU communication)
    private val navigationCallbacks = mutableListOf<NavigationCallback>()

    interface NavigationCallback {
        fun onNavigationStarted()

        fun onNavigationEnded()

        fun onRouteUpdate(route: com.osmnav.pro.domain.model.Route)

        fun onManeuverUpdate(instruction: com.osmnav.pro.domain.model.RouteInstruction)

        fun onArrival()
    }

    inner class NaviBinder : Binder() {
        fun getService(): NaviAIDLService = this@NaviAIDLService
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        Log.d(TAG, "NaviAIDLService created")
    }

    override fun onBind(intent: Intent?): IBinder {
        Log.d(TAG, "NaviAIDLService bound: ${intent?.action}")
        return binder
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        Log.d(TAG, "onStartCommand: ${intent?.action}")

        intent?.let { processIntent(it) }

        return START_STICKY
    }

    /**
     * Обработка команд от головного устройства
     */
    private fun processIntent(intent: Intent) {
        val action = intent.action ?: return

        when (action) {
            "com.astrob.turbodog.NAVI_AIDL_SERVICE" -> {
                handleAIDLCommand(intent)
            }

            ACTION_NAVI_UPDATE -> {
                handleNaviUpdate(intent)
            }

            else -> {
                Log.d(TAG, "Unknown action: $action")
            }
        }
    }

    /**
     * Обработка AIDL команд
     */
    private fun handleAIDLCommand(intent: Intent) {
        val type = intent.getIntExtra("type", -1)
        val data = intent.getStringExtra("data")

        Log.d(TAG, "AIDL command: type=$type, data=$data")

        when (type) {
            PROTOCOL_NAVI_INFO -> {
                // Получена информация о навигации от HU
                parseAndHandleNaviInfo(data)
            }

            PROTOCOL_ROUTE_INFO -> {
                // Получена информация о маршруте
                parseAndHandleRouteInfo(data)
            }

            PROTOCOL_STOP_NAVI -> {
                // Команда остановки навигации
                stopNavigation()
            }

            else -> {
                Log.w(TAG, "Unknown protocol type: $type")
            }
        }
    }

    /**
     * Парсинг JSON с информацией о навигации
     */
    private fun parseAndHandleNaviInfo(jsonData: String?) {
        if (jsonData.isNullOrEmpty()) return

        try {
            // JSON формат:
            // {"actionType": 1, "strategy": 0, "destPoint": {"lon": x, "lat": y}}
            val json = org.json.JSONObject(jsonData)

            val destPoint = json.optJSONObject("destPoint")
            val lon = destPoint?.optDouble("lon") ?: 0.0
            val lat = destPoint?.optDouble("lat") ?: 0.0
            val strategy = json.optInt("strategy", 0)

            if (lon != 0.0 && lat != 0.0) {
                // Запрос на построение маршрута
                startRouteTo(lat, lon, strategy)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing navi info: ${e.message}")
        }
    }

    /**
     * Парсинг JSON с информацией о маршруте
     */
    private fun parseAndHandleRouteInfo(jsonData: String?) {
        Log.d(TAG, "Route info received: $jsonData")
        // Обработка выбора маршрута
    }

    /**
     * Обработка broadcast обновлений навигации
     */
    private fun handleNaviUpdate(intent: Intent) {
        // HU может отправлять обновления статуса
        Log.d(TAG, "Navigation update from HU")
    }

    /**
     * Запрос на построение маршрута
     */
    fun startRouteTo(
        lat: Double,
        lon: Double,
        strategy: Int = 0,
    ) {
        Log.d(TAG, "Starting route to: $lat, $lon, strategy=$strategy")

        serviceScope.launch {
            try {
                // Получаем текущую позицию (нужно интегрировать с LocationService)
                val currentLocation = getCurrentLocation()

                if (currentLocation != null) {
                    val repository = RouteRepository()
                    val result =
                        repository.buildRouteWithFallback(
                            start = currentLocation,
                            end = Location(lat, lon),
                        )

                    when (result) {
                        is RouteResult.Success -> {
                            currentRoute = result.route
                            currentInstructionIndex = 0
                            isNavigating = true

                            // Уведомляем HU о начале навигации
                            broadcastNavigationStart(result.route)

                            // Уведомляем callbacks
                            navigationCallbacks.forEach { it.onNavigationStarted() }

                            Log.d(TAG, "Route built: ${result.route.distanceMeters}m")
                        }

                        is RouteResult.Error -> {
                            Log.e(TAG, "Route error: ${result.message}")
                            broadcastNavigationError(result.message)
                        }
                    }
                } else {
                    Log.w(TAG, "Current location not available")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error building route: ${e.message}")
            }
        }
    }

    /**
     * Обновление текущей позиции и отправка на HU
     */
    fun updateLocation(
        latitude: Double,
        longitude: Double,
        speed: Float,
        bearing: Float,
    ) {
        if (!isNavigating || currentRoute == null) return

        // Проверяем время с последней отправки (не чаще 1 раза в секунду)
        val now = System.currentTimeMillis()
        if (now - lastBroadcastTime < 1000) return
        lastBroadcastTime = now

        // Находим текущую инструкцию
        updateCurrentInstruction(latitude, longitude)

        // Отправляем данные на HU
        broadcastNavigationUpdate(latitude, longitude, speed, bearing)
    }

    /**
     * Определение текущей инструкции на основе позиции
     */
    private fun updateCurrentInstruction(
        lat: Double,
        lon: Double,
    ) {
        val route = currentRoute ?: return
        val instructions = route.instructions

        // Простой алгоритм - ищем ближайшую инструкцию
        for (i in currentInstructionIndex until instructions.size) {
            val instruction = instructions[i]
            val distance = calculateDistance(lat, lon, instruction.point.latitude, instruction.point.longitude)

            // Если приблизились к точке манёвра (100 метров)
            if (distance < 100 && i > currentInstructionIndex) {
                currentInstructionIndex = i
                navigationCallbacks.forEach { it.onManeuverUpdate(instruction) }
                break
            }
        }

        // Проверяем прибытие
        val lastInstruction = instructions.lastOrNull()
        if (lastInstruction != null) {
            val distance = calculateDistance(lat, lon, lastInstruction.point.latitude, lastInstruction.point.longitude)
            if (distance < 50) {
                onArrival()
            }
        }
    }

    /**
     * Прибытие в пункт назначения
     */
    private fun onArrival() {
        isNavigating = false
        navigationCallbacks.forEach { it.onArrival() }
        broadcastNavigationEnd()
        Log.d(TAG, "Arrived at destination!")
    }

    /**
     * Остановка навигации
     */
    fun stopNavigation() {
        isNavigating = false
        currentRoute = null
        currentInstructionIndex = 0
        navigationCallbacks.forEach { it.onNavigationEnded() }
        broadcastNavigationEnd()
        Log.d(TAG, "Navigation stopped")
    }

    /**
     * Получение текущей позиции (заглушка - нужно интегрировать с реальным location provider)
     */
    private suspend fun getCurrentLocation(): Location? {
        // TODO: Интегрировать с FusedLocationProviderClient
        return null // Временно возвращаем null
    }

    /**
     * Расчёт расстояния между двумя точками (метры)
     */
    private fun calculateDistance(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double,
    ): Float {
        val results = FloatArray(1)
        android.location.Location.distanceBetween(lat1, lon1, lat2, lon2, results)
        return results[0]
    }

    // ==================== BROADCAST TO HU ====================

    /**
     * Отправка начала навигации на HU
     */
    private fun broadcastNavigationStart(route: com.osmnav.pro.domain.model.Route) {
        val intent =
            Intent(ACTION_NAVI_UPDATE).apply {
                putExtra("type", PROTOCOL_NAVI_INFO)
                putExtra("actionType", 1) // START
                putExtra("routeRemainDis", route.distanceMeters.toInt())
                putExtra("routeRemainTime", route.durationSeconds.toInt())

                // Первая инструкция
                route.instructions.firstOrNull()?.let { first ->
                    putExtra("curRoadName", first.streetName ?: "")
                    putExtra("segRemainDis", first.distanceMeters.toInt())
                }
            }
        sendBroadcast(intent)
        Log.d(TAG, "Broadcast navigation start")
    }

    /**
     * Отправка обновления навигации на HU
     */
    private fun broadcastNavigationUpdate(
        lat: Double,
        lon: Double,
        speed: Float,
        bearing: Float,
    ) {
        val route = currentRoute ?: return
        val instruction = route.instructions.getOrNull(currentInstructionIndex)
        val nextInstruction = route.instructions.getOrNull(currentInstructionIndex + 1)

        // Расчёт оставшегося расстояния и времени
        val remainingDistance = route.distanceMeters - (currentInstructionIndex * 500) // Упрощённо
        val remainingTime = route.durationSeconds - (currentInstructionIndex * 30)

        val intent =
            Intent(ACTION_NAVI_UPDATE).apply {
                putExtra("type", PROTOCOL_NAVI_INFO)
                putExtra("actionType", 2) // UPDATE

                // Позиция
                putExtra("carLatitude", lat)
                putExtra("carLongitude", lon)
                putExtra("carDirection", bearing.toInt())
                putExtra("curSpeed", speed.toInt())

                // Маршрут
                putExtra("routeRemainDis", remainingDistance.toInt().coerceAtLeast(0))
                putExtra("routeRemainTime", remainingTime.toInt().coerceAtLeast(0))

                // Текущий манёвр
                instruction?.let {
                    putExtra("segRemainDis", it.distanceMeters.toInt())
                    putExtra("curRoadName", it.streetName ?: "")
                    putExtra("nextRoadName", nextInstruction?.streetName ?: "")
                }
            }
        sendBroadcast(intent)
    }

    /**
     * Отправка ошибки на HU
     */
    private fun broadcastNavigationError(message: String) {
        val intent =
            Intent(ACTION_NAVI_UPDATE).apply {
                putExtra("type", PROTOCOL_NAVI_INFO)
                putExtra("actionType", 3) // ERROR
                putExtra("errorMsg", message)
            }
        sendBroadcast(intent)
    }

    /**
     * Отправка завершения навигации на HU
     */
    private fun broadcastNavigationEnd() {
        val intent =
            Intent(ACTION_NAVI_UPDATE).apply {
                putExtra("type", PROTOCOL_STOP_NAVI)
                putExtra("actionType", 0) // STOP
            }
        sendBroadcast(intent)
        Log.d(TAG, "Broadcast navigation end")
    }

    // ==================== CALLBACK MANAGEMENT ====================

    fun addNavigationCallback(callback: NavigationCallback) {
        if (!navigationCallbacks.contains(callback)) {
            navigationCallbacks.add(callback)
        }
    }

    fun removeNavigationCallback(callback: NavigationCallback) {
        navigationCallbacks.remove(callback)
    }

    // ==================== LIFECYCLE ====================

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        serviceScope.cancel()
        navigationCallbacks.clear()
        Log.d(TAG, "NaviAIDLService destroyed")
    }
}
