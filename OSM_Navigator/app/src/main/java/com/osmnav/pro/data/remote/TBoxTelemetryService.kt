package com.osmnav.pro.data.remote

import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Сервис для чтения телематики с Т-Бокс через CAN шину
 * Данные передаются по TCP порту 8630 вместе с GPS
 *
 * Skywell ET5 EV Telemetry:
 * - SOC (State of Charge) - заряд батареи
 * - Speed - скорость
 * - Door status - статус дверей
 * - Voltage - напряжение батареи
 * - RTIG - статус зажигания/зарядки
 * - Temperature - температура
 */
class TBoxTelemetryService {
    companion object {
        private const val TAG = "TBoxTelemetry"

        // CAN ID для различных данных (из caniditem.ini)
        private const val CAN_ID_BMS_SOC = 0x105 // BMS State of Charge
        private const val CAN_ID_VCU_STATUS = 0x211 // VCU Status
        private const val CAN_ID_DOOR_STATUS = 0x2B3 // Door status
        private const val CAN_ID_BATTERY_VOLTAGE = 0x2F3 // Battery voltage
        private const val CAN_ID_SPEED = 0x3B1 // Vehicle speed
    }

    // Состояние телематики
    private val _telemetryState = MutableStateFlow(VehicleTelemetry())
    val telemetryState: StateFlow<VehicleTelemetry> = _telemetryState.asStateFlow()

    // Последнее время обновления
    private var lastUpdate = 0L

    /**
     * Состояние транспортного средства
     */
    data class VehicleTelemetry(
        // Батарея
        val stateOfCharge: Int = 0, // 0-100%
        val batteryVoltage: Float = 0f, // Вольты
        val batteryCurrent: Float = 0f, // Амперы
        val batteryTemperature: Int = 0, // °C
        val chargingStatus: ChargingStatus = ChargingStatus.NONE,
        // Статус автомобиля
        val speed: Int = 0, // км/ч
        val odometer: Int = 0, // км
        val gear: GearPosition = GearPosition.PARK,
        val doorStatus: DoorStatus = DoorStatus.ALL_CLOSED,
        val ignitionStatus: IgnitionStatus = IgnitionStatus.OFF,
        // Время
        val lastUpdate: Long = 0L,
        val isConnected: Boolean = false,
        val source: String = "Unknown",
    )

    enum class ChargingStatus {
        NONE,
        CHARGING,
        FAST_CHARGING,
        COMPLETED,
    }

    enum class GearPosition {
        PARK,
        REVERSE,
        NEUTRAL,
        DRIVE,
        SPORT,
        ECO,
        UNKNOWN,
    }

    enum class DoorStatus {
        ALL_CLOSED,
        DRIVER_OPEN,
        PASSENGER_OPEN,
        REAR_LEFT_OPEN,
        REAR_RIGHT_OPEN,
        TRUNK_OPEN,
        HOOD_OPEN,
        ANY_OPEN,
    }

    enum class IgnitionStatus {
        OFF,
        ACC,
        ON,
        START,
        UNKNOWN,
    }

    /**
     * Обработать входящие данные от Т-Бокс
     */
    fun processData(data: ByteArray) {
        if (data.size < 8) return

        try {
            val buffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN)

            // Проверяем заголовок
            val header = buffer.int
            if (header and 0xFFFF != 0xAAAA) {
                // Может быть текстовый формат
                processTextData(String(data))
                return
            }

            val msgType = buffer.get().toInt() and 0xFF
            val length = buffer.short.toInt() and 0xFFFF

            when (msgType) {
                0x20 -> {
                    parseTelemetryFrame(buffer, length)
                }

                0x21 -> {
                    parseCanFrame(buffer, length)
                }

                else -> {
                    // Пробуем парсить как общие данные
                    parseGeneralData(buffer, length)
                }
            }

            lastUpdate = System.currentTimeMillis()
            updateConnectionStatus(true)
        } catch (e: Exception) {
            Log.w(TAG, "Parse error: ${e.message}")
        }
    }

    /**
     * Парсинг текстовых данных (NMEA или простой текст)
     */
    private fun processTextData(text: String) {
        val line = text.trim()

        // Ищем паттерны like "soc=75" or "speed=60"
        when {
            line.startsWith("SOC:") || line.contains("soc=") -> {
                extractInt(line, listOf("soc=", "SOC:"))?.let { soc ->
                    updateSOC(soc)
                }
            }

            line.startsWith("SPEED:") || line.contains("speed=") -> {
                extractInt(line, listOf("speed=", "SPEED:"))?.let { speed ->
                    updateSpeed(speed)
                }
            }

            line.startsWith("VOLTAGE:") || line.contains("voltage=") -> {
                extractFloat(line, listOf("voltage=", "VOLTAGE:"))?.let { voltage ->
                    updateBatteryVoltage(voltage)
                }
            }

            line.startsWith("DOOR:") || line.contains("door=") -> {
                extractHex(line, listOf("door="))?.let { door ->
                    updateDoorStatus(door)
                }
            }
        }
    }

    /**
     * Парсинг CAN фрейма
     */
    private fun parseCanFrame(
        buffer: ByteBuffer,
        length: Int,
    ) {
        if (length < 8) return

        try {
            val canId = buffer.int
            val dlc = buffer.get().toInt() and 0xFF

            when (canId) {
                CAN_ID_BMS_SOC -> {
                    parseBmsSOC(buffer, dlc)
                }

                CAN_ID_VCU_STATUS -> {
                    parseVcuStatus(buffer, dlc)
                }

                CAN_ID_DOOR_STATUS -> {
                    parseDoorStatus(buffer, dlc)
                }

                CAN_ID_BATTERY_VOLTAGE -> {
                    parseBatteryVoltage(buffer, dlc)
                }

                CAN_ID_SPEED -> {
                    parseSpeedFrame(buffer, dlc)
                }

                else -> {
                    // Логируем неизвестный CAN ID
                    LogUploader.d(TAG, "Unknown CAN ID: 0x${Integer.toHexString(canId)}")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "CAN parse error: ${e.message}")
        }
    }

    /**
     * Парсинг BMS SOC (Battery Management System)
     * CAN ID: 0x105
     * Данные: байты 0-1 = SOC (0.1%), байты 2-3 = напряжение (0.1V)
     */
    private fun parseBmsSOC(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val socRaw = buffer.short.toInt() and 0xFFFF
        val voltageRaw = buffer.short.toInt() and 0xFFFF

        val soc = socRaw / 10 // 0.1% -> %
        val voltage = voltageRaw / 10f

        updateSOC(soc)
        updateBatteryVoltage(voltage)

        LogUploader.d(TAG, "BMS: SOC=$soc%, Voltage=${voltage}V")
    }

    /**
     * Парсинг статуса VCU (Vehicle Control Unit)
     * CAN ID: 0x211
     * Байт 0: статус зажигания/зарядки
     * Байт 1: передача
     */
    private fun parseVcuStatus(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val ignitionByte = buffer.get().toInt()
        val gearByte = buffer.get().toInt()

        updateIgnitionStatus(ignitionByte)
        updateGearPosition(gearByte)

        LogUploader.d(TAG, "VCU: Ignition=$ignitionByte, Gear=$gearByte")
    }

    /**
     * Парсинг статуса дверей
     * CAN ID: 0x2B3
     * Байт 0: битовая маска дверей
     */
    private fun parseDoorStatus(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 1) return

        val doorByte = buffer.get().toInt()
        updateDoorStatus(doorByte)

        LogUploader.d(TAG, "Door: 0x${Integer.toHexString(doorByte)}")
    }

    /**
     * Парсинг напряжения батареи
     * CAN ID: 0x2F3
     * Байты 0-1: напряжение (0.1V)
     */
    private fun parseBatteryVoltage(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val voltageRaw = buffer.short.toInt() and 0xFFFF
        val voltage = voltageRaw / 10f

        updateBatteryVoltage(voltage)
    }

    /**
     * Парсинг скорости
     * CAN ID: 0x3B1
     * Байты 0-1: скорость (0.1 km/h)
     */
    private fun parseSpeedFrame(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val speedRaw = buffer.short.toInt() and 0xFFFF
        val speed = speedRaw / 10

        updateSpeed(speed)
    }

    /**
     * Парсинг общих данных
     */
    private fun parseGeneralData(
        buffer: ByteBuffer,
        length: Int,
    ) {
        // Пытаемся извлечь известные паттерны
        val remaining = ByteArray(length)
        buffer.get(remaining)

        val text = String(remaining)
        processTextData(text)
    }

    /**
     * Парсинг фрейма телематики
     */
    private fun parseTelemetryFrame(
        buffer: ByteBuffer,
        length: Int,
    ) {
        if (length < 16) return

        try {
            val soc = buffer.short.toInt() and 0xFFFF
            val voltage = buffer.short.toInt() and 0xFFFF
            val current = buffer.short.toInt()
            val temp = buffer.short.toInt()
            val status = buffer.int

            updateSOC(soc)
            updateBatteryVoltage(voltage / 10f)
            updateBatteryCurrent(current / 10f)
            updateBatteryTemperature(temp)
            updateChargingStatus(status)
        } catch (e: Exception) {
            Log.w(TAG, "Telemetry parse error: ${e.message}")
        }
    }

    // ==================== Update Methods ====================

    private fun updateSOC(soc: Int) {
        val current = _telemetryState.value
        if (current.stateOfCharge != soc) {
            _telemetryState.value =
                current.copy(
                    stateOfCharge = soc.coerceIn(0, 100),
                    lastUpdate = System.currentTimeMillis(),
                )

            // Логируем изменение SOC
            LogUploader.i(TAG, "Battery SOC: $soc%")
        }
    }

    private fun updateBatteryVoltage(voltage: Float) {
        val current = _telemetryState.value
        if (kotlin.math.abs(current.batteryVoltage - voltage) > 0.5f) {
            _telemetryState.value =
                current.copy(
                    batteryVoltage = voltage,
                    lastUpdate = System.currentTimeMillis(),
                )
        }
    }

    private fun updateBatteryCurrent(current: Float) {
        val state = _telemetryState.value
        _telemetryState.value =
            state.copy(
                batteryCurrent = current,
                lastUpdate = System.currentTimeMillis(),
            )
    }

    private fun updateBatteryTemperature(temp: Int) {
        val state = _telemetryState.value
        _telemetryState.value =
            state.copy(
                batteryTemperature = temp,
                lastUpdate = System.currentTimeMillis(),
            )
    }

    private fun updateSpeed(speed: Int) {
        val state = _telemetryState.value
        if (state.speed != speed) {
            _telemetryState.value =
                state.copy(
                    speed = speed.coerceAtLeast(0),
                    lastUpdate = System.currentTimeMillis(),
                )
        }
    }

    private fun updateGearPosition(gear: Int) {
        val position =
            when (gear) {
                0 -> GearPosition.PARK
                1 -> GearPosition.REVERSE
                2 -> GearPosition.NEUTRAL
                3 -> GearPosition.DRIVE
                4 -> GearPosition.SPORT
                5 -> GearPosition.ECO
                else -> GearPosition.UNKNOWN
            }

        val state = _telemetryState.value
        if (state.gear != position) {
            _telemetryState.value =
                state.copy(
                    gear = position,
                    lastUpdate = System.currentTimeMillis(),
                )
        }
    }

    private fun updateDoorStatus(doorByte: Int) {
        val status =
            when (doorByte) {
                0 -> {
                    DoorStatus.ALL_CLOSED
                }

                1 -> {
                    DoorStatus.DRIVER_OPEN
                }

                2 -> {
                    DoorStatus.PASSENGER_OPEN
                }

                4 -> {
                    DoorStatus.REAR_LEFT_OPEN
                }

                8 -> {
                    DoorStatus.REAR_RIGHT_OPEN
                }

                16 -> {
                    DoorStatus.TRUNK_OPEN
                }

                32 -> {
                    DoorStatus.HOOD_OPEN
                }

                else -> {
                    if (doorByte > 0) DoorStatus.ANY_OPEN else DoorStatus.ALL_CLOSED
                }
            }

        val state = _telemetryState.value
        _telemetryState.value =
            state.copy(
                doorStatus = status,
                lastUpdate = System.currentTimeMillis(),
            )
    }

    private fun updateIgnitionStatus(status: Int) {
        val ignition =
            when (status) {
                0 -> IgnitionStatus.OFF
                1 -> IgnitionStatus.ACC
                2 -> IgnitionStatus.ON
                3 -> IgnitionStatus.START
                else -> IgnitionStatus.UNKNOWN
            }

        val state = _telemetryState.value
        _telemetryState.value =
            state.copy(
                ignitionStatus = ignition,
                lastUpdate = System.currentTimeMillis(),
            )
    }

    private fun updateChargingStatus(status: Int) {
        val charging =
            when {
                status and 0x01 != 0 -> ChargingStatus.CHARGING
                status and 0x02 != 0 -> ChargingStatus.FAST_CHARGING
                status and 0x04 != 0 -> ChargingStatus.COMPLETED
                else -> ChargingStatus.NONE
            }

        val state = _telemetryState.value
        _telemetryState.value =
            state.copy(
                chargingStatus = charging,
                lastUpdate = System.currentTimeMillis(),
            )
    }

    private fun updateConnectionStatus(connected: Boolean) {
        val state = _telemetryState.value
        if (state.isConnected != connected) {
            _telemetryState.value =
                state.copy(
                    isConnected = connected,
                    source = if (connected) "T-Box" else "Disconnected",
                )

            if (connected) {
                LogUploader.i(TAG, "T-Box telemetry connected")
            }
        }
    }

    // ==================== Helper Methods ====================

    private fun extractInt(
        text: String,
        patterns: List<String>,
    ): Int? {
        for (pattern in patterns) {
            val index = text.indexOf(pattern, ignoreCase = true)
            if (index >= 0) {
                val start = index + pattern.length
                val end =
                    text
                        .indexOfAny(charArrayOf(' ', '\n', ',', ';'), start)
                        .takeIf { it > start } ?: text.length
                return text.substring(start, end).trim().toIntOrNull()
            }
        }
        return null
    }

    private fun extractFloat(
        text: String,
        patterns: List<String>,
    ): Float? {
        for (pattern in patterns) {
            val index = text.indexOf(pattern, ignoreCase = true)
            if (index >= 0) {
                val start = index + pattern.length
                val end =
                    text
                        .indexOfAny(charArrayOf(' ', '\n', ',', ';'), start)
                        .takeIf { it > start } ?: text.length
                return text.substring(start, end).trim().toFloatOrNull()
            }
        }
        return null
    }

    private fun extractHex(
        text: String,
        patterns: List<String>,
    ): Int? {
        for (pattern in patterns) {
            val index = text.indexOf(pattern, ignoreCase = true)
            if (index >= 0) {
                val start = index + pattern.length
                val end =
                    text
                        .indexOfAny(charArrayOf(' ', '\n', ',', ';'), start)
                        .takeIf { it > start } ?: text.length
                return text.substring(start, end).trim().toIntOrNull(16)
            }
        }
        return null
    }

    /**
     * Получить текстовую сводку для логирования
     */
    fun getTelemetrySummary(): String {
        val t = _telemetryState.value
        return "SOC: ${t.stateOfCharge}% | Voltage: ${String.format("%.1f", t.batteryVoltage)}V | " +
            "Speed: ${t.speed}km/h | Door: ${t.doorStatus} | Charge: ${t.chargingStatus}"
    }

    /**
     * Сбросить состояние
     */
    fun reset() {
        _telemetryState.value = VehicleTelemetry()
        updateConnectionStatus(false)
    }
}
