package com.ratedmedialistsn

import android.os.Build
import android.os.LocaleList
import java.util.Locale
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LocaleModule(reactContext: ReactApplicationContext):
  ReactContextBaseJavaModule(reactContext){
    override fun getName(): String = "LocaleModule"

    @ReactMethod
    fun getLocale(promise: Promise){
      try {
        val locale: Locale = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            // On Android 7.0+ we have a LocaleList (may be null on some weird devices)
            val localeList: LocaleList? =
                reactApplicationContext.resources.configuration.locales

            // If the list exists and has at least one entry, use it;
            // otherwise fall back to the older single‑locale API.
            localeList?.let { it.get(0) } ?: reactApplicationContext
                .resources.configuration.locale
        } else {
            // Pre‑N devices expose only a single Locale
            reactApplicationContext.resources.configuration.locale
        }
        promise.resolve(locale.toLanguageTag());
      } catch (e: Exception){
        promise.reject("ERR_GET_LOCALE", e);
      }
    }
  }
