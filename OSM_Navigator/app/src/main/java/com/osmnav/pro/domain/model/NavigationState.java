package com.osmnav.pro.domain.model;

/**
 * Состояние навигации для проекции на приборную панель.
 * Передаётся в DashboardProjectionManager при каждом обновлении.
 */
public class NavigationState {

    /** Текст текущего манёвра ("Поверните направо на ул. Ленина") */
    public String maneuverText;

    /** Тип манёвра (TURN_LEFT, TURN_RIGHT, ROUNDABOUT, etc.) */
    public String maneuverType;

    /** Расстояние до манёвра в метрах */
    public int distanceMeters;

    /** Текущая улица */
    public String streetName;

    /** Общее оставшееся расстояние в метрах */
    public long totalDistanceMeters;

    /** Оставшееся время в секундах */
    public int remainingSeconds;

    /** Текст следующего манёвра */
    public String nextManeuverText;

    /** Расстояние до следующего манёвра */
    public int nextDistanceMeters;

    /** Текущая скорость в км/ч */
    public int currentSpeedKmh;

    /** Ограничение скорости на текущем участке */
    public int speedLimit;

    /** Широта текущего положения */
    public double currentLat;

    /** Долгота текущего положения */
    public double currentLon;

    /** Название пункта назначения */
    public String destinationName;

    public NavigationState() {}
}
