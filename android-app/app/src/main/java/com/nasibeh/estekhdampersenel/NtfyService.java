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
    private static final String TOPIC_URL =
            "https://ntfy.sh/estekhdam-test-73921/json";

    private Thread listenerThread;
    private TextToSpeech tts;
    private final long serviceStartTime = System.currentTimeMillis() / 1000;

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

        startNtfyListener();
    }

    private void startNtfyListener() {
        listenerThread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                HttpURLConnection connection = null;

                try {
                    URL url = new URL(TOPIC_URL);
                    connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("GET");
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(0);

                    BufferedReader reader = new BufferedReader(
                            new InputStreamReader(connection.getInputStream())
                    );

                    String line;

                    while ((line = reader.readLine()) != null) {
                        if (line.contains("\"event\":\"message\"")) {
                            long messageTime = extractMessageTime(line);

                            if (messageTime > serviceStartTime) {
                                speakNotification();
                            }
                        }
                    }

                    reader.close();

                } catch (Exception ignored) {
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                } finally {
                    if (connection != null) {
                        connection.disconnect();
                    }
                }
            }
        });

        listenerThread.start();
    }

    private long extractMessageTime(String line) {
        try {
            String key = "\"time\":";
            int start = line.indexOf(key);

            if (start == -1) {
                return 0;
            }

            start += key.length();

            int end = start;
            while (end < line.length()
                    && Character.isDigit(line.charAt(end))) {
                end++;
            }

            return Long.parseLong(line.substring(start, end));
        } catch (Exception e) {
            return 0;
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
