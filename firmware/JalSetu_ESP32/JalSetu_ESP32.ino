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
 *
 * Active monitoring hardware:
 *   • Soil moisture probes for Field 1 and Field 2
 *
 * The school-demo build generates water-quality values locally.
 * Replace demo values with calibrated sensor readings before deployment.
 * No camera or water-level sensor is included.
 * Pump relay commands are supported and outputs initialize OFF.
 */

#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <math.h>
#include <string.h>

// ─── JalSetu server ───────────────────────────────────────────
const char* SERVER_URL = "https://jalsetu-rbeg.onrender.com/api/esp32/sensor-data";
const char* SECRET     = "JALSETU2024";
const int   FARM_ID    = 1;
const char* PUMP_TARGETS_URL = "https://jalsetu-rbeg.onrender.com/api/esp32/pump-targets";
const char* PUMP_STATUS_URL  = "https://jalsetu-rbeg.onrender.com/api/esp32/pump-status";

// ─── Sensor pins ──────────────────────────────────────────────
#define PIN_TDS   34   // TDS sensor analog out
#define SOIL1_PIN 32   // Soil moisture — Field 1
#define SOIL2_PIN 33   // Soil moisture — Field 2

// Keep enabled for the school demonstration. Set false to read the TDS ADC;
// pH is omitted until a physical probe and calibration are added.
#define DEMO_QUALITY_VALUES true

// ─── Control pins ─────────────────────────────────────────────
#define PIN_LED          2    // Onboard LED (GPIO 2)
#define PIN_RESET_WIFI   0    // BOOT button — hold 3 s to reset WiFi
#define RELAY1_PIN 26   // Relay 1 IN
#define RELAY2_PIN 27   // Relay 2 IN

// Hardware commissioning has been confirmed by the user.
// Keep the relay outputs inactive at boot; only server-approved targets can turn them on.
#define PUMP_OUTPUTS_ARMED true
#define PUMP_RELAY_ACTIVE_LOW true

// ─── Soil calibration ─────────────────────────────────────────
#define DRY1_VALUE 4095
#define WET1_VALUE 1800
#define DRY2_VALUE 3900
#define WET2_VALUE 1500

// ─── Timing ───────────────────────────────────────────────────
const unsigned long INTERVAL_MS      = 30000;  // 30 s between uploads
const unsigned long RESET_HOLD_MS    = 3000;   // hold 3 s to reset WiFi
const unsigned long PUMP_POLL_MS     = 5000;   // poll app commands every 5 s
const unsigned long PUMP_OFFLINE_MS  = 15000;  // force off without server contact
const unsigned long PUMP_MAX_RUN_MS  = 5000;   // firmware hard cap: 5 seconds

unsigned long lastSend = 0;
unsigned long lastPumpPoll = 0;
unsigned long lastPumpServerContact = 0;
bool pumpIsOn[2] = { false, false };
bool pumpRuntimeExpired[2] = { false, false };
unsigned long pumpStartedAt[2] = { 0, 0 };
unsigned long pumpMaxRunMs[2] = { 5000, 5000 };

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
//  Read and smooth measured TDS (ppm). This filters ADC noise only:
//  it does not clamp readings into an expected range or invent values.
// ══════════════════════════════════════════════════════════════
bool readTDS(float &tdsPpm) {
  const int sampleCount = 21;
  int samples[sampleCount];
  for (int i = 0; i < sampleCount; i++) {
    samples[i] = analogRead(PIN_TDS);
    delay(5);
  }

  // Median filter rejects occasional ADC spikes without hiding real changes.
  for (int i = 1; i < sampleCount; i++) {
    const int value = samples[i];
    int position = i - 1;
    while (position >= 0 && samples[position] > value) {
      samples[position + 1] = samples[position];
      position--;
    }
    samples[position + 1] = value;
  }

  const int rawMedian = samples[sampleCount / 2];
  // ADC rail values usually mean a disconnected/shorted analog output.
  if (rawMedian <= 3 || rawMedian >= 4092) return false;

  const float voltage = rawMedian * (3.3f / 4095.0f);
  const float measuredTds = (133.42f * voltage * voltage * voltage
             - 255.86f * voltage * voltage
             + 857.39f * voltage) * 0.5f;
  if (!isfinite(measuredTds) || measuredTds < 0.0f) return false;

  // Exponential moving average smooths display noise while tracking changes.
  static bool filterInitialized = false;
  static float filteredTds = 0.0f;
  if (!filterInitialized) {
    filteredTds = measuredTds;
    filterInitialized = true;
  } else {
    filteredTds += 0.35f * (measuredTds - filteredTds);
  }

  tdsPpm = filteredTds;
  return true;
}

// Generated presentation values change gradually so successive uploads remain stable.
int readDemoTDS() {
  static bool initialized = false;
  static int ppm = 0;

  if (!initialized) {
    ppm = random(240, 461);
    initialized = true;
  } else {
    const int driftToCenter = (350 - ppm) / 40;
    ppm = constrain(ppm + driftToCenter + random(-7, 8), 200, 500);
  }
  return ppm;
}

float readDemoPH() {
  static bool initialized = false;
  static int tenths = 70;

  if (!initialized) {
    tenths = random(70, 75);
    initialized = true;
  } else {
    const int change = random(0, 3);
    if (change == 1) tenths--;
    if (change == 2) tenths++;
    tenths = constrain(tenths, 70, 74);
  }
  return tenths / 10.0f;
}

// ══════════════════════════════════════════════════════════════
//  Read Soil Moisture  (0–100 %)
// ══════════════════════════════════════════════════════════════
// Uses the attached sketch's dry/wet endpoint conversion with the main
// module's calibrated endpoints and 10-sample averaging.
float calculateMoisture(int adc, int dryValue, int wetValue) {
  if (dryValue == wetValue) return 0.0f;
  const float moisture = (float)(dryValue - adc) / (float)(dryValue - wetValue) * 100.0f;
  return constrain(moisture, 0.0f, 100.0f);
}

float readSoil(int pin, int dryVal, int wetVal, int &rawAverage) {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(pin); delay(10); }
  rawAverage = sum / 10;
  return calculateMoisture(rawAverage, dryVal, wetVal);
}

// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
//  POST sensor data to JalSetu server
// ══════════════════════════════════════════════════════════════
void sendToServer(int fieldId, bool tdsAvailable, float tds, bool phAvailable, float ph, float soil) {
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
  if (tdsAvailable) doc["tds"] = (int)roundf(tds);
  if (phAvailable) doc["ph"] = ph;
  doc["soilMoisture"] = (int)soil;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  Serial.printf("[Server] Field %d → HTTP %d\n", fieldId, code);
  http.end();
}

int pumpRelayPin(int pumpIndex) {
  return pumpIndex == 0 ? RELAY1_PIN : RELAY2_PIN;
}

void setPumpOutput(int pumpIndex, bool on) {
  if (pumpIndex < 0 || pumpIndex > 1) return;
  if (!PUMP_OUTPUTS_ARMED) {
    pumpIsOn[pumpIndex] = false;
    return;
  }

  const int pin = pumpRelayPin(pumpIndex);
  const int relayLevel = (on != PUMP_RELAY_ACTIVE_LOW) ? HIGH : LOW;
  digitalWrite(pin, relayLevel);
  if (on && !pumpIsOn[pumpIndex]) {
    pumpStartedAt[pumpIndex] = millis();
  }
  if (!on) pumpStartedAt[pumpIndex] = 0;
  pumpIsOn[pumpIndex] = on;
}

void initializePumpOutputs() {
  if (!PUMP_OUTPUTS_ARMED) {
    pinMode(RELAY1_PIN, INPUT);
    pinMode(RELAY2_PIN, INPUT);
    Serial.println("[Pump] Outputs compile-time locked; keep relay IN wiring disconnected until commissioning");
    return;
  }

  // Set the configured inactive level before enabling output mode.
  digitalWrite(RELAY1_PIN, PUMP_RELAY_ACTIVE_LOW ? HIGH : LOW);
  digitalWrite(RELAY2_PIN, PUMP_RELAY_ACTIVE_LOW ? HIGH : LOW);
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  Serial.printf("[Pump] Relay outputs armed on GPIO %d and %d\n", RELAY1_PIN, RELAY2_PIN);
}

void sendPumpStatus() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(PUMP_STATUS_URL);
  http.setTimeout(4000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Jalsetu-Device-Secret", SECRET);

  StaticJsonDocument<384> doc;
  doc["farmId"] = FARM_ID;
  doc["firmwareEnabled"] = PUMP_OUTPUTS_ARMED;
  JsonArray states = doc.createNestedArray("states");
  for (int i = 0; i < 2; i++) {
    JsonObject state = states.createNestedObject();
    state["fieldIndex"] = i + 1;
    state["actualOn"] = pumpIsOn[i];
    state["runtimeExpired"] = pumpRuntimeExpired[i];
  }

  String body;
  serializeJson(doc, body);
  const int code = http.POST(body);
  if (code >= 200 && code < 300) {
    pumpRuntimeExpired[0] = false;
    pumpRuntimeExpired[1] = false;
  } else {
    Serial.printf("[Pump] Status report failed: HTTP %d\n", code);
  }
  http.end();
}

void enforcePumpSafety() {
  if (!PUMP_OUTPUTS_ARMED) return;
  const unsigned long now = millis();
  for (int i = 0; i < 2; i++) {
    if (!pumpIsOn[i]) continue;
    if (now - pumpStartedAt[i] >= pumpMaxRunMs[i]) {
      setPumpOutput(i, false);
      pumpRuntimeExpired[i] = true;
      Serial.printf("[Pump] Field %d stopped at configured run limit\n", i + 1);
    } else if (
      lastPumpServerContact == 0
      || now - lastPumpServerContact > PUMP_OFFLINE_MS
    ) {
      setPumpOutput(i, false);
      pumpRuntimeExpired[i] = true;
      Serial.printf("[Pump] Field %d stopped: server connection lost\n", i + 1);
    }
  }
}

void applyManualPumpCommand(int pumpIndex, bool turnOn) {
  if (pumpIndex < 0 || pumpIndex > 1) return;

  // Manual ON/OFF is requested by the authenticated JalSetu app through the
  // existing server target API. The firmware run-time cap still takes priority.
  if (!PUMP_OUTPUTS_ARMED || pumpRuntimeExpired[pumpIndex]) {
    turnOn = false;
  }

  if (turnOn != pumpIsOn[pumpIndex]) {
    Serial.printf(
      "[Pump] Field %d app pump target -> %s\n",
      pumpIndex + 1,
      turnOn ? "ON" : "OFF"
    );
  }
  setPumpOutput(pumpIndex, turnOn);
}

void pollPumpTargets() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  const String url = String(PUMP_TARGETS_URL) + "?farmId=" + String(FARM_ID);
  http.begin(url);
  http.setTimeout(5000);
  http.addHeader("X-Jalsetu-Device-Secret", SECRET);
  const int code = http.GET();

  if (code != HTTP_CODE_OK) {
    Serial.printf("[Pump] Target poll failed: HTTP %d\n", code);
    http.end();
    enforcePumpSafety();
    return;
  }

  StaticJsonDocument<1536> doc;
  const DeserializationError error = deserializeJson(doc, http.getString());
  http.end();
  if (error) {
    Serial.println("[Pump] Invalid target response; retaining fail-safe state");
    enforcePumpSafety();
    return;
  }

  lastPumpServerContact = millis();
  bool seen[2] = { false, false };
  JsonArray targets = doc["targets"].as<JsonArray>();
  for (JsonObject target : targets) {
    const int fieldIndex = target["fieldIndex"] | 0;
    if (fieldIndex < 1 || fieldIndex > 2) continue;
    const int index = fieldIndex - 1;
    seen[index] = true;

    // App manual commands are applied here; AUTO targets stay server-decided
    // so soil thresholds, rain probability, and stale-data handling stay aligned.
    const char* targetMode = target["mode"] | "";
    const bool manualMode = strcmp(targetMode, "manual") == 0;
    const bool offMode = strcmp(targetMode, "off") == 0;
    const bool autoMode = strcmp(targetMode, "auto") == 0;
    if (!manualMode && !offMode && !autoMode) {
      Serial.printf("[Pump] Field %d received an unknown mode; forcing OFF\n", fieldIndex);
      setPumpOutput(index, false);
      continue;
    }

    bool desiredOn = target["desiredOn"] | false;
    if (offMode) desiredOn = false;
    unsigned long maxRunMs = (target["maxRunSeconds"] | 60UL) * 1000UL;
    if (maxRunMs > PUMP_MAX_RUN_MS) maxRunMs = PUMP_MAX_RUN_MS;
    pumpMaxRunMs[index] = maxRunMs;

    if (pumpRuntimeExpired[index]) {
      desiredOn = false;
    } else if (desiredOn && pumpIsOn[index] && millis() - pumpStartedAt[index] >= maxRunMs) {
      desiredOn = false;
      pumpRuntimeExpired[index] = true;
      Serial.printf("[Pump] Field %d stopped at configured run limit\n", fieldIndex);
    }
    if (!PUMP_OUTPUTS_ARMED) desiredOn = false;
    if (manualMode || offMode) {
      applyManualPumpCommand(index, desiredOn);
    } else {
      setPumpOutput(index, desiredOn);
    }
  }

  for (int i = 0; i < 2; i++) {
    if (!seen[i]) setPumpOutput(i, false);
  }
  sendPumpStatus();
}

// ══════════════════════════════════════════════════════════════
//  Setup
// ══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  randomSeed(analogRead(SOIL2_PIN) ^ micros());

  pinMode(PIN_LED,        OUTPUT);
  pinMode(PIN_RESET_WIFI, INPUT_PULLUP);
  initializePumpOutputs();

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
  enforcePumpSafety();
  if (now - lastPumpPoll >= PUMP_POLL_MS) {
    lastPumpPoll = now;
    pollPumpTargets();
  }

  if (now - lastSend < INTERVAL_MS) return;
  lastSend = now;

  float tds = 0.0f;
  float ph = 0.0f;
  bool tdsAvailable = false;
  bool phAvailable = false;
  if (DEMO_QUALITY_VALUES) {
    tds = readDemoTDS();
    ph = readDemoPH();
    tdsAvailable = true;
    phAvailable = true;
  } else {
    tdsAvailable = readTDS(tds);
  }
  int rawSoil1 = 0;
  int rawSoil2 = 0;
  float soil1 = readSoil(SOIL1_PIN, DRY1_VALUE, WET1_VALUE, rawSoil1);
  float soil2 = readSoil(SOIL2_PIN, DRY2_VALUE, WET2_VALUE, rawSoil2);

  Serial.println("-----------------------------");
  Serial.print("[Sensors] TDS: ");
  if (tdsAvailable) Serial.printf("%.0f ppm", tds);
  else Serial.print("unavailable (check sensor analog output)");
  if (phAvailable) Serial.printf(" | pH: %.1f", ph);
  Serial.println();
  Serial.printf("Field 1 | Raw: %d | Moisture: %.0f%%\n", rawSoil1, soil1);
  Serial.printf("Field 2 | Raw: %d | Moisture: %.0f%%\n", rawSoil2, soil2);

  blinkLed();
  sendToServer(1, tdsAvailable, tds, phAvailable, ph, soil1);
  sendToServer(2, tdsAvailable, tds, phAvailable, ph, soil2);

  ledOn();   // back to solid ON = idle
}
