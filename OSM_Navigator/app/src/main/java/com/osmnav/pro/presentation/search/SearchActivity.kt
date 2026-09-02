package com.osmnav.pro.presentation.search

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.osmnav.pro.databinding.ActivitySearchBinding
import com.osmnav.pro.domain.model.Location
import com.osmnav.pro.presentation.navigation.NavigationActivity

/**
 * Экран поиска адресов и POI
 */
class SearchActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySearchBinding
    private lateinit var viewModel: SearchViewModel
    private lateinit var adapter: SearchResultsAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySearchBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[SearchViewModel::class.java]

        setupUI()
        setupRecyclerView()
        setupObservers()
    }

    private fun setupUI() {
        binding.toolbar.setNavigationOnClickListener { finish() }

        binding.etSearch.addTextChangedListener(
            object : TextWatcher {
                override fun beforeTextChanged(
                    s: CharSequence?,
                    start: Int,
                    count: Int,
                    after: Int,
                ) {}

                override fun onTextChanged(
                    s: CharSequence?,
                    start: Int,
                    before: Int,
                    count: Int,
                ) {}

                override fun afterTextChanged(s: Editable?) {
                    viewModel.search(s?.toString() ?: "")
                }
            },
        )

        // Категории быстрого поиска
        setupQuickCategories()
    }

    private fun setupRecyclerView() {
        adapter =
            SearchResultsAdapter { result ->
                navigateToLocation(result)
            }
        binding.rvResults.layoutManager = LinearLayoutManager(this)
        binding.rvResults.adapter = adapter
    }

    private fun setupObservers() {
        viewModel.searchResults.observe(this) { results ->
            adapter.submitList(results)
            binding.tvNoResults.visibility =
                if (results.isEmpty() &&
                    binding.etSearch.text?.isNotEmpty() == true
                ) {
                    android.view.View.VISIBLE
                } else {
                    android.view.View.GONE
                }
        }
    }

    private fun setupQuickCategories() {
        binding.chipGasStation.setOnClickListener {
            viewModel.searchNearby("gas_station")
        }
        binding.chipParking.setOnClickListener {
            viewModel.searchNearby("parking")
        }
        binding.chipRestaurant.setOnClickListener {
            viewModel.searchNearby("restaurant")
        }
        binding.chipAtm.setOnClickListener {
            viewModel.searchNearby("atm")
        }
    }

    private fun navigateToLocation(location: Location) {
        val intent =
            Intent(this, NavigationActivity::class.java).apply {
                putExtra(NavigationActivity.EXTRA_DEST_LAT, location.latitude)
                putExtra(NavigationActivity.EXTRA_DEST_LON, location.longitude)
                // Передаём название для отображения на приборной панели
                putExtra(NavigationActivity.EXTRA_DEST_NAME, location.name ?: location.displayName ?: "Пункт назначения")
            }
        startActivity(intent)
        finish()
    }
}
