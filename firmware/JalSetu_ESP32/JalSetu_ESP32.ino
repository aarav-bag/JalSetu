/*
 * JalSetu ESP32 Firmware
 * ──────────────────────
 * WiFi credentials are configured via a captive-portal hotspot —
 * NO re-flashing needed when changing networks.
 *
 * First boot / WiFi reset:
 *   1. ESP32 creates a hotspot called  "JalSetu-Setup"
 *   2. Connect your phone/laptop to it  (no password)
 *   3. A setup page opens automatically (or go to 192.168.4.1)
 *   4. Pick your WiFi network, enter the password → Save
 *   5. ESP32 reboots, connects, starts sending data
 *
 * To change WiFi later (new location):
 *   Hold the BOOT button (GPIO 0) for 3 seconds while powered on.
 *   The hotspot re-appears — repeat steps 2-5.
 *
 * Libraries required (install via Arduino Library Manager):
 *   • WiFiManager  by tzapu  (search "WiFiManager")
 *   • ArduinoJson  by bblanchon
 *   • HTTPClient   (bundled with ESP32 Arduino core)
 */

#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─── JalSetu server ───────────────────────────────────────────
const char* SERVER_URL = "https://jalsetu-rbeg.onrender.com/api/esp32/sensor-data";
const char* SECRET     = "JALSETU2024";
const int   FARM_ID    = 1;

// ─── Sensor pins ──────────────────────────────────────────────
#define PIN_TDS          34   // TDS sensor analog out
#define PIN_SOIL_FIELD1  32   // Soil moisture — Field 1
#define PIN_SOIL_FIELD2  36   // Soil moisture — Field 2 (VP pin)

// ─── Control pins ─────────────────────────────────────────────
#define PIN_LED          2    // Onboard LED (GPIO 2)
#define PIN_RESET_WIFI   0    // BOOT button — hold 3 s to reset WiFi

// ─── Soil calibration ─────────────────────────────────────────
#define SOIL1_DRY        4095
#define SOIL1_WET        500
#define SOIL2_DRY        4095
#define SOIL2_WET        1100

// ─── Timing ───────────────────────────────────────────────────
const unsigned long INTERVAL_MS      = 30000;  // 30 s between uploads
const unsigned long RESET_HOLD_MS    = 3000;   // hold 3 s to reset WiFi

unsigned long lastSend = 0;

// ══════════════════════════════════════════════════════════════
//  LED helpers
// ══════════════════════════════════════════════════════════════
void ledOn()  { digitalWrite(PIN_LED, HIGH); }
void ledOff() { digitalWrite(PIN_LED, LOW);  }

void blinkLed(int times = 3, int ms = 100) {
  for (int i = 0; i < times; i++) {
    ledOff(); delay(ms);
    ledOn();  delay(ms);
  }
}

// Slow blink while the config portal is open
void blinkSlow() {
  ledOff(); delay(500);
  ledOn();  delay(500);
}

// ══════════════════════════════════════════════════════════════
//  Check if BOOT button is held → reset saved WiFi
// ══════════════════════════════════════════════════════════════
void checkWiFiReset() {
  if (digitalRead(PIN_RESET_WIFI) == LOW) {
    unsigned long holdStart = millis();
    Serial.println("[WiFi] BOOT held — release in 3 s to reset WiFi...");
    while (digitalRead(PIN_RESET_WIFI) == LOW) {
      if (millis() - holdStart >= RESET_HOLD_MS) {
        Serial.println("[WiFi] Resetting saved credentials...");
        blinkLed(6, 80);          // fast blink = wiping
        WiFiManager wm;
        wm.resetSettings();
        Serial.println("[WiFi] Done — rebooting into config mode");
        delay(500);
        ESP.restart();
      }
      delay(50);
    }
    Serial.println("[WiFi] Button released early — skipping reset");
  }
}

// ══════════════════════════════════════════════════════════════
//  Connect to WiFi (or open config portal if no credentials)
// ══════════════════════════════════════════════════════════════
void connectWiFi() {
  WiFiManager wm;

  // Portal timeout: 3 minutes then reboot and try again
  wm.setConfigPortalTimeout(180);

  // While portal is open, blink the LED
  wm.setAPCallback([](WiFiManager*) {
    Serial.println("[WiFi] Config portal open — connect to 'JalSetu-Setup'");
    ledOff();
  });

  // Attempt to connect; if no saved creds (or they fail) open the portal
  bool connected = wm.autoConnect("JalSetu-Setup");   // open AP, no password

  if (!connected) {
    Serial.println("[WiFi] Config timeout — rebooting");
    ESP.restart();
  }

  Serial.printf("[WiFi] Connected — IP: %s\n", WiFi.localIP().toString().c_str());
  ledOn();   // solid ON = connected and running
}

// ══════════════════════════════════════════════════════════════
//  Read TDS  (ppm)
// ══════════════════════════════════════════════════════════════
float readTDS() {
  long sum = 0;
  for (int i = 0; i < 30; i++) { sum += analogRead(PIN_TDS); delay(10); }
  float voltage = (sum / 30.0f) * (3.3f / 4095.0f);
  float tds = (133.42f * voltage * voltage * voltage
             - 255.86f * voltage * voltage
             + 857.39f * voltage) * 0.5f;
  return max(0.0f, tds);
}

// ══════════════════════════════════════════════════════════════
//  Read pH  (simulated neutral — replace with real sensor math)
// ══════════════════════════════════════════════════════════════
float readPH() {
  float options[] = {7.0, 7.1, 7.2, 7.3, 7.4, 7.5};
  return options[random(0, 6)];
}

// ══════════════════════════════════════════════════════════════
//  Read Soil Moisture  (0–100 %)
// ══════════════════════════════════════════════════════════════
float readSoil(int pin, int dryVal, int wetVal) {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(pin); delay(10); }
  float pct = (float)(dryVal - sum / 10.0f) / (dryVal - wetVal) * 100.0f;
  return constrain(pct, 0.0f, 100.0f);
}

// ══════════════════════════════════════════════════════════════
//  POST sensor data to JalSetu server
// ══════════════════════════════════════════════════════════════
void sendToServer(int fieldId, float tds, float ph, float soil) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Not connected — skipping upload");
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["secret"]       = SECRET;
  doc["farmId"]       = FARM_ID;
  doc["fieldId"]      = fieldId;
  doc["tds"]          = (int)tds;
  doc["ph"]           = ph;
  doc["soilMoisture"] = (int)soil;

  String body;
  serializeJson(doc, body);

  Serial.println("[POST] " + body);
  int code = http.POST(body);
  Serial.printf("[Server] Field %d → HTTP %d\n", fieldId, code);
  http.end();
}

// ══════════════════════════════════════════════════════════════
//  Setup
// ══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(33));
  analogReadResolution(12);

  pinMode(PIN_LED,        OUTPUT);
  pinMode(PIN_RESET_WIFI, INPUT_PULLUP);

  ledOff();   // off while connecting

  // Check for WiFi reset request (hold BOOT on power-up)
  checkWiFiReset();

  // Connect (opens portal if no saved credentials)
  connectWiFi();
}

// ══════════════════════════════════════════════════════════════
//  Loop
// ══════════════════════════════════════════════════════════════
void loop() {
  // Allow mid-session WiFi reset via BOOT button
  checkWiFiReset();

  unsigned long now = millis();
  if (now - lastSend < INTERVAL_MS) return;
  lastSend = now;

  float tds   = readTDS();
  float ph    = readPH();
  float soil1 = readSoil(PIN_SOIL_FIELD1, SOIL1_DRY, SOIL1_WET);
  float soil2 = readSoil(PIN_SOIL_FIELD2, SOIL2_DRY, SOIL2_WET);

  Serial.printf("[Sensors] TDS: %.0f ppm | pH: %.1f | F1: %.0f%% | F2: %.0f%%\n",
                tds, ph, soil1, soil2);

  blinkLed();
  sendToServer(1, tds, ph, soil1);
  sendToServer(2, tds, ph, soil2);

  ledOn();   // back to solid ON = idle
}
