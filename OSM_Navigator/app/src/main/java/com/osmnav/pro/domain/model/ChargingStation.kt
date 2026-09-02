package com.osmnav.pro.domain.model

/**
 * Зарядная станция для электромобилей
 */
data class ChargingStation(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val name: String?,
    val operator: String?,
    val network: String?,
    val address: String?,
    /** Мощность в кВт */
    val powerKw: Double?,
    /** Типы разъёмов: CCS, Type2, CHAdeMO и т.д. */
    val connectorTypes: List<String>,
    /** Количество точек зарядки */
    val count: Int,
    /** Статус: operational, offline, etc */
    val status: String,
    /** Бесплатная или платная */
    val isFree: Boolean?,
    /** Круглосуточная */
    val is24h: Boolean?,
)
