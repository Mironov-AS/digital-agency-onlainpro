# Add project specific ProGuard rules here.

# OSMdroid
-keep class org.osmdroid.** { *; }
-dontwarn org.osmdroid.**

# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}
-dontwarn retrofit2.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Gson
-keepattributes Signature
-keep class com.google.gson.** { *; }
-keep class com.osmnav.pro.data.repository.** { *; }

# Keep data classes
-keep class com.osmnav.pro.domain.model.** { *; }
-keep class com.osmnav.pro.data.remote.** { *; }
