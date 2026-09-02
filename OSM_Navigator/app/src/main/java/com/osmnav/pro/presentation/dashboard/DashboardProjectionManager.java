package com.osmnav.pro.presentation.dashboard;

import android.app.Presentation;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Display;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.osmnav.pro.R;
import com.osmnav.pro.domain.model.NavigationState;

/**
 * Менеджер проекции навигации на приборную панель автомобиля.
 *
 * Поддерживаемые механизмы:
 * 1. Android Presentation API — стандартный механизм для вторичных дисплеев
 * 2. OEM-специфичные intents — для i.MX 8QXP и других автомобильных систем
 * 3. Android Auto CarApp Library — для головных устройств с поддержкой AAOS
 *
 * Использование:
 *   DashboardProjectionManager manager = new DashboardProjectionManager(context);
 *   manager.startProjection(destination, totalDistance);
 *   manager.updateNavigationState(state);
 *   manager.stopProjection();
 */
public class DashboardProjectionManager {

    private static final String TAG = "DashboardProjection";

    // OEM broadcast actions (i.MX 8QXP и другие)
    private static final String ACTION_NAV_START = "com.osmnavigator.pro.NAVIGATION_START";
    private static final String ACTION_NAV_UPDATE = "com.osmnavigator.pro.NAVIGATION_UPDATE";
    private static final String ACTION_NAV_STOP = "com.osmnavigator.pro.NAVIGATION_STOP";

    // Дополнительные OEM intents
    private static final String OEM_NAV_START = "com.android.car.navigation.START_NAVIGATION";
    private static final String OEM_NAV_UPDATE = "com.android.car.navigation.UPDATE_NAVIGATION";
    private static final String OEM_NAV_STOP = "com.android.car.navigation.STOP_NAVIGATION";

    private final Context context;
    private final WindowManager windowManager;
    private final android.hardware.display.DisplayManager displayManager;

    private NavigationPresentation activePresentation;
    private Display secondaryDisplay;
    private boolean isProjecting = false;
    private boolean isPresentationDismissed = false;

    // Текущее состояние навигации
    private NavigationState currentState;
    private final Handler uiHandler;

    public DashboardProjectionManager(Context context) {
        this.context = context.getApplicationContext();
        this.windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        this.displayManager = (android.hardware.display.DisplayManager) context.getSystemService(Context.DISPLAY_SERVICE);
        this.uiHandler = new Handler(Looper.getMainLooper());
    }

    /**
     * Запустить проекцию на приборную панель.
     * Определяет доступные дисплеи и показывает навигацию.
     */
    public void startProjection(@Nullable String destinationName, double destLat, double destLon) {
        if (isProjecting) return;

        android.util.Log.d(TAG, "Starting dashboard projection");

        // 1. Пытаемся найти вторичный дисплей (приборная панель)
        findSecondaryDisplay();

        // 2. Отправляем OEM intents для i.MX 8QXP head units
        sendOemNavigationStart(destinationName, destLat, destLon);

        // 3. Пытаемся показать Presentation на вторичном дисплее
        if (secondaryDisplay != null) {
            showPresentation();
        } else {
            android.util.Log.d(TAG, "No secondary display found, using OEM intents only");
        }

        isProjecting = true;
    }

    /**
     * Обновить состояние навигации на приборной панели.
     * Вызывается при каждом обновлении манёвра.
     */
    public void updateNavigationState(NavigationState state) {
        this.currentState = state;

        // Обновляем Presentation если активен
        if (activePresentation != null && !isPresentationDismissed) {
            uiHandler.post(() -> {
                if (activePresentation != null && !isPresentationDismissed) {
                    activePresentation.updateState(state);
                }
            });
        }

        // Отправляем OEM update
        sendOemNavigationUpdate(state);
    }

    /**
     * Остановить проекцию.
     */
    public void stopProjection() {
        android.util.Log.d(TAG, "Stopping dashboard projection");

        if (activePresentation != null && !isPresentationDismissed) {
            isPresentationDismissed = true;
            activePresentation.dismiss();
            activePresentation = null;
        }

        sendOemNavigationStop();
        isProjecting = false;
        currentState = null;
    }

    /**
     * Проверить доступность проекции.
     */
    public boolean isProjectionAvailable() {
        findSecondaryDisplay();
        return secondaryDisplay != null;
    }

    public boolean isProjecting() {
        return isProjecting;
    }

    // ==================== DISPLAY DETECTION ====================

    private void findSecondaryDisplay() {
        if (secondaryDisplay != null) return;

        // Ищем все дисплеи через DisplayManager
        Display[] displays = displayManager.getDisplays();

        if (displays.length <= 1) {
            android.util.Log.d(TAG, "Only " + displays.length + " display(s) found");
            return;
        }

        // Первый дисплей — основной экран
        // Ищем вторичный (приборная панель)
        for (Display display : displays) {
            // Ищем дисплей с флагом SECONDARY
            // Используем reflection для скрытых флагов
            try {
                int flags = display.getFlags();
                
                // FLAG_SECONDARY = 2
                boolean isSecondary = (flags & 0x00000002) != 0;

                android.util.Log.d(TAG, "Display: " + display.getName()
                    + " flags=0x" + Integer.toHexString(flags)
                    + " secondary=" + isSecondary);

                // Приборная панель обычно имеет FLAG_SECONDARY
                if (isSecondary) {
                    secondaryDisplay = display;
                    android.util.Log.i(TAG, "Found secondary display: " + display.getName());
                    return;
                }
            } catch (Exception e) {
                android.util.Log.w(TAG, "Error checking display flags: " + e.getMessage());
            }
        }

        // Fallback: используем второй дисплей если есть
        if (displays.length > 1) {
            secondaryDisplay = displays[1];
            android.util.Log.i(TAG, "Using fallback secondary display: " + displays[1].getName());
        }
    }

    // ==================== PRESENTATION ====================

    private void showPresentation() {
        if (secondaryDisplay == null) return;

        try {
            if (activePresentation != null && !isPresentationDismissed) {
                isPresentationDismissed = true;
                activePresentation.dismiss();
            }

            isPresentationDismissed = false;
            activePresentation = new NavigationPresentation(context, secondaryDisplay);
            activePresentation.show();
            android.util.Log.i(TAG, "Presentation shown on: " + secondaryDisplay.getName());

            if (currentState != null) {
                activePresentation.updateState(currentState);
            }

        } catch (Exception e) {
            android.util.Log.e(TAG, "Failed to show presentation: " + e.getMessage());
        }
    }

    // ==================== OEM BROADCASTS ====================

    private void sendOemNavigationStart(@Nullable String destName, double lat, double lon) {
        try {
            // Android Auto / OEM intents
            Intent intent = new Intent(OEM_NAV_START);
            intent.putExtra("destination_name", destName != null ? destName : "Пункт назначения");
            intent.putExtra("destination_lat", lat);
            intent.putExtra("destination_lon", lon);
            intent.putExtra("package_name", context.getPackageName());
            intent.setPackage(null); // broadcast to all
            context.sendBroadcast(intent);
            android.util.Log.d(TAG, "OEM navigation start broadcast sent");
        } catch (Exception e) {
            android.util.Log.d(TAG, "OEM broadcast failed: " + e.getMessage());
        }

        // Собственные intents
        try {
            Intent intent = new Intent(ACTION_NAV_START);
            intent.putExtra("destination", destName);
            intent.putExtra("lat", lat);
            intent.putExtra("lon", lon);
            intent.setPackage(null);
            context.sendBroadcast(intent);
        } catch (Exception e) {
            // silent
        }
    }

    private void sendOemNavigationUpdate(NavigationState state) {
        try {
            Intent intent = new Intent(OEM_NAV_UPDATE);
            intent.putExtra("maneuver_text", state.maneuverText);
            intent.putExtra("street_name", state.streetName != null ? state.streetName : "");
            intent.putExtra("distance_meters", state.distanceMeters);
            intent.putExtra("total_distance", state.totalDistanceMeters);
            intent.putExtra("remaining_time", state.remainingSeconds);
            intent.putExtra("next_maneuver", state.nextManeuverText);
            intent.putExtra("next_distance", state.nextDistanceMeters);
            intent.setPackage(null);
            context.sendBroadcast(intent);
        } catch (Exception e) {
            // silent
        }

        // Собственные intents
        try {
            Intent intent = new Intent(ACTION_NAV_UPDATE);
            intent.putExtra("maneuver", state.maneuverText);
            intent.putExtra("distance", state.distanceMeters);
            intent.putExtra("street", state.streetName);
            intent.setPackage(null);
            context.sendBroadcast(intent);
        } catch (Exception e) {
            // silent
        }
    }

    private void sendOemNavigationStop() {
        try {
            Intent intent = new Intent(OEM_NAV_STOP);
            intent.setPackage(null);
            context.sendBroadcast(intent);
        } catch (Exception e) {
            // silent
        }

        try {
            Intent intent = new Intent(ACTION_NAV_STOP);
            intent.setPackage(null);
            context.sendBroadcast(intent);
        } catch (Exception e) {
            // silent
        }
    }

    // ==================== INNER CLASS: NAVIGATION PRESENTATION ====================

    private class NavigationPresentation extends Presentation {

        private final LinearLayout rootView;
        private final TextView tvManeuver;
        private final TextView tvDistance;
        private final TextView tvStreet;
        private final TextView tvNextManeuver;
        private final TextView tvTimeRemaining;

        public NavigationPresentation(Context context, Display display) {
            super(context, display);
            
            // Создаём layout программно
            rootView = new LinearLayout(context);
            rootView.setOrientation(LinearLayout.VERTICAL);
            rootView.setPadding(32, 32, 32, 32);
            rootView.setBackgroundColor(0xFF1A1A1A); // Тёмный фон
            
            // Заголовок
            TextView tvTitle = new TextView(context);
            tvTitle.setText("Навигация");
            tvTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24);
            tvTitle.setTextColor(0xFFFFFFFF);
            tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
            rootView.addView(tvTitle);
            
            // Текущий манёвр
            tvManeuver = new TextView(context);
            tvManeuver.setTextSize(TypedValue.COMPLEX_UNIT_SP, 36);
            tvManeuver.setTextColor(0xFF1976D2);
            tvManeuver.setTypeface(null, android.graphics.Typeface.BOLD);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            params.topMargin = 32;
            rootView.addView(tvManeuver, params);
            
            // Расстояние до манёвра
            tvDistance = new TextView(context);
            tvDistance.setTextSize(TypedValue.COMPLEX_UNIT_SP, 28);
            tvDistance.setTextColor(0xFFFFFFFF);
            rootView.addView(tvDistance);
            
            // Улица
            tvStreet = new TextView(context);
            tvStreet.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20);
            tvStreet.setTextColor(0xFFAAAAAA);
            rootView.addView(tvStreet);
            
            // Следующий манёвр
            tvNextManeuver = new TextView(context);
            tvNextManeuver.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
            tvNextManeuver.setTextColor(0xFF888888);
            params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            params.topMargin = 24;
            rootView.addView(tvNextManeuver, params);
            
            // Время в пути
            tvTimeRemaining = new TextView(context);
            tvTimeRemaining.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22);
            tvTimeRemaining.setTextColor(0xFFFFFFFF);
            params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            params.topMargin = 16;
            rootView.addView(tvTimeRemaining, params);
            
            setContentView(rootView);
        }

        public void updateState(NavigationState state) {
            if (isShowing()) {
                tvManeuver.setText(state.maneuverText != null ? state.maneuverText : "");
                tvDistance.setText(formatDistance(state.distanceMeters));
                tvStreet.setText(state.streetName != null ? state.streetName : "");
                tvStreet.setVisibility(state.streetName != null && !state.streetName.isEmpty() ? View.VISIBLE : View.GONE);
                
                if (state.nextManeuverText != null && state.nextDistanceMeters > 0) {
                    tvNextManeuver.setText("Затем: " + state.nextManeuverText + " — " + formatDistance(state.nextDistanceMeters));
                    tvNextManeuver.setVisibility(View.VISIBLE);
                } else {
                    tvNextManeuver.setVisibility(View.GONE);
                }
                
                tvTimeRemaining.setText("Осталось: " + formatTime(state.remainingSeconds) + " | " + formatDistance((int) state.totalDistanceMeters));
            }
        }

        private String formatDistance(int meters) {
            if (meters < 1000) {
                return meters + " м";
            } else {
                return String.format("%.1f км", meters / 1000.0);
            }
        }

        private String formatTime(int seconds) {
            int minutes = seconds / 60;
            if (minutes < 60) {
                return minutes + " мин";
            } else {
                int hours = minutes / 60;
                int mins = minutes % 60;
                return hours + "ч " + mins + " мин";
            }
        }
    }
}
