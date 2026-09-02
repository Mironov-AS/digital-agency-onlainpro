package com.osmnav.pro.presentation.main

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.osmnav.pro.R
import com.osmnav.pro.databinding.ActivityMainBinding
import com.osmnav.pro.domain.model.Location
import com.osmnav.pro.presentation.navigation.NavigationActivity
import com.osmnav.pro.presentation.search.SearchActivity
import com.osmnav.pro.presentation.settings.SettingsActivity
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay

/**
 * Главный экран с картой
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: MainViewModel
    
    private var myLocationOverlay: MyLocationNewOverlay? = null
    private var destinationMarker: Marker? = null
    
    private val locationPermissionRequest = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
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
            
            // Центр на Москве по умолчанию
            controller.setZoom(10.0)
            controller.setCenter(GeoPoint(55.7558, 37.6173))
            
            // Обработка клика по карте
            val mapEventsOverlay = MapEventsOverlay(object : MapEventsReceiver {
                override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                    p?.let { setDestination(it) }
                    return true
                }
                
                override fun longPressHelper(p: GeoPoint?): Boolean {
                    return false
                }
            })
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
    }
    
    private fun setupObservers() {
        viewModel.currentLocation.observe(this) { location ->
            location?.let {
                val geoPoint = GeoPoint(it.latitude, it.longitude)
                binding.mapView.controller.animateTo(geoPoint)
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
            val marker = Marker(binding.mapView).apply {
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
        
        val intent = Intent(this, NavigationActivity::class.java).apply {
            putExtra(NavigationActivity.EXTRA_DEST_LAT, destination.latitude)
            putExtra(NavigationActivity.EXTRA_DEST_LON, destination.longitude)
        }
        startActivity(intent)
    }
    
    private fun enableMyLocation() {
        myLocationOverlay = MyLocationNewOverlay(GpsMyLocationProvider(this), binding.mapView).apply {
            enableMyLocation()
        }
        binding.mapView.overlays.add(myLocationOverlay)
    }
    
    private fun requestLocationPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED -> {
                enableMyLocation()
            }
            else -> {
                locationPermissionRequest.launch(arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ))
            }
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
}
