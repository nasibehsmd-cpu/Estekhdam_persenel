package com.nasibeh.estekhdampersenel;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.speech.tts.TextToSpeech;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

public class NtfyService extends Service {

    private static final String CHANNEL_ID = "ntfy_connection";
    private static final String WORKER_URL =
            "https://estekhdam-ntfy.nasibehsmd.workers.dev";

    private Thread listenerThread;
    private volatile String workerCode;
    private TextToSpeech tts;

    @Override
    public void onCreate() {
        super.onCreate();

        createNotificationChannel();

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(Locale.US);
                tts.setSpeechRate(0.9f);
            }
        });

        startForeground(1001, createNotification());
    }

    private void startNtfyListener() {
        listenerThread = new Thread(() -> {

            while (!Thread.currentThread().isInterrupted()) {

                HttpURLConnection connection = null;

                try {
                    if (workerCode == null || workerCode.isEmpty()) {
                        Thread.sleep(5000);
                        continue;
                    }

                    URL url = new URL(
                            WORKER_URL
                                    + "?workerCode="
                                    + java.net.URLEncoder.encode(
                                            workerCode,
                                            "UTF-8"
                                    )
                    );

                    connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("GET");
                    connection.setConnectTimeout(10000);
                    connection.setReadTimeout(10000);

                    int responseCode = connection.getResponseCode();

                    if (responseCode == HttpURLConnection.HTTP_OK) {

                        BufferedReader reader = new BufferedReader(
                                new InputStreamReader(
                                        connection.getInputStream()
                                )
                        );

                        StringBuilder response = new StringBuilder();
                        String line;

                        while ((line = reader.readLine()) != null) {
                            response.append(line);
                        }

                        reader.close();

                        org.json.JSONArray notifications =
                                new org.json.JSONArray(response.toString());

                        for (int i = 0; i < notifications.length(); i++) {

                            org.json.JSONObject notification =
                                    notifications.getJSONObject(i);

                            String id =
                                    notification.optString("id", "");

                            String message =
                                    notification.optString("message", "");

                            if (id.isEmpty() || message.isEmpty()) {
                                continue;
                            }

                            org.json.JSONObject data =
                                    new org.json.JSONObject(message);

                            String notificationWorkerCode =
                                    data.optString("workerCode", "");

                            if (!workerCode.equals(notificationWorkerCode)) {
                                continue;
                            }

                            long createdAt =
                                    notification.optLong("createdAt", 0);

                            android.content.SharedPreferences preferences =
                                    getSharedPreferences("estekhdam", MODE_PRIVATE);

                            String startKey =
                                    "notificationStartTime_" + workerCode;

                            long notificationStartTime =
                                    preferences.getLong(startKey, 0);

                            if (createdAt < notificationStartTime) {
                                deleteNotification(id);
                                continue;
                            }

                            speakNotification();

                            deleteNotification(id);
                        }
                    }

                } catch (Exception ignored) {

                } finally {

                    if (connection != null) {
                        connection.disconnect();
                    }
                }

                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        listenerThread.start();
    }

    private void deleteNotification(String id) {

        HttpURLConnection connection = null;

        try {

            URL url = new URL(WORKER_URL + "/" + id);

            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("DELETE");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            connection.getResponseCode();

        } catch (Exception ignored) {

        } finally {

            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private void speakNotification() {
        if (tts != null) {
            tts.speak(
                    "Taazaa eesh vaar",
                    TextToSpeech.QUEUE_FLUSH,
                    null,
                    "new_job"
            );
        }
    }

    private Notification createNotification() {
        return new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("Estekhdam Persenel")
                .setContentText("اتصال اعلان‌ها فعال است")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setOngoing(true)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "اتصال اعلان کار جدید",
                    NotificationManager.IMPORTANCE_LOW
            );

            NotificationManager manager =
                    getSystemService(NotificationManager.class);

            manager.createNotificationChannel(channel);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        if (intent != null) {
            String code = intent.getStringExtra("workerCode");

            if (code != null && !code.isEmpty()) {
                workerCode = code;

                android.content.SharedPreferences preferences =
                        getSharedPreferences("estekhdam", MODE_PRIVATE);

                android.content.SharedPreferences.Editor editor =
                        preferences.edit();

                editor.putString("workerCode", code);

                String startKey = "notificationStartTime_" + code;

                if (!preferences.contains(startKey)) {
                    editor.putLong(
                            startKey,
                            System.currentTimeMillis() / 1000
                    );
                }

                editor.apply();
            }
        }

        if (workerCode == null || workerCode.isEmpty()) {
            workerCode = getSharedPreferences("estekhdam", MODE_PRIVATE)
                    .getString("workerCode", "");
        }

        if (workerCode != null
                && !workerCode.isEmpty()
                && (listenerThread == null || !listenerThread.isAlive())) {
            startNtfyListener();
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (listenerThread != null) {
            listenerThread.interrupt();
        }

        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }

        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
