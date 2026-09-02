package com.osmnavigator.carprojection;

import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.car.app.CarAppService;
import androidx.car.app.Screen;
import androidx.car.app.model.CarIcon;
import androidx.car.app.model.Template;
import androidx.car.app.navigation.NavigationManager;
import androidx.car.app.navigation.NavigationTemplate;
import androidx.car.app.navigation.model.NavigationInfo;
import androidx.car.app.navigation.model.Maneuver;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;

/**
 * Модуль проекции навигации на приборную панель автомобиля.
 *
 * Использует Android Auto (CarApp Library) для отображения
 * Turn-by-Turn навигации на цифровой приборной панели.
 *
 * Поддерживаемые протоколы:
 * 1. Android Auto / Android Automotive OS (AAOS)
 * 2. OEM-специфичные broadcast intents (Huawei, Xiaomi, OEM head units)
 *
 * Работает на i.MX 8QXP head units с автомобильным ПО.
 */
public class CarProjectionModule extends ReactContextBaseJavaModule {

    private static final String TAG = "CarProjection";
    private static final String MODULE_NAME = "CarProjectionModule";

    // Текущее состояние навигации
    private volatile boolean isNavigating = false;
    private volatile String currentManeuverText = "";
    private volatile String currentStreet = "";
    private volatile int distanceMeters = 0;
    private volatile int totalDistanceMeters = 0;
    private volatile int remainingSeconds = 0;
    private volatile String destinationName = "";
    private volatile double destLat = 0;
    private volatile double destLon = 0;

    // Callback для обновления навигации
    private NavigationUpdateCallback navigationCallback;

    public CarProjectionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(TAG, "CarProjectionModule initialized");
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Запустить проекцию навигации на приборную панель.
     * Вызывается при начале навигации.
     */
    @ReactMethod
    public void startProjection(
            String destName,
            double latitude,
            double longitude,
            Promise promise
    ) {
        Log.d(TAG, "Starting car projection: " + destName + " @ " + latitude + "," + longitude);

        this.destinationName = destName;
        this.destLat = latitude;
        this.destLon = longitude;
        this.isNavigating = true;

        // Отправляем broadcast для OEM head units (Huawei, Xiaomi, OEM automotive)
        sendNavigationStartBroadcast(destName, latitude, longitude);

        // Пытаемся запустить Android Auto сервис если доступен
        tryStartAndroidAutoService();

        promise.resolve(true);
    }

    /**
     * Обновить данные навигации — вызывается при каждом манёвре.
     * Данные отправляются на приборную панель.
     */
    @ReactMethod
    public void updateNavigation(
            String maneuverText,
            String streetName,
            int distanceM,
            int totalDistanceM,
            int remainingTimeS,
            Promise promise
    ) {
        if (!isNavigating) {
            promise.resolve(false);
            return;
        }

        this.currentManeuverText = maneuverText;
        this.currentStreet = streetName;
        this.distanceMeters = distanceM;
        this.totalDistanceMeters = totalDistanceM;
        this.remainingSeconds = remainingTimeS;

        // Отправляем обновление на приборную панель
        sendNavigationUpdateBroadcast(maneuverText, streetName, distanceM, remainingTimeS);

        // Обновляем Android Auto если активен
        if (navigationCallback != null) {
            UiThreadUtil.runOnUiThread(() -> {
                try {
                    navigationCallback.onNavigationUpdate(
                            maneuverText, streetName, distanceM, remainingTimeS, totalDistanceM
                    );
                } catch (Exception e) {
                    Log.e(TAG, "Navigation callback error: " + e.getMessage());
                }
            });
        }

        promise.resolve(true);
    }

    /**
     * Остановить проекцию навигации.
     */
    @ReactMethod
    public void stopProjection(Promise promise) {
        Log.d(TAG, "Stopping car projection");
        this.isNavigating = false;
        this.currentManeuverText = "";
        this.currentStreet = "";
        this.distanceMeters = 0;
        this.totalDistanceMeters = 0;
        this.remainingSeconds = 0;

        // Отправляем broadcast об остановке
        sendNavigationStopBroadcast();

        promise.resolve(true);
    }

    /**
     * Проверить доступность проекции на данном устройстве.
     */
    @ReactMethod
    public void isProjectionAvailable(Promise promise) {
        boolean available = checkAndroidAutoAvailability() || checkOemProjectionAvailability();
        promise.resolve(available);
    }

    /**
     * Получить текущий статус проекции.
     */
    @ReactMethod
    public void getProjectionStatus(ReadableMap params, Promise promise) {
        try {
            com.facebook.react.bridge.WritableMap status = new com.facebook.react.bridge.Arguments.createMap();
            status.putBoolean("isActive", isNavigating);
            status.putString("currentManeuver", currentManeuverText);
            status.putString("currentStreet", currentStreet);
            status.putInt("distanceMeters", distanceMeters);
            status.putInt("totalDistanceMeters", totalDistanceMeters);
            status.putInt("remainingSeconds", remainingSeconds);
            status.putString("destination", destinationName);
            status.putBoolean("androidAutoAvailable", checkAndroidAutoAvailability());
            status.putBoolean("oemAvailable", checkOemProjectionAvailability());
            promise.resolve(status);
        } catch (Exception e) {
            promise.reject("STATUS_ERROR", e.getMessage());
        }
    }

    // ==================== Android Auto Service ====================

    private void tryStartAndroidAutoService() {
        try {
            // Проверяем доступность Android Auto
            Intent launchIntent = new Intent("androidx.car.app.CarAppService");
            launchIntent.setPackage(getReactApplicationContext().getPackageName());
            // CarAppService зарегистрирован в манифесте — Android Auto framework найдёт его
            Log.d(TAG, "Android Auto CarAppService registered for this app");
        } catch (Exception e) {
            Log.e(TAG, "Cannot start Android Auto service: " + e.getMessage());
        }
    }

    private boolean checkAndroidAutoAvailability() {
        try {
            // Проверяем наличие Android Auto / Automotive OS
            Intent intent = new Intent();
            intent.setClassName(
                    "com.google.android.gms",
                    "com.google.android.gms.car.navigation.Navigation荧"
            );
            // Просто проверяем доступность пакета Google Maps / Android Auto
            return getReactApplicationContext().getPackageManager().resolveService(intent, 0) != null;
        } catch (Exception e) {
            return false;
        }
    }

    // ==================== OEM Broadcast Protocol ====================

    /**
     * OEM-специфичные broadcast intents для проекции на приборную панель.
     * Эти intents распознаются OEM head unit ПО (i.MX 8QXP, Huawei, Xiaomi и др.)
     */
    private void sendNavigationStartBroadcast(String destName, double lat, double lon) {
        try {
            Intent intent = new Intent("com.android.car.navigation.START_NAVIGATION");
            intent.putExtra("destination_name", destName);
            intent.putExtra("destination_lat", lat);
            intent.putExtra("destination_lon", lon);
            intent.putExtra("package_name", getReactApplicationContext().getPackageName());
            intent.setPackage(null); // broadcast to all
            getReactApplicationContext().sendBroadcast(intent);
            Log.d(TAG, "OEM navigation START broadcast sent");
        } catch (Exception e) {
            Log.d(TAG, "OEM broadcast failed (may not be OEM device): " + e.getMessage());
        }
    }

    private void sendNavigationUpdateBroadcast(String maneuver, String street, int distance, int remaining) {
        try {
            Intent intent = new Intent("com.android.car.navigation.UPDATE_NAVIGATION");
            intent.putExtra("maneuver_text", maneuver);
            intent.putExtra("street_name", street);
            intent.putExtra("distance_meters", distance);
            intent.putExtra("remaining_seconds", remaining);
            intent.setPackage(null);
            getReactApplicationContext().sendBroadcast(intent);
        } catch (Exception e) {
            // Silently ignore
        }
    }

    private void sendNavigationStopBroadcast() {
        try {
            Intent intent = new Intent("com.android.car.navigation.STOP_NAVIGATION");
            intent.setPackage(null);
            getReactApplicationContext().sendBroadcast(intent);
            Log.d(TAG, "OEM navigation STOP broadcast sent");
        } catch (Exception e) {
            // Silently ignore
        }
    }

    private boolean checkOemProjectionAvailability() {
        try {
            // Проверяем наличие OEM CarProjectionService
            Intent intent = new Intent("com.android.car.navigation.CarProjectionService");
            return getReactApplicationContext().getPackageManager().resolveService(intent, 0) != null;
        } catch (Exception e) {
            return false;
        }
    }

    // ==================== Navigation Callback Interface ====================

    public interface NavigationUpdateCallback {
        void onNavigationUpdate(String maneuver, String street, int distance, int remaining, int total);
    }

    public void setNavigationCallback(NavigationUpdateCallback callback) {
        this.navigationCallback = callback;
    }
}
