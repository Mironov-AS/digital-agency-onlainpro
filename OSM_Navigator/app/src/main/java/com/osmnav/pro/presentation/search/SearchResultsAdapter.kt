package com.osmnav.pro.presentation.search

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.osmnav.pro.databinding.ItemSearchResultBinding
import com.osmnav.pro.domain.model.Location

/**
 * Адаптер для списка результатов поиска
 */
class SearchResultsAdapter(
    private val onItemClick: (Location) -> Unit,
) : ListAdapter<Location, SearchResultsAdapter.ViewHolder>(LocationDiffCallback()) {
    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int,
    ): ViewHolder {
        val binding =
            ItemSearchResultBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false,
            )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(
        holder: ViewHolder,
        position: Int,
    ) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(
        private val binding: ItemSearchResultBinding,
    ) : RecyclerView.ViewHolder(binding.root) {
        init {
            binding.root.setOnClickListener {
                val position = adapterPosition
                if (position != RecyclerView.NO_POSITION) {
                    onItemClick(getItem(position))
                }
            }
        }

        fun bind(location: Location) {
            binding.tvName.text = location.name ?: "Неизвестное место"
            binding.tvAddress.text = location.address ?: ""
        }
    }

    class LocationDiffCallback : DiffUtil.ItemCallback<Location>() {
        override fun areItemsTheSame(
            oldItem: Location,
            newItem: Location,
        ): Boolean =
            oldItem.latitude == newItem.latitude &&
                oldItem.longitude == newItem.longitude

        override fun areContentsTheSame(
            oldItem: Location,
            newItem: Location,
        ): Boolean = oldItem == newItem
    }
}
