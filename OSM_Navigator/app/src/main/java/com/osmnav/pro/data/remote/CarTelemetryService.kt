package com.osmnav.pro.data.remote

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Сервис для диагностики Android Car API
 *
 * ПРИМЕЧАНИЕ: Android Car API (VHAL) для чтения свойств автомобиля
 * требует системных разрешений OEM и доступен только на автомобильных
 * головных устройствах с поддержкой Android Automotive.
 *
 * Большинство AfterMarket головных устройств (как i.MX 8QXP) НЕ
 * предоставляют доступ к Vehicle HAL без специальной прошивки от OEM.
 */
class CarTelemetryService(
    private val context: Context,
) {
    companion object {
        private const val TAG = "CarTelemetry"
    }

    // Состояние диагностики
    private val _diagnosticState = MutableStateFlow(CarApiDiagnostic())
    val diagnosticState: StateFlow<CarApiDiagnostic> = _diagnosticState.asStateFlow()

    /**
     * Результаты диагностики Car API
     */
    data class CarApiDiagnostic(
        val apiAvailable: Boolean = false,
        val androidVersion: Int = Build.VERSION.SDK_INT,
        val androidVersionName: String = Build.VERSION.RELEASE,
        val isAutomotiveDevice: Boolean = false,
        val possibleReasons: List<String> = emptyList(),
    )

    /**
     * Провести диагностику доступности Car API
     */
    @SuppressLint("WrongConstant")
    fun runDiagnostic(): CarApiDiagnostic {
        val reasons = mutableListOf<String>()
        var apiAvailable = false

        // Проверка версии Android
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            reasons.add("Android Car API требует Android 10+ (текущая: ${Build.VERSION.SDK_INT})")
        } else {
            // Android 10+, попробуем проверить наличие Car service
            try {
                // Пытаемся создать Car connection
                val carClass = Class.forName("android.car.Car")
                val createMethod = carClass.getMethod("createCar", Context::class.java)
                val carInstance = createMethod.invoke(null, context)

                if (carInstance != null) {
                    // Получаем PropertyService
                    val getManagerMethod = carClass.getMethod("getCarManager", String::class.java)
                    val propertyService = getManagerMethod.invoke(carInstance, "property")

                    if (propertyService != null) {
                        apiAvailable = true
                    } else {
                        reasons.add("CarPropertyManager не доступен на этом устройстве")
                    }

                    // Закрываем соединение
                    val disconnectMethod = carClass.getMethod("disconnect")
                    disconnectMethod.invoke(carInstance)
                }
            } catch (e: ClassNotFoundException) {
                reasons.add("Класс android.car.Car не найден (не Android Automotive)")
            } catch (e: Exception) {
                reasons.add("Car API ошибка: ${e.message}")
            }
        }

        // Проверяем признаки автомобильного устройства
        val isAutomotive = context.packageManager.hasSystemFeature("android.hardware.type.automotive")
        if (!isAutomotive) {
            reasons.add("Устройство не имеет android.hardware.type.automotive feature")
        }

        val result =
            CarApiDiagnostic(
                apiAvailable = apiAvailable,
                isAutomotiveDevice = isAutomotive,
                possibleReasons = reasons,
            )

        _diagnosticState.value = result
        LogUploader.d(TAG, "Car API Diagnostic: available=$apiAvailable, reasons=${reasons.size}")

        return result
    }

    /**
     * Получить статус диагностики для UI
     */
    fun getStatusText(): String {
        val state = _diagnosticState.value
        return when {
            state.apiAvailable -> "✅ Android Car API доступен"
            state.isAutomotiveDevice -> "⚠️ Устройство автомобильное, но Car API не доступен"
            else -> "❌ Android Car API не доступен на этом устройстве"
        }
    }
}
