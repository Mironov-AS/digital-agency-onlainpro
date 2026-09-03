package com.osmnav.pro.data.remote

import android.util.Log
import kotlinx.coroutines.*
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Сервис для чтения GPS данных с Т-Бокс через TCP сокет (порт 8630)
 * Протокол общения между Т-Бокс и ГУ (IHU) в автомобиле Skywell ET5
 */
class TBoxGpsService(
    private val port: Int = 8630,
    private val onLocationUpdate: (latitude: Double, longitude: Double, speed: Float, heading: Float) -> Unit,
) {
    companion object {
        private const val TAG = "TBoxGpsService"

        // IHU Protocol message types
        private const val MSG_TYPE_LOGON = 0x01
        private const val MSG_TYPE_HEARTBEAT = 0x02
        private const val MSG_TYPE_GPS_DATA = 0x10
        private const val MSG_TYPE_GPS_REQ = 0x11
        private const val MSG_TYPE_LOGON_ACK = 0x81
    }

    private var serverSocket: ServerSocket? = null
    private var clientSocket: Socket? = null
    private var reader: BufferedReader? = null
    private var writer: PrintWriter? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var isRunning = false

    // Last known location
    private var lastLatitude: Double = 0.0
    private var lastLongitude: Double = 0.0
    private var lastSpeed: Float = 0f
    private var lastHeading: Float = 0f

    /**
     * Запустить сервер на порту 8630 (эмуляция Т-Бокс)
     * Приложение слушает как ГУ и получает GPS от демона tbox_clientd
     */
    fun startServer() {
        scope.launch {
            try {
                serverSocket = ServerSocket(port)
                Log.i(TAG, "TBoxGpsService listening on port $port")
                LogUploader.i(TAG, "TBox GPS server started on port $port")

                isRunning = true
                while (isRunning) {
                    try {
                        val client = serverSocket!!.accept()
                        Log.i(TAG, "T-Box connected from ${client.inetAddress}")
                        LogUploader.i(TAG, "T-Box connected")
                        handleClient(client)
                    } catch (e: Exception) {
                        if (isRunning) {
                            Log.e(TAG, "Error accepting connection: ${e.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Server error: ${e.message}")
                LogUploader.e(TAG, "TBox GPS server failed: ${e.message}")
            }
        }
    }

    /**
     * Подключиться к удалённому Т-Бокс (если Т-Бокс на другом устройстве)
     */
    fun connect(host: String = "127.0.0.1") {
        scope.launch {
            try {
                clientSocket = Socket(host, port)
                reader = BufferedReader(InputStreamReader(clientSocket!!.getInputStream()))
                writer = PrintWriter(clientSocket!!.getOutputStream(), true)

                Log.i(TAG, "Connected to T-Box at $host:$port")
                LogUploader.i(TAG, "Connected to T-Box at $host:$port")

                // Send logon
                sendLogon()

                // Start reading
                readLoop()
            } catch (e: Exception) {
                Log.e(TAG, "Connection error: ${e.message}")
                LogUploader.e(TAG, "TBox connection failed: ${e.message}")
            }
        }
    }

    private fun handleClient(socket: Socket) {
        scope.launch {
            try {
                val input = socket.getInputStream()
                val output = socket.getOutputStream()
                val buffer = ByteArray(1024)

                // Send logon ACK
                sendLogonAck(output)

                // Heartbeat job
                val heartbeatJob =
                    scope.launch {
                        while (isActive) {
                            delay(5000) // 5 seconds heartbeat
                            sendHeartbeat(output)
                        }
                    }

                // Read loop
                while (isRunning && socket.isConnected) {
                    val bytesRead = input.read(buffer)
                    if (bytesRead > 0) {
                        parseFrame(buffer.copyOf(bytesRead), output)
                    }
                    delay(100)
                }

                heartbeatJob.cancel()
            } catch (e: Exception) {
                Log.e(TAG, "Client handler error: ${e.message}")
            } finally {
                try {
                    socket.close()
                } catch (e: Exception) {
                }
            }
        }
    }

    private fun readLoop() {
        scope.launch {
            try {
                while (isRunning) {
                    val line = reader?.readLine()
                    if (line != null) {
                        parseNmea(line)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Read error: ${e.message}")
                LogUploader.e(TAG, "TBox read error: ${e.message}")
            }
        }
    }

    /**
     * Парсинг NMEA строки (если Т-Бокс отправляет NMEA напрямую)
     */
    private fun parseNmea(nmea: String) {
        if (nmea.startsWith("\$GPGGA") || nmea.startsWith("\$GPRMC")) {
            parseNmeaGga(nmea)
        }
    }

    /**
     * Парсинг GPGGA - содержит координаты и точность
     * $GPGGA,123519,5540.123,N,03740.123,E,1,08,0.9,545.4,M,46.9,M,,*47
     */
    private fun parseNmeaGga(nmea: String) {
        try {
            val parts = nmea.split(",")
            if (parts.size >= 10 && parts[6].toIntOrNull() ?: 0 >= 1) {
                // Latitude
                val latRaw = parts[2].toDoubleOrNull() ?: return
                val latDir = parts[3]
                var latitude = (latRaw / 100).toInt().toDouble() + (latRaw % 100) / 60.0
                if (latDir == "S") latitude = -latitude

                // Longitude
                val lonRaw = parts[4].toDoubleOrNull() ?: return
                val lonDir = parts[5]
                var longitude = (lonRaw / 100).toInt().toDouble() + (lonRaw % 100) / 60.0
                if (lonDir == "W") longitude = -longitude

                // HDOP (точность)
                val hdop = parts[8].toFloatOrNull() ?: 0f

                updateLocation(latitude, longitude, 0f, 0f, hdop)
            }
        } catch (e: Exception) {
            Log.w(TAG, "NMEA parse error: ${e.message}")
        }
    }

    /**
     * Парсинг бинарного фрейма протокола Т-Бокс
     */
    private fun parseFrame(
        data: ByteArray,
        output: java.io.OutputStream,
    ) {
        if (data.size < 8) return

        try {
            val buffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN)
            val header = buffer.int

            // Check for valid header (0xAAAA или похожий)
            if (header and 0xFFFF != 0xAAAA) {
                // Maybe it's NMEA
                val str = String(data)
                if (str.contains("\$")) {
                    str.lines().forEach { parseNmea(it) }
                }
                return
            }

            val msgType = buffer.get().toInt() and 0xFF
            val length = buffer.short.toInt() and 0xFFFF

            when (msgType) {
                MSG_TYPE_LOGON -> {
                    Log.i(TAG, "Received LOGON from T-Box")
                    sendLogonAck(output)
                }

                MSG_TYPE_GPS_DATA -> {
                    if (data.size >= 24) {
                        parseGpsData(buffer)
                    }
                }

                MSG_TYPE_HEARTBEAT -> {
                    // Send ACK
                    sendHeartbeatAck(output)
                }
            }
        } catch (e: Exception) {
            // Try NMEA parsing
            val str = String(data)
            str.lines().forEach { parseNmea(it) }
        }
    }

    /**
     * Парсинг GPS данных из бинарного фрейма
     * Формат: lat (int32 * 1000000), lon (int32 * 1000000), speed (km/h), heading (degrees)
     */
    private fun parseGpsData(buffer: ByteBuffer) {
        try {
            val latRaw = buffer.int
            val lonRaw = buffer.int
            val speed = buffer.float
            val heading = buffer.float

            val latitude = latRaw / 1000000.0
            val longitude = lonRaw / 1000000.0

            updateLocation(latitude, longitude, speed, heading, 0f)
        } catch (e: Exception) {
            Log.w(TAG, "GPS data parse error: ${e.message}")
        }
    }

    private fun updateLocation(
        latitude: Double,
        longitude: Double,
        speed: Float,
        heading: Float,
        accuracy: Float,
    ) {
        // Filter out invalid data
        if (latitude == 0.0 && longitude == 0.0) return
        if (latitude < -90 || latitude > 90) return
        if (longitude < -180 || longitude > 180) return

        lastLatitude = latitude
        lastLongitude = longitude
        lastSpeed = speed
        lastHeading = heading

        LogUploader.d(TAG, "TBox GPS: $latitude, $longitude, speed=$speed, heading=$heading, accuracy=$accuracy")

        onLocationUpdate(latitude, longitude, speed, heading)
    }

    private fun sendLogon() {
        val frame = createFrame(MSG_TYPE_LOGON, byteArrayOf(0x01, 0x00))
        writer?.print(String(frame))
        writer?.flush()
    }

    private fun sendLogonAck(output: java.io.OutputStream) {
        // ACK frame
        val frame = createFrame(MSG_TYPE_LOGON_ACK, byteArrayOf(0x00))
        output.write(frame)
        output.flush()
    }

    private fun sendHeartbeat(output: java.io.OutputStream) {
        val frame = createFrame(MSG_TYPE_HEARTBEAT, byteArrayOf())
        output.write(frame)
        output.flush()
    }

    private fun sendHeartbeatAck(output: java.io.OutputStream) {
        val ack =
            ByteBuffer
                .allocate(4)
                .order(ByteOrder.LITTLE_ENDIAN)
                .putInt(0x00000001)
                .array()
        output.write(ack)
        output.flush()
    }

    private fun createFrame(
        type: Int,
        data: ByteArray,
    ): ByteArray {
        val length = data.size + 4
        val buffer = ByteBuffer.allocate(length + 4).order(ByteOrder.LITTLE_ENDIAN)
        buffer.putInt(0xAAAA0000.toInt() or (length and 0xFFFF))
        buffer.put(type.toByte())
        buffer.put((data.size and 0xFF).toByte())
        buffer.put((data.size shr 8 and 0xFF).toByte())
        buffer.put(data)

        // Calculate checksum
        var checksum = 0
        for (b in data) {
            checksum = (checksum + (b.toInt() and 0xFF)) and 0xFF
        }
        buffer.put(checksum.toByte())

        return buffer.array()
    }

    /**
     * Запросить GPS данные от Т-Бокс
     */
    fun requestGpsData(output: java.io.OutputStream) {
        val frame = createFrame(MSG_TYPE_GPS_REQ, byteArrayOf())
        output.write(frame)
        output.flush()
    }

    /**
     * Получить последние известные координаты
     */
    fun getLastLocation(): Triple<Double, Double, Float>? {
        if (lastLatitude == 0.0 && lastLongitude == 0.0) return null
        return Triple(lastLatitude, lastLongitude, lastSpeed)
    }

    /**
     * Остановить сервис
     */
    fun stop() {
        isRunning = false
        try {
            clientSocket?.close()
            serverSocket?.close()
        } catch (e: Exception) {
        }
        scope.cancel()
        Log.i(TAG, "TBoxGpsService stopped")
    }
}
