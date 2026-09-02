package com.osmnav.pro.presentation.search

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import java.util.Locale

/**
 * Помощник для голосового поиска адресов.
 * Использует встроенный SpeechRecognizer для максимальной совместимости.
 *
 * Для Android 9+ поддерживает:
 * - Голосовой ввод через RecognizerIntent (Google Voice Search)
 * - Офлайн режим если доступен
 */
class VoiceSearchHelper(
    private val activity: Activity,
    private val listener: VoiceSearchListener,
) {
    companion object {
        private const val TAG = "VoiceSearchHelper"
        private const val REQUEST_CODE_SPEECH = 1001
    }

    private var speechRecognizer: SpeechRecognizer? = null

    interface VoiceSearchListener {
        /**
         * Успешное распознавание речи
         */
        fun onVoiceResult(query: String)

        /**
         * Ошибка распознавания
         */
        fun onVoiceError(errorMessage: String)

        /**
         * Начало прослушивания
         */
        fun onListeningStarted()

        /**
         * Конец прослушивания
         */
        fun onListeningEnded()
    }

    /**
     * Проверить поддержку голосового ввода на устройстве
     */
    fun isVoiceSearchAvailable(): Boolean = SpeechRecognizer.isRecognitionAvailable(activity)

    /**
     * Запустить голосовой поиск
     * Показывает диалог Google Voice Search
     */
    fun startVoiceSearch() {
        if (!isVoiceSearchAvailable()) {
            listener.onVoiceError("Голосовой поиск недоступен на этом устройстве")
            return
        }

        val intent = createRecognizerIntent()

        // Запускаем стандартный диалог голосового ввода Google
        try {
            activity.startActivityForResult(intent, REQUEST_CODE_SPEECH)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start voice search", e)
            listener.onVoiceError("Не удалось запустить голосовой поиск")
        }
    }

    /**
     * Создать Intent для голосового поиска
     */
    private fun createRecognizerIntent(): Intent =
        Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            // Свободная форма ввода (не web-поиск)
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM,
            )

            // Русский язык
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ru-RU")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ru-RU")

            // Подсказка для пользователя
            putExtra(
                RecognizerIntent.EXTRA_PROMPT,
                "Скажите адрес или название места",
            )

            // Минимальная длина результата
            putExtra(RecognizerIntent.EXTRA_MIN_MESSAGES_LENGTH, 1)

            // Максимальное количество результатов
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)

            // Поддержка офлайн распознавания (если доступно)
            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        }

    /**
     * Обработать результат голосового поиска из onActivityResult
     */
    fun handleActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
    ): Boolean {
        if (requestCode != REQUEST_CODE_SPEECH) {
            return false
        }

        if (resultCode == Activity.RESULT_OK && data != null) {
            val matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)

            if (!matches.isNullOrEmpty()) {
                // Берём первый (наиболее вероятный) результат
                val bestMatch = matches[0]
                Log.d(TAG, "Voice result: $bestMatch")
                listener.onVoiceResult(bestMatch)
                return true
            } else {
                listener.onVoiceError("Ничего не распознано. Попробуйте ещё раз.")
                return false
            }
        } else if (resultCode == Activity.RESULT_NO_MATCH) {
            listener.onVoiceError("Ничего не распознано. Попробуйте ещё раз.")
            return false
        } else if (resultCode == Activity.RESULT_CANCELED) {
            // Пользователь отменил
            listener.onListeningEnded()
            return false
        }

        return false
    }

    /**
     * Освободить ресурсы
     */
    fun destroy() {
        speechRecognizer?.destroy()
        speechRecognizer = null
    }
}

/**
 * Расширение для SearchActivity с поддержкой голосового ввода
 */
fun Activity.setupVoiceSearch(listener: VoiceSearchHelper.VoiceSearchListener): VoiceSearchHelper = VoiceSearchHelper(this, listener)
