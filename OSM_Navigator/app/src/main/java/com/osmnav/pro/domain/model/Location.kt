package com.osmnav.pro.domain.model

/**
 * Модель местоположения
 */
data class Location(
    val latitude: Double,
    val longitude: Double,
    val name: String? = null,
    val address: String? = null,
) {
    /** Псевдоним для name — для совместимости с разными источниками */
    val displayName: String? get() = name ?: address
}

/**
 * Модель маршрута
 */
data class Route(
    val points: List<Location>,
    val distanceMeters: Long,
    val durationSeconds: Long,
    val instructions: List<RouteInstruction>,
)

/**
 * Инструкция маршрута
 */
data class RouteInstruction(
    val text: String,
    val distanceMeters: Long,
    val maneuver: Maneuver,
    val point: Location,
    /** Название текущей улицы */
    val streetName: String? = null,
    /** Продолжительность сегмента в секундах */
    val durationSeconds: Long = 0,
)

/**
 * Тип манёвра
 */
enum class Maneuver {
    START,
    TURN_LEFT,
    TURN_RIGHT,
    SLIGHT_LEFT,
    SLIGHT_RIGHT,
    SHARP_LEFT,
    SHARP_RIGHT,
    U_TURN,
    CONTINUE,
    ROUNDABOUT,
    DESTINATION,
    DEPART,
    MERGE,
    ON_RAMP,
    OFF_RAMP,
    END,
    FORK_LEFT,
    FORK_RIGHT,
    START_FROM_HERE,
}

/**
 * POI категория
 */
enum class PoiCategory {
    RESTAURANT,
    GAS_STATION,
    PARKING,
    HOTEL,
    ATM,
    HOSPITAL,
    PHARMACY,
    SHOPPING,
    POLICE,
    POST,
}
