package com.osmnav.pro.data.remote

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.TimeUnit

/**
 * Отправщик логов на удалённый сервер
 */
object LogUploader {
    private const val TAG = "LogUploader"
    private const val LOG_SERVER_URL = "https://xn--e1afmkfe.xn--80adxhks/api/navi-logs/logs"

    private val client =
        OkHttpClient
            .Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .writeTimeout(10, TimeUnit.SECONDS)
            .build()

    private var deviceId: String? = null
    private var appContext: Context? = null

    /**
     * Инициализировать отправщик логов
     */
    fun init(context: Context) {
        appContext = context.applicationContext
        deviceId =
            Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ANDROID_ID,
            )
        Log.d(TAG, "LogUploader initialized for device: $deviceId")
    }

    /**
     * Отправить лог на сервер
     */
    fun log(
        level: String,
        tag: String,
        message: String,
    ) {
        val id = deviceId ?: return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json =
                    JSONObject().apply {
                        put("deviceId", id)
                        put("deviceName", "${Build.MANUFACTURER} ${Build.MODEL}")
                        put("appVersion", getAppVersion())
                        put("androidVersion", Build.VERSION.RELEASE)
                        put("level", level)
                        put("tag", tag)
                        put("message", message)
                        put("timestamp", getCurrentTimestamp())
                    }

                val body =
                    json
                        .toString()
                        .toRequestBody("application/json".toMediaType())

                val request =
                    Request
                        .Builder()
                        .url(LOG_SERVER_URL)
                        .post(body)
                        .build()

                val response = client.newCall(request).execute()
                if (!response.isSuccessful) {
                    Log.w(TAG, "Failed to upload log: ${response.code}")
                }
            } catch (e: Exception) {
                // Silently fail - we don't want logging to crash the app
                Log.v(TAG, "Log upload failed: ${e.message}")
            }
        }
    }

    // Удобные методы для разных уровней логов
    fun d(
        tag: String,
        message: String,
    ) = log("DEBUG", tag, message)

    fun i(
        tag: String,
        message: String,
    ) = log("INFO", tag, message)

    fun w(
        tag: String,
        message: String,
    ) = log("WARN", tag, message)

    fun e(
        tag: String,
        message: String,
    ) = log("ERROR", tag, message)

    // Метод для отправки Exception
    fun exception(
        tag: String,
        message: String,
        throwable: Throwable?,
    ) {
        val stackTrace =
            throwable?.let {
                "\n${it.javaClass.simpleName}: ${it.message}\n" +
                    it.stackTrace.take(5).joinToString("\n") { st ->
                        "  at ${st.fileName}:${st.lineNumber} (${st.className})"
                    }
            } ?: ""
        e(tag, "$message$stackTrace")
    }

    private fun getAppVersion(): String {
        val ctx = appContext ?: return "Unknown"
        return try {
            val packageInfo = ctx.packageManager.getPackageInfo(ctx.packageName, 0)
            packageInfo.versionName ?: "Unknown"
        } catch (e: PackageManager.NameNotFoundException) {
            "Unknown"
        }
    }

    private fun getCurrentTimestamp(): String {
        val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        format.timeZone = TimeZone.getTimeZone("UTC")
        return format.format(Date())
    }
}
