package com.osmnav.pro.data.remote

import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Расширенный сервис телематики Т-Бокс для Skywell ET5
 * Читает и парсит данные CAN шины автомобиля
 */
class TBoxTelemetryService {
    companion object {
        private const val TAG = "TBoxTelemetry"

        // Singleton instance - все части приложения используют один экземпляр
        @Volatile
        private var instance: TBoxTelemetryService? = null

        fun getInstance(): TBoxTelemetryService =
            instance ?: synchronized(this) {
                instance ?: TBoxTelemetryService().also { instance = it }
            }

        // Alias для удобства
        val shared: TBoxTelemetryService get() = getInstance()

        // CAN ID для BMS (Battery Management System)
        private const val CAN_ID_BMS_SOC = 0x105
        private const val CAN_ID_BATTERY_VOLTAGE = 0x2F3
        private const val CAN_ID_BATTERY_TEMP = 0x2F5
        private const val CAN_ID_CELL_VOLTAGE_1 = 0x2F7
        private const val CAN_ID_CELL_VOLTAGE_2 = 0x2F9
        private const val CAN_ID_CELL_VOLTAGE_3 = 0x2FA
        private const val CAN_ID_CELL_VOLTAGE_4 = 0x2FC

        // CAN ID для VCU (Vehicle Control Unit)
        private const val CAN_ID_VCU_STATUS = 0x211
        private const val CAN_ID_DOOR_STATUS = 0x2B3
        private const val CAN_ID_SPEED = 0x3B1
        private const val CAN_ID_ODOMETER = 0x3B3
        private const val CAN_ID_GEAR = 0x3B5
        private const val CAN_ID_STEERING = 0x3B7

        // CAN ID для двигателя
        private const val CAN_ID_DRIVE_MOTOR_1 = 0x2E4
        private const val CAN_ID_DRIVE_MOTOR_2 = 0x2EF
        private const val CAN_ID_DC_STATUS = 0x3A1
        private const val CAN_ID_DC_STATUS_2 = 0x3A5

        // CAN ID для зарядки
        private const val CAN_ID_CHARGE_STATUS = 0x2B0
        private const val CAN_ID_CHARGE_DETAIL = 0x135

        // CAN ID для TPMS (давление в шинах)
        private const val CAN_ID_TPMS_FL = 0x3B9
        private const val CAN_ID_TPMS_FR = 0x3BB
        private const val CAN_ID_TPMS_RL = 0x3BD
        private const val CAN_ID_TPMS_RR = 0x3BF

        // CAN ID для ESP/ABS
        private const val CAN_ID_ESP_STATUS = 0x3E5
        private const val CAN_ID_ABS_STATUS = 0x3E7

        // CAN ID для педалей
        private const val CAN_ID_PEDALS = 0x3FE

        // CAN ID для охлаждения
        private const val CAN_ID_COOLANT_TEMP = 0x402
        private const val CAN_ID_BMS_COOLANT = 0x404
        private const val CAN_ID_MOTOR_COOLANT = 0x406

        // CAN ID для состояния автомобиля
        private const val CAN_ID_VEHICLE_STATUS = 0x1F7
        private const val CAN_ID_ENGINE = 0x91

        // CAN ID для батареи 12V
        private const val CAN_ID_12V_BATTERY = 0x104
    }

    // Состояние телематики
    private val _telemetryState = MutableStateFlow(ExtendedVehicleTelemetry())
    val telemetryState: StateFlow<ExtendedVehicleTelemetry> = _telemetryState.asStateFlow()

    /**
     * Расширенные данные транспортного средства
     */
    data class ExtendedVehicleTelemetry(
        // === БАТАРЕЯ HV (высокое напряжение) ===
        val batterySoc: Int = 0, // State of Charge 0-100%
        val batteryVoltage: Float = 0f, // Общее напряжение (В)
        val batteryCurrent: Float = 0f, // Ток (А)
        val batteryTemp: Int = 0, // Температура батареи (°C)
        val batteryMaxTemp: Int = 0, // Макс. температура
        val batteryMinTemp: Int = 0, // Мин. температура
        val batteryMaxCellVoltage: Float = 0f, // Макс. напряжение ячейки (В)
        val batteryMinCellVoltage: Float = 0f, // Мин. напряжение ячейки (В)
        val batteryHealth: Int = 0, // Здоровье батареи %
        val batteryCapacity: Int = 0, // Ёмкость (Ач)
        val batteryCycles: Int = 0, // Циклы зарядки
        val chargingStatus: ChargingStatus = ChargingStatus.NONE,
        val chargeGunConnected: Boolean = false,
        val chargeTimeRemaining: Int = 0, // Минуты до полной зарядки
        // === ДВИГАТЕЛЬ/МОТОР ===
        val motorSpeed: Int = 0, // Об/мин
        val motorTorque: Float = 0f, // Крутящий момент (Нм)
        val motorPower: Int = 0, // Мощность (кВт)
        val motorTemp: Int = 0, // Температура мотора (°C)
        val motorEfficiency: Int = 0, // КПД %
        val dcVoltage: Float = 0f, // DC/DC напряжение
        val dcCurrent: Float = 0f, // DC/DC ток
        // === АВТОМОБИЛЬ ===
        val speed: Int = 0, // Скорость км/ч
        val odometer: Int = 0, // Пробег км
        val tripOdometer: Int = 0, // Пробег поездки
        val gear: GearPosition = GearPosition.PARK,
        val steeringAngle: Int = 0, // Угол поворота руля (°)
        // === КУЗОВ ===
        val doorStatus: DoorStatus = DoorStatus.ALL_CLOSED,
        val trunkOpen: Boolean = false,
        val hoodOpen: Boolean = false,
        val ignitionStatus: IgnitionStatus = IgnitionStatus.OFF,
        // === TPMS (давление шин) ===
        val tireFLPressure: Float = 0f, // PSI
        val tireFRPressure: Float = 0f,
        val tireRLPressure: Float = 0f,
        val tireRRPressure: Float = 0f,
        val tireFLTemp: Int = 0, // °C
        val tireFRTemp: Int = 0,
        val tireRLTemp: Int = 0,
        val tireRRTemp: Int = 0,
        // === ПЕДАЛИ ===
        val acceleratorPedal: Int = 0, // 0-100%
        val brakePedal: Int = 0, // 0-100%
        val clutchPedal: Int = 0, // 0-100%
        // === ОХЛАЖДЕНИЕ ===
        val coolantTemp: Int = 0, // Температура ОЖ (°C)
        val bmsCoolantTemp: Int = 0, // ОЖ BMS
        val motorCoolantTemp: Int = 0, // ОЖ мотора
        val coolantLevel: Int = 0, // Уровень ОЖ %
        // === ESP/ABS ===
        val espActive: Boolean = false,
        val absActive: Boolean = false,
        val tractionControl: Boolean = false,
        // === ЭНЕРГИЯ ===
        val energyConsumption: Float = 0f, // кВтч/100км
        val regenerationPower: Int = 0, // кВт при рекуперации
        val rangeRemaining: Int = 0, // Остаток пробега км
        // === БААТАРЕЯ 12V ===
        val battery12V: Float = 0f, // Напряжение 12V батареи
        val battery12VTemp: Int = 0, // Температура 12V батареи
        // === ВРЕМЯ ===
        val lastUpdate: Long = 0L,
        val isConnected: Boolean = false,
        val canFramesReceived: Int = 0,
    )

    enum class ChargingStatus(
        val displayName: String,
    ) {
        NONE("Не заряжается"),
        SLOW_CHARGE("Медленная зарядка"),
        FAST_CHARGE("Быстрая зарядка"),
        TRICKLE_CHARGE("Капельная"),
        COMPLETED("Зарядка завершена"),
        ERROR("Ошибка зарядки"),
    }

    enum class GearPosition(
        val displayName: String,
        val shortName: String,
    ) {
        PARK("Парковка", "P"),
        REVERSE("Задний ход", "R"),
        NEUTRAL("Нейтраль", "N"),
        DRIVE("Драйв", "D"),
        SPORT("Спорт", "S"),
        ECO("Эко", "E"),
        LOW("Пониженная", "L"),
        UNKNOWN("Неизвестно", "?"),
    }

    enum class DoorStatus(
        val displayName: String,
    ) {
        ALL_CLOSED("Все закрыты"),
        DRIVER_OPEN("Водительская"),
        PASSENGER_OPEN("Пассажирская"),
        REAR_LEFT_OPEN("Задняя левая"),
        REAR_RIGHT_OPEN("Задняя правая"),
        TRUNK_OPEN("Багажник"),
        HOOD_OPEN("Капот"),
        ANY_OPEN("Открыты"),
    }

    enum class IgnitionStatus(
        val displayName: String,
    ) {
        OFF("Выключено"),
        ACC("Аксессуары"),
        ON("Зажигание"),
        START("Старт"),
        UNKNOWN("Неизвестно"),
    }

    /**
     * Обработать входящие данные от Т-Бокс
     */
    fun processData(data: ByteArray) {
        if (data.size < 8) return

        // Отладочный лог - показываем первые 32 байта
        val hexDump = data.take(32).joinToString("") { String.format("%02X ", it) }
        LogUploader.d(TAG, "Telemetry raw(${(data as? ByteArray)?.size ?: data.size} bytes): $hexDump")

        try {
            val buffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN)

            // Проверяем заголовок
            val header = buffer.int
            LogUploader.d(TAG, "Telemetry header: 0x${String.format("%08X", header)}, expected 0x0000AAAA")

            if (header and 0xFFFF != 0xAAAA) {
                // Текстовый формат
                val text = String(data).take(100)
                LogUploader.d(TAG, "Telemetry text format: $text")
                processTextData(String(data))
                return
            }

            val msgType = buffer.get().toInt() and 0xFF
            val length = buffer.short.toInt() and 0xFFFF
            LogUploader.d(TAG, "Telemetry msgType: 0x${String.format("%02X", msgType)}, length: $length")

            when (msgType) {
                0x10 -> {
                    parseCanFrame(buffer, length)
                }

                0x11 -> {
                    parseCanFrame(buffer, length)
                }

                0x20 -> {
                    parseTelemetryFrame(buffer, length)
                }

                else -> {
                    LogUploader.d(TAG, "Unknown msgType 0x${String.format("%02X", msgType)}, trying generic parse")
                    parseCanFrame(buffer, length)
                }
            }

            updateConnectionStatus(true)
        } catch (e: Exception) {
            LogUploader.e(TAG, "Telemetry parse error: ${e.message}")
            Log.w(TAG, "Parse error: ${e.message}")
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

                CAN_ID_BATTERY_VOLTAGE -> {
                    parseBatteryVoltage(buffer, dlc)
                }

                CAN_ID_BATTERY_TEMP -> {
                    parseBatteryTemp(buffer, dlc)
                }

                CAN_ID_VCU_STATUS -> {
                    parseVcuStatus(buffer, dlc)
                }

                CAN_ID_DOOR_STATUS -> {
                    parseDoorStatus(buffer, dlc)
                }

                CAN_ID_SPEED -> {
                    parseSpeed(buffer, dlc)
                }

                CAN_ID_ODOMETER -> {
                    parseOdometer(buffer, dlc)
                }

                CAN_ID_GEAR -> {
                    parseGear(buffer, dlc)
                }

                CAN_ID_STEERING -> {
                    parseSteering(buffer, dlc)
                }

                CAN_ID_DRIVE_MOTOR_1 -> {
                    parseDriveMotor1(buffer, dlc)
                }

                CAN_ID_DRIVE_MOTOR_2 -> {
                    parseDriveMotor2(buffer, dlc)
                }

                CAN_ID_CHARGE_STATUS -> {
                    parseChargeStatus(buffer, dlc)
                }

                CAN_ID_PEDALS -> {
                    parsePedals(buffer, dlc)
                }

                CAN_ID_COOLANT_TEMP -> {
                    parseCoolantTemp(buffer, dlc)
                }

                CAN_ID_BMS_COOLANT -> {
                    parseBmsCoolant(buffer, dlc)
                }

                CAN_ID_MOTOR_COOLANT -> {
                    parseMotorCoolant(buffer, dlc)
                }

                CAN_ID_DC_STATUS -> {
                    parseDcStatus(buffer, dlc)
                }

                CAN_ID_12V_BATTERY -> {
                    parse12VBattery(buffer, dlc)
                }

                CAN_ID_TPMS_FL, CAN_ID_TPMS_FR, CAN_ID_TPMS_RL, CAN_ID_TPMS_RR -> {
                    parseTpms(canId, buffer, dlc)
                }

                else -> {
                    // Подсчёт принятых фреймов
                    incrementCanFrames()
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "CAN parse error: ${e.message}")
        }
    }

    private fun incrementCanFrames() {
        val current = _telemetryState.value
        _telemetryState.value =
            current.copy(
                canFramesReceived = current.canFramesReceived + 1,
                lastUpdate = System.currentTimeMillis(),
            )
    }

    // === BMS (Battery Management System) ===

    private fun parseBmsSOC(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val socRaw = buffer.short.toInt() and 0xFFFF
        val voltageRaw = buffer.short.toInt() and 0xFFFF

        val soc = socRaw / 10
        val voltage = voltageRaw / 10f

        updateState {
            copy(batterySoc = soc.coerceIn(0, 100), batteryVoltage = voltage)
        }

        LogUploader.d(TAG, "BMS SOC: $soc%, Voltage: ${voltage}V")
    }

    private fun parseBatteryVoltage(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val voltageRaw = buffer.short.toInt() and 0xFFFF
        val currentRaw = buffer.short.toInt()

        val voltage = voltageRaw / 10f
        val current = currentRaw / 10f

        updateState {
            copy(batteryVoltage = voltage, batteryCurrent = current)
        }
    }

    private fun parseBatteryTemp(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val tempMax = buffer.get().toInt() - 40
        val tempMin = buffer.get().toInt() - 40
        val tempAvg = buffer.get().toInt() - 40
        buffer.get() // padding

        updateState {
            copy(batteryMaxTemp = tempMax, batteryMinTemp = tempMin, batteryTemp = tempAvg)
        }
    }

    // === VCU (Vehicle Control Unit) ===

    private fun parseVcuStatus(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val statusByte = buffer.get().toInt()
        val gearByte = buffer.get().toInt()

        val ignition =
            when (statusByte and 0x03) {
                0 -> IgnitionStatus.OFF
                1 -> IgnitionStatus.ACC
                2 -> IgnitionStatus.ON
                3 -> IgnitionStatus.START
                else -> IgnitionStatus.UNKNOWN
            }

        updateState {
            copy(ignitionStatus = ignition)
        }

        LogUploader.d(TAG, "VCU: Ignition=$ignition")
    }

    private fun parseDoorStatus(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 1) return

        val doorByte = buffer.get().toInt()

        val trunkOpen = (doorByte and 0x01) != 0
        val hoodOpen = (doorByte and 0x02) != 0
        val driverOpen = (doorByte and 0x04) != 0
        val passengerOpen = (doorByte and 0x08) != 0
        val rearLeftOpen = (doorByte and 0x10) != 0
        val rearRightOpen = (doorByte and 0x20) != 0

        val status =
            when {
                doorByte == 0 -> DoorStatus.ALL_CLOSED
                driverOpen -> DoorStatus.DRIVER_OPEN
                passengerOpen -> DoorStatus.PASSENGER_OPEN
                rearLeftOpen -> DoorStatus.REAR_LEFT_OPEN
                rearRightOpen -> DoorStatus.REAR_RIGHT_OPEN
                trunkOpen -> DoorStatus.TRUNK_OPEN
                hoodOpen -> DoorStatus.HOOD_OPEN
                doorByte > 0 -> DoorStatus.ANY_OPEN
                else -> DoorStatus.ALL_CLOSED
            }

        updateState {
            copy(doorStatus = status, trunkOpen = trunkOpen, hoodOpen = hoodOpen)
        }
    }

    private fun parseSpeed(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val speedRaw = buffer.short.toInt() and 0xFFFF
        val speed = speedRaw / 10

        updateState {
            copy(speed = speed.coerceAtLeast(0))
        }
    }

    private fun parseOdometer(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val odoRaw = buffer.int
        val odometer = odoRaw / 10

        updateState {
            copy(odometer = odometer)
        }
    }

    private fun parseGear(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 1) return

        val gearByte = buffer.get().toInt() and 0x0F
        val gear =
            when (gearByte) {
                0 -> GearPosition.PARK
                1 -> GearPosition.REVERSE
                2 -> GearPosition.NEUTRAL
                3 -> GearPosition.DRIVE
                4 -> GearPosition.SPORT
                5 -> GearPosition.ECO
                6 -> GearPosition.LOW
                else -> GearPosition.UNKNOWN
            }

        updateState {
            copy(gear = gear)
        }

        LogUploader.d(TAG, "Gear: ${gear.displayName}")
    }

    private fun parseSteering(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val angleRaw = buffer.short.toInt()
        val angle = if (angleRaw > 32767) angleRaw - 65536 else angleRaw
        val steering = angle / 10

        updateState {
            copy(steeringAngle = steering)
        }
    }

    // === Drive Motor ===

    private fun parseDriveMotor1(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 8) return

        val speedRaw = buffer.short.toInt()
        val torqueRaw = buffer.short.toInt()
        val tempRaw = buffer.get().toInt() - 40
        val powerRaw = buffer.short.toInt()

        val speed = if (speedRaw > 32767) speedRaw - 65536 else speedRaw
        val torque = torqueRaw / 10f
        val power = powerRaw / 10

        updateState {
            copy(motorSpeed = speed, motorTorque = torque, motorPower = power, motorTemp = tempRaw)
        }
    }

    private fun parseDriveMotor2(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val efficiency = buffer.get().toInt() * 10
        buffer.get() // padding

        updateState {
            copy(motorEfficiency = efficiency.coerceIn(0, 100))
        }
    }

    // === Charging ===

    private fun parseChargeStatus(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val chargeStatus = buffer.get().toInt()
        val gunConnected = buffer.get().toInt() != 0

        val charging =
            when (chargeStatus) {
                0 -> ChargingStatus.NONE
                1 -> ChargingStatus.SLOW_CHARGE
                2 -> ChargingStatus.FAST_CHARGE
                3 -> ChargingStatus.TRICKLE_CHARGE
                4 -> ChargingStatus.COMPLETED
                else -> ChargingStatus.ERROR
            }

        updateState {
            copy(chargingStatus = charging, chargeGunConnected = gunConnected)
        }

        LogUploader.d(TAG, "Charging: ${charging.displayName}, Gun: $gunConnected")
    }

    // === Pedals ===

    private fun parsePedals(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 3) return

        val accelerator = buffer.get().toInt() * 100 / 255
        val brake = buffer.get().toInt() * 100 / 255
        val clutch = buffer.get().toInt() * 100 / 255

        updateState {
            copy(acceleratorPedal = accelerator, brakePedal = brake, clutchPedal = clutch)
        }
    }

    // === Cooling ===

    private fun parseCoolantTemp(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val temp = buffer.get().toInt() - 40
        val level = buffer.get().toInt() * 100 / 255

        updateState {
            copy(coolantTemp = temp, coolantLevel = level)
        }
    }

    private fun parseBmsCoolant(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 1) return

        val temp = buffer.get().toInt() - 40

        updateState {
            copy(bmsCoolantTemp = temp)
        }
    }

    private fun parseMotorCoolant(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 1) return

        val temp = buffer.get().toInt() - 40

        updateState {
            copy(motorCoolantTemp = temp)
        }
    }

    // === DC/DC ===

    private fun parseDcStatus(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val voltageRaw = buffer.short.toInt() and 0xFFFF
        val currentRaw = buffer.short.toInt()

        val voltage = voltageRaw / 100f
        val current = currentRaw / 10f

        updateState {
            copy(dcVoltage = voltage, dcCurrent = current)
        }
    }

    // === 12V Battery ===

    private fun parse12VBattery(
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 2) return

        val voltage = buffer.get().toInt() / 10f
        val temp = buffer.get().toInt() - 40

        updateState {
            copy(battery12V = voltage, battery12VTemp = temp)
        }
    }

    // === TPMS ===

    private fun parseTpms(
        canId: Int,
        buffer: ByteBuffer,
        dlc: Int,
    ) {
        if (dlc < 4) return

        val pressure = buffer.get().toInt() / 10f
        val temp = buffer.get().toInt() - 40
        buffer.get() // status
        buffer.get() // padding

        updateState {
            when (canId) {
                CAN_ID_TPMS_FL -> copy(tireFLPressure = pressure, tireFLTemp = temp)
                CAN_ID_TPMS_FR -> copy(tireFRPressure = pressure, tireFRTemp = temp)
                CAN_ID_TPMS_RL -> copy(tireRLPressure = pressure, tireRLTemp = temp)
                CAN_ID_TPMS_RR -> copy(tireRRPressure = pressure, tireRRTemp = temp)
                else -> this
            }
        }
    }

    // === Text data parsing ===

    private fun processTextData(text: String) {
        val line = text.trim()

        // Ищем паттерны like "soc=75" or "speed=60"
        extractInt(line, "soc=")?.let { soc ->
            updateState { copy(batterySoc = soc.coerceIn(0, 100)) }
        }

        extractInt(line, "speed=")?.let { speed ->
            updateState { copy(speed = speed.coerceAtLeast(0)) }
        }

        extractInt(line, "voltage=")?.let { voltage ->
            updateState { copy(batteryVoltage = voltage / 10f) }
        }

        extractHex(line, "door=")?.let { door ->
            val status = if (door == 0) DoorStatus.ALL_CLOSED else DoorStatus.ANY_OPEN
            updateState { copy(doorStatus = status) }
        }

        extractInt(line, "v=")?.let { voltage ->
            updateState { copy(batteryVoltage = voltage / 1000f) }
        }

        extractInt(line, "rtig=")?.let { rtig ->
            val ignition =
                when (rtig) {
                    0 -> IgnitionStatus.OFF
                    1 -> IgnitionStatus.ACC
                    2 -> IgnitionStatus.ON
                    3 -> IgnitionStatus.START
                    else -> IgnitionStatus.UNKNOWN
                }
            updateState { copy(ignitionStatus = ignition) }
        }

        extractInt(line, "gears=")?.let { gear ->
            val position =
                when (gear) {
                    0 -> GearPosition.PARK
                    1 -> GearPosition.REVERSE
                    2 -> GearPosition.NEUTRAL
                    3 -> GearPosition.DRIVE
                    else -> GearPosition.UNKNOWN
                }
            updateState { copy(gear = position) }
        }
    }

    // === Telemetry frame (0x20) ===

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

            updateState {
                copy(
                    batterySoc = soc,
                    batteryVoltage = voltage / 10f,
                    batteryCurrent = current / 10f,
                    batteryTemp = temp,
                    chargingStatus = if (status and 0x01 != 0) ChargingStatus.SLOW_CHARGE else ChargingStatus.NONE,
                )
            }
        } catch (e: Exception) {
            Log.w(TAG, "Telemetry parse error: ${e.message}")
        }
    }

    // === Helper Methods ===

    private inline fun updateState(update: ExtendedVehicleTelemetry.() -> ExtendedVehicleTelemetry) {
        val current = _telemetryState.value
        _telemetryState.value = current.update().copy(lastUpdate = System.currentTimeMillis())
    }

    private fun extractInt(
        text: String,
        pattern: String,
    ): Int? {
        val index = text.indexOf(pattern, ignoreCase = true)
        if (index < 0) return null
        val start = index + pattern.length
        val end =
            text
                .indexOfAny(charArrayOf(' ', '\n', ',', ';'), start)
                .takeIf { it > start } ?: text.length
        return text.substring(start, end).trim().toIntOrNull()
    }

    private fun extractHex(
        text: String,
        pattern: String,
    ): Int? {
        val index = text.indexOf(pattern, ignoreCase = true)
        if (index < 0) return null
        val start = index + pattern.length
        val end =
            text
                .indexOfAny(charArrayOf(' ', '\n', ',', ';'), start)
                .takeIf { it > start } ?: text.length
        return text.substring(start, end).trim().toIntOrNull(16)
    }

    private fun updateConnectionStatus(connected: Boolean) {
        val current = _telemetryState.value
        if (current.isConnected != connected) {
            _telemetryState.value =
                current.copy(
                    isConnected = connected,
                    lastUpdate = System.currentTimeMillis(),
                )

            if (connected) {
                LogUploader.i(TAG, "T-Box telemetry connected")
            }
        }
    }

    /**
     * Получить текстовую сводку для логирования
     */
    fun getTelemetrySummary(): String {
        val t = _telemetryState.value
        return "SOC: ${t.batterySoc}% | Speed: ${t.speed}km/h | " +
            "Gear: ${t.gear.shortName} | ${t.chargingStatus.displayName} | " +
            "Volt: ${String.format("%.1f", t.batteryVoltage)}V | " +
            "Temp: ${t.batteryTemp}°C"
    }

    /**
     * Получить расширенную сводку
     */
    fun getExtendedSummary(): String {
        val t = _telemetryState.value
        return buildString {
            appendLine("=== ТЕЛЕМАТИКА ===")
            appendLine("SOC: ${t.batterySoc}% | Напряжение: ${String.format("%.1f", t.batteryVoltage)}V")
            appendLine("Ток: ${String.format("%.1f", t.batteryCurrent)}A | Темп. батареи: ${t.batteryTemp}°C")
            appendLine("Скорость: ${t.speed} km/h | Пробег: ${t.odometer} km")
            appendLine("Мотор: ${t.motorSpeed} rpm | Крутящий момент: ${String.format("%.1f", t.motorTorque)} Nm")
            appendLine("Зарядка: ${t.chargingStatus.displayName}")
            appendLine("CAN фреймов: ${t.canFramesReceived}")
        }
    }

    /**
     * Сбросить состояние
     */
    fun reset() {
        _telemetryState.value = ExtendedVehicleTelemetry()
        LogUploader.i(TAG, "Telemetry reset")
    }

    /**
     * Загрузить текущую телематику на удалённый сервер
     */
    fun uploadCurrentTelemetry() {
        val tel = _telemetryState.value
        val json =
            org.json.JSONObject().apply {
                put("batterySoc", tel.batterySoc)
                put("batteryVoltage", tel.batteryVoltage.toDouble())
                put("batteryCurrent", tel.batteryCurrent.toDouble())
                put("batteryTemp", tel.batteryTemp)
                put("batteryMaxTemp", tel.batteryMaxTemp)
                put("batteryMinTemp", tel.batteryMinTemp)
                put("batteryMaxCellVoltage", tel.batteryMaxCellVoltage.toDouble())
                put("batteryMinCellVoltage", tel.batteryMinCellVoltage.toDouble())
                put("batteryHealth", tel.batteryHealth)
                put("speed", tel.speed)
                put("odometer", tel.odometer)
                put("gear", tel.gear.name)
                put("ignitionStatus", tel.ignitionStatus.name)
                put("doorStatus", tel.doorStatus.name)
                put("steeringAngle", tel.steeringAngle)
                put("motorSpeed", tel.motorSpeed)
                put("motorTorque", tel.motorTorque.toDouble())
                put("motorPower", tel.motorPower)
                put("motorTemp", tel.motorTemp)
                put("chargingStatus", tel.chargingStatus.name)
                put("chargeGunConnected", tel.chargeGunConnected)
                put("tireFLPressure", tel.tireFLPressure.toDouble())
                put("tireFRPressure", tel.tireFRPressure.toDouble())
                put("tireRLPressure", tel.tireRLPressure.toDouble())
                put("tireRRPressure", tel.tireRRPressure.toDouble())
                put("tireFLTemp", tel.tireFLTemp)
                put("tireFRTemp", tel.tireFRTemp)
                put("tireRLTemp", tel.tireRLTemp)
                put("tireRRTemp", tel.tireRRTemp)
                put("coolantTemp", tel.coolantTemp)
                put("bmsCoolantTemp", tel.bmsCoolantTemp)
                put("motorCoolantTemp", tel.motorCoolantTemp)
                put("battery12V", tel.battery12V.toDouble())
                put("battery12VTemp", tel.battery12VTemp)
                put("canFramesReceived", tel.canFramesReceived)
                put("isConnected", tel.isConnected)
            }
        LogUploader.uploadTelemetry(json)
    }
}
