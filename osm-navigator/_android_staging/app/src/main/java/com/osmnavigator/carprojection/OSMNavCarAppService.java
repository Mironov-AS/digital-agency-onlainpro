package com.osmnavigator.carprojection;

import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.drawable.Icon;
import android.util.Log;
import android.util.TypedValue;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.car.app.CarAppService;
import androidx.car.app.Screen;
import androidx.car.app.Session;
import androidx.car.app.SessionInfo;
import androidx.car.app.model.Action;
import androidx.car.app.model.CarColor;
import androidx.car.app.model.CarIcon;
import androidx.car.app.model.Template;
import androidx.car.app.navigation.NavigationManager;
import androidx.car.app.navigation.NavigationTemplate;
import androidx.car.app.navigation.model.Destination;
import androidx.car.app.navigation.model.Maneuver;
import androidx.car.app.navigation.model.NavigationInfo;
import androidx.car.app.navigation.model.RoutingInfo;

/**
 * Android Auto CarAppService для проекции навигации OSM Navigator на приборную панель.
 *
 * Регистрируется в AndroidManifest.xml и автоматически обнаруживается
 * Android Auto / Android Automotive OS (AAOS) головного устройства.
 *
 * Когда пользователь запускает навигацию в OSM Navigator на телефоне,
 * Android Auto отображает Turn-by-Turn инструкции на экране головного
 * устройства и цифровой приборной панели.
 *
 * Важно: для работы требуется:
 * 1. Android Auto приложение на телефоне
 * 2. Совместимое головное устройство (Android Auto / AAOS)
 * 3. Подключение телефона к головному устройству (USB / Bluetooth)
 */
public class OSMNavCarAppService extends CarAppService {

    private static final String TAG = "OSMNavCarAppService";
    private static final String ROUTING_INFO_KEY = "osm_nav_routing";

    private NavigationManager mNavigationManager;
    private NavigationTemplate mCurrentTemplate;

    @Nullable
    @Override
    public Session onCreateSession(@Nullable SessionInfo sessionInfo) {
        Log.d(TAG, "onCreateSession - Android Auto connection established");
        return new OSMNavSession();
    }

    /**
     * Session для управления навигационной проекцией.
     * Получает обновления маршрута и отображает их на приборной панели.
     */
    private class OSMNavSession extends Session {

        private NavigationScreen mNavigationScreen;
        private NavigationManager.NavigationListener mNavigationListener;

        @Override
        public void onCreate(@NonNull Intent intent, @NonNull CallInfo callInfo) {
            super.onCreate(intent, callInfo);
            Log.d(TAG, "OSM Nav Session created");

            // Регистрируем listener для получения обновлений навигации от Android Auto
            mNavigationManager = getCarContext().getCarService(NavigationManager.class);
            mNavigationManager.setNavigationManagerCallback(new NavigationManager.NavigationManagerCallback() {
                @Override
                public void onNavigationMetadataChanged(@NonNull NavigationManager.NavigationMetadata navigationMetadata) {
                    Log.d(TAG, "Navigation metadata updated: " + navigationMetadata);
                }

                @Override
                public void onRouteNavigationStarted() {
                    Log.d(TAG, "Route navigation started on head unit");
                    if (mNavigationScreen != null) {
                        mNavigationScreen.onNavigationStarted();
                    }
                }

                @Override
                public void onRouteNavigationEnded() {
                    Log.d(TAG, "Route navigation ended on head unit");
                    if (mNavigationScreen != null) {
                        mNavigationScreen.onNavigationEnded();
                    }
                }

                @Override
                public void onDistanceRemainingChanged(long meters) {
                    Log.d(TAG, "Distance remaining: " + meters + "m");
                }

                @Override
                public void onTimeRemainingChanged(long seconds) {
                    Log.d(TAG, "Time remaining: " + seconds + "s");
                }

                @Override
                public void onEstimatedArrivalTimeChanged(long etaMillis) {
                    Log.d(TAG, "ETA changed: " + etaMillis);
                }
            });

            mNavigationScreen = new NavigationScreen(getCarContext());
            mNavigationScreen.setNavigationManager(mNavigationManager);
        }

        @NonNull
        @Override
        public Screen onGetScreen() {
            return mNavigationScreen;
        }

        @Override
        public void onDestroy() {
            Log.d(TAG, "OSM Nav Session destroyed");
            super.onDestroy();
        }
    }

    /**
     * Экран навигации для Android Auto.
     * Отображает Turn-by-Turn инструкции на приборной панели.
     */
    public static class NavigationScreen extends Screen {

        private NavigationManager navigationManager;

        // Текущие данные навигации
        private String currentManeuverText = "Начните движение";
        private String currentStreet = "";
        private int distanceMeters = 0;
        private int remainingSeconds = 0;
        private int totalDistanceMeters = 0;
        private boolean isNavigating = false;
        private Maneuver.Type lastManeuverType = Maneuver.Type.TURN_NORMAL_LEFT;

        public NavigationScreen(@NonNull CarContext carContext) {
            super(carContext);
        }

        public void setNavigationManager(NavigationManager nm) {
            this.navigationManager = nm;
            if (nm != null) {
                nm.addNavigationManagerCallback(new NavigationManager.NavigationManagerCallback() {
                    @Override
                    public void onNavigationMetadataChanged(@NonNull NavigationManager.NavigationMetadata nm) {
                        invalidate();
                    }
                });
            }
        }

        public void onNavigationStarted() {
            this.isNavigating = true;
            invalidate();
        }

        public void onNavigationEnded() {
            this.isNavigating = false;
            this.currentManeuverText = "Навигация завершена";
            this.currentStreet = "";
            this.distanceMeters = 0;
            invalidate();
        }

        /**
         * Обновить данные навигации из внешнего источника (через broadcast).
         * OSM Navigator на телефоне отправляет обновления через Intent.
         */
        public void updateNavigationData(String maneuver, String street, int distance, int remaining, int total) {
            this.currentManeuverText = maneuver;
            this.currentStreet = street;
            this.distanceMeters = distance;
            this.remainingSeconds = remaining;
            this.totalDistanceMeters = total;

            // Определяем тип манёвра по тексту
            this.lastManeuverType = parseManeuverType(maneuver);
            invalidate();
        }

        @NonNull
        @Override
        public Template onGetTemplate() {
            NavigationTemplate.Builder builder = NavigationTemplate.builder();

            // Навигационная информация
            NavigationInfo.Builder navInfoBuilder = NavigationInfo.builder("OSM Navigator");

            // Формируем Turn-by-Turn инструкцию
            String turnText = currentManeuverText;
            String distanceText = formatDistance(distanceMeters);
            String timeText = formatTime(remainingSeconds);

            // Создаём Maneuver для отображения на приборной панели
            Maneuver maneuver = new Maneuver.Builder(lastManeuverType)
                    .setIcon(createManeuverIcon(lastManeuverType))
                    .build();

            navInfoBuilder.setManeuver(maneuver);
            navInfoBuilder.setTurnDistance(distanceText);

            // Добавляем детали
            if (!currentStreet.isEmpty()) {
                navInfoBuilder.setPlaceName(currentStreet);
            }

            builder.setNavigationInfo(navInfoBuilder.build());

            // Добавляем строку состояния (маршрут)
            if (totalDistanceMeters > 0) {
                RoutingInfo routingInfo = new RoutingInfo.Builder()
                        .setSummary("Осталось: " + formatDistance(totalDistanceMeters) + " • " + timeText)
                        .build();
                builder.setRoutingInfo(routingInfo);
            }

            // Action для остановки навигации
            builder.setActionStrip(
                    new androidx.car.app.model.ActionStrip.Builder()
                            .addAction(
                                    new Action.Builder()
                                            .setTitle("Стоп")
                                            .setOnClickListener(() -> {
                                                // Отправляем broadcast для остановки навигации
                                                getCarContext()
                                                        .getPackageManager()
                                                        .getLaunchIntentForPackage(
                                                                getCarContext().getPackageName()
                                                        );
                                            })
                                            .build()
                            )
                            .build()
            );

            // Заголовок приложения
            builder.setTitle("OSM Navigator");

            return builder.build();
        }

        private Maneuver.Type parseManeuverType(String text) {
            String lower = text.toLowerCase();
            if (lower.contains("налево") || lower.contains("left")) {
                if (lower.contains("резко") || lower.contains("sharp")) return Maneuver.Type.TURN_SHARP_LEFT;
                if (lower.contains("немного") || lower.contains("slight")) return Maneuver.Type.TURN_SLIGHT_LEFT;
                return Maneuver.Type.TURN_NORMAL_LEFT;
            }
            if (lower.contains("направо") || lower.contains("right")) {
                if (lower.contains("резко") || lower.contains("sharp")) return Maneuver.Type.TURN_SHARP_RIGHT;
                if (lower.contains("немного") || lower.contains("slight")) return Maneuver.Type.TURN_SLIGHT_RIGHT;
                return Maneuver.Type.TURN_NORMAL_RIGHT;
            }
            if (lower.contains("разворот") || lower.contains("u-turn") || lower.contains("uturn")) {
                return Maneuver.Type.U_TURN;
            }
            if (lower.contains("прямо") || lower.contains("continue") || lower.contains("straight")) {
                return Maneuver.Type.STRAIGHT;
            }
            if (lower.contains("съезд") || lower.contains("exit")) {
                return Maneuver.Type.EXIT_LEFT;
            }
            if (lower.contains("направляйтесь") || lower.contains("arrive") || lower.contains("destination")) {
                return Maneuver.Type.ARRIVE;
            }
            if (lower.contains("паром") || lower.contains("ferry")) {
                return Maneuver.Type.FERRY;
            }
            return Maneuver.Type.DEPART;
        }

        private CarIcon createManeuverIcon(Maneuver.Type type) {
            // Создаём простую иконку манёвра через Canvas
            Bitmap bitmap = Bitmap.createBitmap(96, 96, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
            paint.setColor(Color.parseColor("#1976D2"));
            paint.setTextSize(48);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setFakeBoldText(true);

            // Рисуем круг
            canvas.drawCircle(48, 48, 40, paint);
            paint.setColor(Color.WHITE);

            // Рисуем стрелку в зависимости от типа
            String arrow = getArrowForManeuver(type);
            canvas.drawText(arrow, 48, 60, paint);

            return CarIcon.wrap(bitmap);
        }

        private String getArrowForManeuver(Maneuver.Type type) {
            switch (type) {
                case TURN_NORMAL_LEFT: return "←";
                case TURN_NORMAL_RIGHT: return "→";
                case TURN_SHARP_LEFT: return "↙";
                case TURN_SHARP_RIGHT: return "↘";
                case TURN_SLIGHT_LEFT: return "↖";
                case TURN_SLIGHT_RIGHT: return "↗";
                case U_TURN: return "↩";
                case STRAIGHT: return "↑";
                case EXIT_LEFT: return "⇖";
                case EXIT_RIGHT: return "⇗";
                case FERRY: return "⛴";
                case ARRIVE: return "🏁";
                case ROUNDABOUT_1:
                case ROUNDABOUT_2:
                case ROUNDABOUT_3:
                case ROUNDABOUT_4:
                case ROUNDABOUT_5:
                case ROUNDABOUT_6:
                    return "↱";
                default: return "↑";
            }
        }

        private String formatDistance(int meters) {
            if (meters >= 1000) {
                return String.format("%.1f км", meters / 1000.0);
            }
            return meters + " м";
        }

        private String formatTime(int seconds) {
            if (seconds <= 0) return "--:--";
            int minutes = seconds / 60;
            if (minutes >= 60) {
                return String.format("%dч %dм", minutes / 60, minutes % 60);
            }
            return minutes + " мин";
        }
    }
}
