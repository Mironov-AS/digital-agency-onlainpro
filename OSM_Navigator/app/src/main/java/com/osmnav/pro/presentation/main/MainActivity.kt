package com.osmnav.pro.presentation.main

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.osmnav.pro.R
import com.osmnav.pro.data.remote.LogUploader
import com.osmnav.pro.data.repository.ChargingStationRepository
import com.osmnav.pro.databinding.ActivityMainBinding
import com.osmnav.pro.domain.model.ChargingStation
import com.osmnav.pro.domain.model.Location
import com.osmnav.pro.presentation.navigation.NavigationActivity
import com.osmnav.pro.presentation.search.SearchActivity
import com.osmnav.pro.presentation.settings.SettingsActivity
import kotlinx.coroutines.launch
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.BoundingBox
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay

/**
 * Главный экран с картой
 */
class MainActivity : AppCompatActivity() {
    private val TAG = "MainActivity"
    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: MainViewModel
    private val chargingStationRepository = ChargingStationRepository()

    private var myLocationOverlay: MyLocationNewOverlay? = null
    private var destinationMarker: Marker? = null
    private val chargingStationMarkers = mutableListOf<Marker>()
    private var showChargingStations = false

    // Ближайшая зарядная станция
    private var nearestChargingStation: ChargingStation? = null
    private var nearestChargingStations: List<ChargingStation> = emptyList()
    private var searchChargingJob: kotlinx.coroutines.Job? = null

    private val locationPermissionRequest =
        registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions(),
        ) { permissions ->
            when {
                permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true -> {
                    enableMyLocation()
                }

                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true -> {
                    enableMyLocation()
                }

                else -> {
                    Toast.makeText(this, "Для навигации разрешите доступ к геолокации", Toast.LENGTH_LONG).show()
                }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[MainViewModel::class.java]

        setupMap()
        setupUI()
        setupObservers()
    }

    private fun setupMap() {
        binding.mapView.apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)

            // Скрываем встроенные кнопки зума - используем сенсорный ввод
            setZoomControlsEnabled(false)

            // Начальная позиция - будет обновлена при получении GPS
            controller.setZoom(15.0)

            // Обработка клика по карте
            val mapEventsOverlay =
                MapEventsOverlay(
                    object : MapEventsReceiver {
                        override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                            p?.let { setDestination(it) }
                            return true
                        }

                        override fun longPressHelper(p: GeoPoint?): Boolean = false
                    },
                )
            overlays.add(mapEventsOverlay)
        }

        // Запрос разрешений
        requestLocationPermission()
    }

    private fun setupUI() {
        // Кнопка поиска
        binding.btnSearch.setOnClickListener {
            startActivity(Intent(this, SearchActivity::class.java))
        }

        // Кнопка "Дом"
        binding.btnHome.setOnClickListener {
            viewModel.navigateHome()
        }

        // Кнопка "Избранное"
        binding.btnFavorites.setOnClickListener {
            // TODO: Показать избранное
        }

        // Кнопка навигации (появляется когда есть пункт назначения)
        binding.fabNavigate.setOnClickListener {
            startNavigation()
        }

        // Меню
        binding.btnMenu.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        // Зарядные станции
        binding.btnCharging.setOnClickListener {
            toggleChargingStations()
        }

        // Моё местоположение
        binding.fabMyLocation.setOnClickListener {
            centerOnMyLocation()
        }

        // Клик на карточку ближайшей зарядной станции
        binding.viewNearestCharging.cardNearestCharging.setOnClickListener {
            showRerouteDialog()
        }

        // Запускаем поиск ближайшей станции
        checkShowNearestCharging()
    }

    /**
     * Проверить настройку и запустить поиск ближайшей станции
     */
    private fun checkShowNearestCharging() {
        val prefs = getSharedPreferences("osmnav_prefs", MODE_PRIVATE)
        val showNearest = prefs.getBoolean("show_nearest_charging", false)

        if (showNearest) {
            // Запускаем поиск при изменении местоположения
            searchNearestChargingStation()
        } else {
            // Скрываем карточку если настройка выключена
            hideNearestChargingCard()
        }
    }

    private fun setupObservers() {
        viewModel.currentLocation.observe(this) { location ->
            location?.let {
                val geoPoint = GeoPoint(it.latitude, it.longitude)
                binding.mapView.controller.animateTo(geoPoint)
                // При первом получении местоположения ставим зум 15
                binding.mapView.controller.setZoom(15.0)
            }
        }

        viewModel.destination.observe(this) { location ->
            updateDestinationMarker(location)
        }
    }

    private fun setDestination(point: GeoPoint) {
        val location = Location(point.latitude, point.longitude)
        viewModel.setDestination(location)
    }

    private fun updateDestinationMarker(location: Location?) {
        destinationMarker?.let { binding.mapView.overlays.remove(it) }

        location?.let {
            val marker =
                Marker(binding.mapView).apply {
                    position = GeoPoint(it.latitude, it.longitude)
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    title = "Пункт назначения"
                    icon = ContextCompat.getDrawable(this@MainActivity, R.drawable.ic_destination)
                }
            destinationMarker = marker
            binding.mapView.overlays.add(marker)
            binding.fabNavigate.visibility = View.VISIBLE

            // Приблизить к маршруту
            binding.mapView.controller.setZoom(15.0)
        } ?: run {
            binding.fabNavigate.visibility = View.GONE
        }

        binding.mapView.invalidate()
    }

    private fun startNavigation() {
        val destination = viewModel.destination.value ?: return

        val intent =
            Intent(this, NavigationActivity::class.java).apply {
                putExtra(NavigationActivity.EXTRA_DEST_LAT, destination.latitude)
                putExtra(NavigationActivity.EXTRA_DEST_LON, destination.longitude)
            }
        startActivity(intent)
    }

    /**
     * Переключить отображение зарядных станций
     */
    private fun toggleChargingStations() {
        showChargingStations = !showChargingStations

        if (showChargingStations) {
            // Подсвечиваем кнопку - активно
            binding.btnCharging.setBackgroundColor(ContextCompat.getColor(this, R.color.charging_active_bg))
            binding.btnCharging.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.btnCharging.iconTint = ContextCompat.getColorStateList(this, R.color.white)

            // Показываем текст загрузки
            binding.btnCharging.text = "Загрузка..."

            loadChargingStations()
        } else {
            // Возвращаем обычное состояние
            resetChargingButton()
            clearChargingStations()
        }
    }

    /**
     * Сбросить стиль кнопки зарядки
     */
    private fun resetChargingButton() {
        binding.btnCharging.setBackgroundColor(ContextCompat.getColor(this, R.color.tonal_button_bg))
        binding.btnCharging.setTextColor(ContextCompat.getColor(this, R.color.on_surface))
        binding.btnCharging.iconTint = ContextCompat.getColorStateList(this, R.color.charging_green)
        binding.btnCharging.text = "Зарядка"
    }

    /**
     * Загрузить зарядные станции в текущей области карты
     */
    private fun loadChargingStations() {
        val boundingBox = binding.mapView.boundingBox

        lifecycleScope.launch {
            try {
                val stations =
                    chargingStationRepository.getStationsInArea(
                        boundingBox,
                        binding.mapView.zoomLevelDouble.toInt(),
                    )

                // Восстанавливаем текст кнопки
                binding.btnCharging.text = "Зарядка (${stations.size})"

                if (stations.isEmpty()) {
                    Toast.makeText(this@MainActivity, "Зарядные станции не найдены", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@MainActivity, "Найдено ${stations.size} зарядных станций", Toast.LENGTH_SHORT).show()
                }

                displayChargingStations(stations)
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "Ошибка загрузки: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Отобразить зарядные станции на карте
     */
    private fun displayChargingStations(stations: List<ChargingStation>) {
        clearChargingStations()

        stations.forEach { station ->
            val marker =
                Marker(binding.mapView).apply {
                    position = GeoPoint(station.latitude, station.longitude)
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    title = station.name ?: "Зарядная станция"
                    snippet = buildStationSnippet(station)
                    icon = ContextCompat.getDrawable(this@MainActivity, R.drawable.ic_charging_station)

                    // При клике — прокладка маршрута к станции
                    setOnMarkerClickListener { _, _ ->
                        navigateToChargingStation(station)
                        true
                    }
                }
            chargingStationMarkers.add(marker)
            binding.mapView.overlays.add(marker)
        }

        binding.mapView.invalidate()
    }

    /**
     * Построить описание станции
     */
    private fun buildStationSnippet(station: ChargingStation): String {
        val parts = mutableListOf<String>()

        station.address?.takeIf { it.isNotBlank() }?.let { parts.add(it) }

        if (station.connectorTypes.isNotEmpty()) {
            parts.add("Разъёмы: ${station.connectorTypes.joinToString(", ")}")
        }

        station.powerKw?.let { parts.add("Мощность: ${it.toInt()} кВт") }

        station.operator?.let { parts.add("Оператор: $it") }

        parts.add("Статус: ${station.status}")

        return parts.joinToString("\n")
    }

    /**
     * Очистить маркеры зарядных станций
     */
    private fun clearChargingStations() {
        chargingStationMarkers.forEach { binding.mapView.overlays.remove(it) }
        chargingStationMarkers.clear()
        binding.mapView.invalidate()
    }

    /**
     * Центрировать карту на моём местоположении
     */
    private fun centerOnMyLocation() {
        val location = viewModel.currentLocation.value
        if (location != null) {
            val geoPoint = GeoPoint(location.latitude, location.longitude)
            binding.mapView.controller.animateTo(geoPoint)
            binding.mapView.controller.setZoom(16.0)
        } else {
            // Если местоположение ещё не получено
            myLocationOverlay?.myLocation?.let { myLoc ->
                binding.mapView.controller.animateTo(myLoc)
                binding.mapView.controller.setZoom(16.0)
            } ?: run {
                Toast.makeText(this, "Ожидание GPS...", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun enableMyLocation() {
        LogUploader.i(TAG, "enableMyLocation: Setting up GPS")
        val locationManager = getSystemService(LOCATION_SERVICE) as android.location.LocationManager

        myLocationOverlay =
            MyLocationNewOverlay(GpsMyLocationProvider(this), binding.mapView).apply {
                enableMyLocation()
                LogUploader.i(TAG, "MyLocationOverlay enabled")

                // Ждём первого GPS-фикса
                runOnFirstFix {
                    this@apply.myLocation?.let { loc ->
                        LogUploader.i(TAG, "First GPS fix: ${loc.latitude}, ${loc.longitude}")
                        runOnUiThread {
                            binding.mapView.controller.animateTo(loc)
                            binding.mapView.controller.setZoom(15.0)

                            viewModel.setCurrentLocation(
                                Location(
                                    latitude = loc.latitude,
                                    longitude = loc.longitude,
                                ),
                            )
                        }
                    } ?: run {
                        LogUploader.w(TAG, "runOnFirstFix called but location is null")
                    }
                }
            }
        binding.mapView.overlays.add(myLocationOverlay)

        // Также слушаем обновления через LocationManager
        try {
            val locationListener =
                object : android.location.LocationListener {
                    override fun onLocationChanged(location: android.location.Location) {
                        viewModel.setCurrentLocation(
                            Location(
                                latitude = location.latitude,
                                longitude = location.longitude,
                            ),
                        )

                        // Обновляем ближайшую зарядную станцию
                        checkShowNearestCharging()
                    }

                    override fun onProviderEnabled(provider: String) {}

                    override fun onProviderDisabled(provider: String) {}

                    @Deprecated("Deprecated in API")
                    override fun onStatusChanged(
                        provider: String?,
                        status: Int,
                        extras: android.os.Bundle?,
                    ) {}
                }

            locationManager.requestLocationUpdates(
                android.location.LocationManager.GPS_PROVIDER,
                1000L,
                5f,
                locationListener,
            )
        } catch (e: SecurityException) {
            // Разрешение уже проверено
        }
    }

    private fun requestLocationPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION,
            ) == PackageManager.PERMISSION_GRANTED -> {
                enableMyLocation()
            }

            else -> {
                locationPermissionRequest.launch(
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION,
                    ),
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        binding.mapView.onResume()
        // Проверяем настройки при возобновлении
        checkShowNearestCharging()
    }

    override fun onPause() {
        super.onPause()
        binding.mapView.onPause()
        searchChargingJob?.cancel()
    }

    /**
     * Поиск ближайшей зарядной станции
     */
    private fun searchNearestChargingStation() {
        val prefs = getSharedPreferences("osmnav_prefs", MODE_PRIVATE)
        val showNearest = prefs.getBoolean("show_nearest_charging", false)

        if (!showNearest) {
            hideNearestChargingCard()
            return
        }

        val currentLocation = viewModel.currentLocation.value
        if (currentLocation == null) {
            // Пробуем получить местоположение из myLocationOverlay
            val myLoc = myLocationOverlay?.myLocation
            if (myLoc != null) {
                viewModel.setCurrentLocation(Location(myLoc.latitude, myLoc.longitude))
                LogUploader.w(TAG, "Using location from MyLocationOverlay: ${myLoc.latitude}, ${myLoc.longitude}")
            } else {
                LogUploader.w(TAG, "No location available for charging search")
            }
            return
        }

        LogUploader.i(TAG, "Searching charging stations at: ${currentLocation.latitude}, ${currentLocation.longitude}")
        val selectedConnectors = SettingsActivity.getSelectedConnectors(prefs)

        // Отменяем предыдущий поиск
        searchChargingJob?.cancel()

        searchChargingJob =
            lifecycleScope.launch {
                try {
                    // Расширяем область поиска (0.5 градуса ≈ 50км)
                    val radius = 0.5
                    val bbox =
                        BoundingBox(
                            currentLocation.latitude + radius,
                            currentLocation.longitude + radius,
                            currentLocation.latitude - radius,
                            currentLocation.longitude - radius,
                        )

                    LogUploader.i(TAG, "Fetching stations from Overpass API...")
                    val stations = chargingStationRepository.getStationsInArea(bbox, 14)
                    LogUploader.i(TAG, "Found ${stations.size} stations")

                    if (stations.isEmpty()) {
                        runOnUiThread {
                            Toast.makeText(this@MainActivity, "Станции не найдены в радиусе 50км", Toast.LENGTH_SHORT).show()
                        }
                        hideNearestChargingCard()
                        return@launch
                    }

                    // Фильтруем по типу разъёмов
                    val filtered =
                        stations.filter { station ->
                            station.connectorTypes.any { connector ->
                                selectedConnectors.any { selected ->
                                    connector.contains(selected, ignoreCase = true)
                                }
                            }
                        }

                    LogUploader.i(TAG, "Filtered ${filtered.size} stations with connectors: $selectedConnectors")

                    // Находим ближайшую
                    val nearest =
                        filtered.minByOrNull { station ->
                            calculateDistance(
                                currentLocation.latitude,
                                currentLocation.longitude,
                                station.latitude,
                                station.longitude,
                            )
                        }

                    if (nearest != null) {
                        nearestChargingStation = nearest
                        showNearestChargingCard(nearest, currentLocation)
                    } else {
                        runOnUiThread {
                            Toast
                                .makeText(
                                    this@MainActivity,
                                    "Нет станций с разъёмами: ${selectedConnectors.joinToString()}",
                                    Toast.LENGTH_SHORT,
                                ).show()
                        }
                        hideNearestChargingCard()
                    }
                } catch (e: Exception) {
                    runOnUiThread {
                        Toast.makeText(this@MainActivity, "Ошибка: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
    }

    /**
     * Показать карточку ближайшей станции
     */
    private fun showNearestChargingCard(
        station: ChargingStation,
        currentLocation: Location,
    ) {
        val distance =
            calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                station.latitude,
                station.longitude,
            )

        val distanceText =
            if (distance < 1000) {
                "${distance.toInt()} м"
            } else {
                String.format("%.1f км", distance / 1000)
            }

        runOnUiThread {
            binding.viewNearestCharging.cardNearestCharging.visibility = View.VISIBLE
            binding.viewNearestCharging.tvChargingDistance.text = distanceText
            binding.viewNearestCharging.tvChargingName.text = station.address ?: station.name ?: "Зарядная станция"
        }
    }

    /**
     * Скрыть карточку
     */
    private fun hideNearestChargingCard() {
        runOnUiThread {
            binding.viewNearestCharging.cardNearestCharging.visibility = View.GONE
        }
    }

    /**
     * Показать диалог перестроения маршрута
     */
    private fun showRerouteDialog() {
        val station = nearestChargingStation ?: return

        AlertDialog
            .Builder(this)
            .setTitle("Ближайшая зарядная станция")
            .setMessage(
                "${station.name ?: "Зарядная станция"}\n" +
                    "${station.address ?: ""}\n" +
                    "Разъёмы: ${station.connectorTypes.joinToString(", ")}",
            ).setPositiveButton("Построить маршрут") { _, _ ->
                navigateToChargingStation(station)
            }.setNegativeButton("Отмена", null)
            .show()
    }

    /**
     * Рассчитать расстояние между двумя точками (приблизительно)
     */
    private fun calculateDistance(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double,
    ): Double {
        val r = 6371000.0 // радиус Земли в метрах
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return r * c
    }

    /**
     * Построить маршрут до зарядной станции
     */
    private fun navigateToChargingStation(station: ChargingStation) {
        val currentLocation = viewModel.currentLocation.value
        if (currentLocation == null) {
            Toast.makeText(this, "Ожидание GPS...", Toast.LENGTH_SHORT).show()
            return
        }

        // Устанавливаем точку назначения
        val destLocation =
            Location(
                latitude = station.latitude,
                longitude = station.longitude,
                name = station.name ?: station.address ?: "Зарядная станция",
            )

        viewModel.setDestination(destLocation)

        // Переходим на экран навигации
        startNavigation()
    }
}
