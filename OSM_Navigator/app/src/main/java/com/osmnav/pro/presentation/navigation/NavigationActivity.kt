package com.osmnav.pro.presentation.navigation

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.osmnav.pro.R
import com.osmnav.pro.data.remote.LogUploader
import com.osmnav.pro.databinding.ActivityNavigationBinding
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polyline
import com.osmnav.pro.domain.model.Location as NavLocation

/**
 * Экран активной навигации с голосовыми подсказками и проекцией на приборную панель
 */
class NavigationActivity : AppCompatActivity() {
    companion object {
        const val EXTRA_DEST_LAT = "dest_lat"
        const val EXTRA_DEST_LON = "dest_lon"
        const val EXTRA_DEST_NAME = "dest_name"
        private const val TAG = "NavigationActivity"
    }

    private lateinit var binding: ActivityNavigationBinding
    private lateinit var viewModel: NavigationViewModel

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var locationCallback: LocationCallback? = null

    private var destinationMarker: Marker? = null
    private var routePolyline: Polyline? = null
    private var myLocationMarker: Marker? = null

    private var pendingDestination: NavLocation? = null
    private var hasFirstLocation = false

    private val locationPermissionLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions(),
        ) { permissions ->
            if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true) {
                startLocationUpdates()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        LogUploader.i(TAG, "NavigationActivity started")

        // Инициализация OSMDroid
        Configuration.getInstance().userAgentValue = packageName

        binding = ActivityNavigationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[NavigationViewModel::class.java]
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // Получаем данные о маршруте
        val destLat = intent.getDoubleExtra(EXTRA_DEST_LAT, 0.0)
        val destLon = intent.getDoubleExtra(EXTRA_DEST_LON, 0.0)
        val destName = intent.getStringExtra(EXTRA_DEST_NAME) ?: "Unknown"
        LogUploader.i(TAG, "Destination: $destName at ($destLat, $destLon)")

        setupMap()
        setupUI()
        setupObservers()
        requestLocationPermission()

        // Получаем пункт назначения (запомним, начнём навигацию после получения GPS)
        val destLat = intent.getDoubleExtra(EXTRA_DEST_LAT, 0.0)
        val destLon = intent.getDoubleExtra(EXTRA_DEST_LON, 0.0)

        if (destLat != 0.0 && destLon != 0.0) {
            pendingDestination = NavLocation(destLat, destLon)
            Log.d(TAG, "Destination set: $destLat, $destLon, waiting for GPS...")
        } else {
            Toast.makeText(this, "Не указан пункт назначения", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun setupMap() {
        binding.mapView.apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            controller.setZoom(17.0)
        }
    }

    private fun setupUI() {
        binding.btnClose.setOnClickListener {
            viewModel.stopNavigation()
            finish()
        }

        binding.btnRecenter.setOnClickListener {
            viewModel.currentLocation.value?.let { location ->
                binding.mapView.controller.animateTo(
                    GeoPoint(location.latitude, location.longitude),
                )
            }
        }

        binding.btnVoice.setOnClickListener {
            viewModel.toggleVoice()
        }

        binding.btnStop.setOnClickListener {
            viewModel.stopNavigation()
            finish()
        }
    }

    private fun setupObservers() {
        viewModel.route.observe(this) { route ->
            route?.let { displayRoute(it) }
        }

        viewModel.currentInstruction.observe(this) { instruction ->
            instruction?.let { updateInstructionPanel(it) }
        }

        viewModel.nextInstruction.observe(this) { instruction ->
            binding.tvNextManeuver.text = instruction?.let {
                "Затем: ${it.text} — ${formatDistance(it.distanceMeters)}"
            } ?: ""
        }

        viewModel.distanceRemaining.observe(this) { distance ->
            binding.tvDistance.text = formatDistance(distance)
        }

        viewModel.timeRemaining.observe(this) { seconds ->
            binding.tvTime.text = formatTime(seconds)
        }

        viewModel.currentLocation.observe(this) { location ->
            location?.let { updateMyLocation(it) }
        }

        viewModel.error.observe(this) { error ->
            error?.let {
                Toast.makeText(this, it, Toast.LENGTH_LONG).show()
            }
        }

        viewModel.isNavigating.observe(this) { isNavigating ->
            binding.btnStop.visibility = if (isNavigating) View.VISIBLE else View.GONE
        }
    }

    private fun displayRoute(route: com.osmnav.pro.domain.model.Route) {
        // Очищаем старые оверлеи
        binding.mapView.overlays.clear()

        // Рисуем маршрут
        routePolyline =
            Polyline().apply {
                outlinePaint.color = getColor(R.color.nav_route)
                outlinePaint.strokeWidth = 12f
            }

        route.points.forEach { location ->
            routePolyline?.addPoint(GeoPoint(location.latitude, location.longitude))
        }

        routePolyline?.let { binding.mapView.overlays.add(it) }

        // Маркер назначения
        val destPoint = route.points.lastOrNull()
        destPoint?.let {
            destinationMarker =
                Marker(binding.mapView).apply {
                    position = GeoPoint(it.latitude, it.longitude)
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    icon = getDrawable(R.drawable.ic_destination)
                    title = "Пункт назначения"
                }
            destinationMarker?.let { marker -> binding.mapView.overlays.add(marker) }
        }

        // Центрируем на текущей позиции пользователя при старте
        viewModel.currentLocation.value?.let { location ->
            binding.mapView.controller.animateTo(
                GeoPoint(location.latitude, location.longitude),
            )
            binding.mapView.controller.setZoom(17.0)
        } ?: run {
            // Fallback: если позиция не доступна, показываем начало маршрута
            route.points.firstOrNull()?.let { first ->
                binding.mapView.controller.animateTo(
                    GeoPoint(first.latitude, first.longitude),
                )
                binding.mapView.controller.setZoom(15.0)
            }
        }

        binding.mapView.invalidate()
    }

    private fun updateInstructionPanel(instruction: com.osmnav.pro.domain.model.RouteInstruction) {
        binding.tvManeuver.text = instruction.text
        binding.tvNextDistance.text = formatDistance(instruction.distanceMeters)

        // Обновляем иконку манёвра
        val iconRes = getManeuverIcon(instruction.maneuver)
        binding.ivManeuver.setImageResource(iconRes)

        // Обновляем название улицы
        binding.tvStreet.text = instruction.streetName ?: ""
        binding.tvStreet.visibility = if (instruction.streetName.isNullOrEmpty()) View.GONE else View.VISIBLE
    }

    private fun updateMyLocation(location: android.location.Location) {
        val geoPoint = GeoPoint(location.latitude, location.longitude)

        // Обновляем или создаём маркер текущего положения
        if (myLocationMarker == null) {
            myLocationMarker =
                Marker(binding.mapView).apply {
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
                    icon = getDrawable(R.drawable.ic_my_location)
                    title = "Вы"
                }
            binding.mapView.overlays.add(myLocationMarker)
        }

        myLocationMarker?.position = geoPoint

        // Если включено автоследование — центрируем карту
        // (можно добавить кнопку для этого)

        binding.mapView.invalidate()
    }

    private fun requestLocationPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION,
            ) == PackageManager.PERMISSION_GRANTED -> {
                startLocationUpdates()
            }

            else -> {
                locationPermissionLauncher.launch(
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION,
                    ),
                )
            }
        }
    }

    private fun startLocationUpdates() {
        val locationRequest =
            LocationRequest
                .Builder(
                    Priority.PRIORITY_HIGH_ACCURACY,
                    3000, // 3 секунды
                ).setMinUpdateIntervalMillis(1000)
                .build()

        locationCallback =
            object : LocationCallback() {
                override fun onLocationResult(result: LocationResult) {
                    result.lastLocation?.let { location ->
                        viewModel.updateLocation(location)

                        // После получения первой GPS позиции - начинаем навигацию
                        if (!hasFirstLocation && pendingDestination != null) {
                            hasFirstLocation = true
                            Log.d(TAG, "First GPS received, starting navigation")
                            viewModel.startNavigation(pendingDestination!!)
                        }
                    }
                }
            }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback!!,
                mainLooper,
            )
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permission denied", e)
        }
    }

    private fun getManeuverIcon(maneuver: com.osmnav.pro.domain.model.Maneuver): Int =
        when (maneuver) {
            com.osmnav.pro.domain.model.Maneuver.TURN_LEFT -> R.drawable.ic_turn_left
            com.osmnav.pro.domain.model.Maneuver.TURN_RIGHT -> R.drawable.ic_turn_right
            com.osmnav.pro.domain.model.Maneuver.ROUNDABOUT -> R.drawable.ic_roundabout
            com.osmnav.pro.domain.model.Maneuver.U_TURN -> R.drawable.ic_turn_left
            else -> R.drawable.ic_navigation
        }

    private fun formatDistance(meters: Long): String =
        when {
            meters >= 1000 -> String.format("%.1f км", meters / 1000.0)
            else -> "$meters м"
        }

    private fun formatTime(seconds: Long): String {
        val minutes = seconds / 60
        return when {
            minutes >= 60 -> "${minutes / 60}ч ${minutes % 60}мин"
            else -> "$minutes мин"
        }
    }

    override fun onResume() {
        super.onResume()
        binding.mapView.onResume()
    }

    override fun onPause() {
        super.onPause()
        binding.mapView.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        locationCallback?.let { fusedLocationClient.removeLocationUpdates(it) }
    }
}
