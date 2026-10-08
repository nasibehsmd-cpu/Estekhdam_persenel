package com.nasibeh.estekhdampersenel;

import android.Manifest;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.os.Build;
import android.content.SharedPreferences;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent serviceIntent = new Intent(this, NtfyService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        webView = new WebView(this);
        setContentView(webView);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    1002
            );
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                view.evaluateJavascript(
                    "(function(){return localStorage.getItem('workerCode') || sessionStorage.getItem('workerCode') || '';})();",
                    value -> {
                        if (value == null) {
                            return;
                        }

                        String workerCode = value.replace("\"", "");

                        if (workerCode.isEmpty()) {
                            return;
                        }

                        SharedPreferences preferences =
                                getSharedPreferences("estekhdam", MODE_PRIVATE);

                        preferences.edit()
                                .putString("workerCode", workerCode)
                                .apply();

                        Intent serviceIntent =
                                new Intent(MainActivity.this, NtfyService.class);

                        serviceIntent.putExtra("workerCode", workerCode);

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            startForegroundService(serviceIntent);
                        } else {
                            startService(serviceIntent);
                        }
                    }
                );
            }
        });

        webView.loadUrl("https://nasibehsmd-cpu.github.io/Estekhdam_persenel/index.html");
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (webView != null) {
            webView.evaluateJavascript(
                "(function(){document.querySelectorAll('audio').forEach(function(a){a.pause();a.currentTime=0;});})();",
                null
            );
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
