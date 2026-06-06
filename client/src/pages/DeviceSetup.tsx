import { useState } from "react";
import { Cpu, Copy, RefreshCw, CheckCircle, Key, Info, Wifi, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";

const DOMAIN = "https://jalsetu-rbeg.onrender.com";

function generateArduinoCode(apiKey: string, farmId: number, fieldId: number) {
  return `/*
 * JalSetu ESP32 Sensor Uploader
 * Sensors: pH + Soil Moisture
 * Auto-generated for Farm ID: ${farmId}, Field ID: ${fieldId}
 *
 * Wiring:
 *   pH Sensor     → GPIO 34 (ADC1_CH6)
 *   Soil Moisture → GPIO 35 (ADC1_CH7)
 *   Both sensors  → 3.3V and GND
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─── WiFi credentials ───────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ─── JalSetu credentials (do not share) ─────────────────
const char* API_KEY  = "${apiKey}";
const int   FARM_ID  = ${farmId};
const int   FIELD_ID = ${fieldId};
const char* SERVER   = "${DOMAIN}/api/esp32/sensor-data";

// ─── Sensor pin assignments ──────────────────────────────
const int PH_PIN            = 34;
const int SOIL_MOISTURE_PIN = 35;

// ─── Soil moisture calibration (tune these values) ───────
const int SOIL_DRY_VALUE = 3200;   // ADC reading when soil is completely dry
const int SOIL_WET_VALUE = 1200;   // ADC reading when soil is fully soaked

// ─── pH calibration ──────────────────────────────────────
// Adjust OFFSET if your sensor gives wrong pH values
// Typical: voltage at pH 7.0 is ~1.5V on a 3.3V system
const float PH_OFFSET = 0.0;

// How often to send data (milliseconds)
const unsigned long SEND_INTERVAL = 60000; // every 60 seconds

unsigned long lastSend = 0;

// ─── Helper: read pH ─────────────────────────────────────
float readPH() {
  int raw = 0;
  for (int i = 0; i < 10; i++) { raw += analogRead(PH_PIN); delay(10); }
  raw /= 10;
  float voltage = raw * (3.3 / 4095.0);
  float ph = 3.3 * voltage + PH_OFFSET;
  ph = constrain(ph, 0.0, 14.0);
  return ph;
}

// ─── Helper: read soil moisture % ────────────────────────
float readSoilMoisture() {
  int raw = 0;
  for (int i = 0; i < 10; i++) { raw += analogRead(SOIL_MOISTURE_PIN); delay(10); }
  raw /= 10;
  float pct = map(raw, SOIL_DRY_VALUE, SOIL_WET_VALUE, 0, 100);
  return constrain(pct, 0.0, 100.0);
}

// ─── Send data to JalSetu ────────────────────────────────
void sendData(float ph, float soilMoisture) {
  HTTPClient http;
  http.begin(SERVER);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["apiKey"]       = API_KEY;
  doc["farmId"]       = FARM_ID;
  doc["fieldId"]      = FIELD_ID;
  doc["ph"]           = ph;
  doc["soilMoisture"] = soilMoisture;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  if (code == 201) {
    Serial.println("[JalSetu] Data sent successfully!");
  } else {
    Serial.print("[JalSetu] Error: HTTP ");
    Serial.println(code);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12); // ESP32 12-bit ADC

  Serial.print("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println(" Connected!");
  Serial.print("IP: "); Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastSend >= SEND_INTERVAL) {
    lastSend = millis();

    float ph   = readPH();
    float soil = readSoilMoisture();

    Serial.print("[Sensor] pH: "); Serial.print(ph, 2);
    Serial.print("  Soil Moisture: "); Serial.print(soil, 1); Serial.println("%");

    if (WiFi.status() == WL_CONNECTED) {
      sendData(ph, soil);
    } else {
      Serial.println("[WiFi] Disconnected — skipping send");
      WiFi.reconnect();
    }
  }
}
`;
}

export default function DeviceSetup() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const { data: farms } = useQuery<any[]>({ queryKey: ["/api/my-farms"] });
  const farmId: number = farms?.[0]?.id ?? 0;

  const { data: fields } = useQuery<any[]>({
    queryKey: ["/api/farms", farmId, "fields"],
    enabled: !!farmId,
  });
  const fieldId: number = fields?.[0]?.id ?? 0;

  const { data: keyData, isLoading: keyLoading } = useQuery<{ apiKey: string }>({
    queryKey: ["/api/farm", farmId, "esp32-key"],
    enabled: !!farmId,
  });

  const regenerate = useMutation({
    mutationFn: () => apiRequest("POST", `/api/farm/${farmId}/esp32-key/regenerate`),
    onSuccess: async (res) => {
      const json = await res.json();
      queryClient.setQueryData(["/api/farm", farmId, "esp32-key"], json);
      toast({ title: "New API key generated", description: "Update your ESP32 code with the new key." });
    },
  });

  const apiKey = keyData?.apiKey ?? "";
  const code = farmId && fieldId && apiKey ? generateArduinoCode(apiKey, farmId, fieldId) : "";

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
    if (label === "Arduino code") { setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  const maskedKey = apiKey ? apiKey.slice(0, 10) + "••••••••••••••" : "";

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Device Setup</h1>
            <p className="text-sm page-subtitle font-medium mt-1">Connect your ESP32 to JalSetu</p>
          </div>
          <div className="h-12 w-12 rounded-2xl glass-tile flex items-center justify-center shadow-md">
            <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10 space-y-5">

        {/* How it works */}
        <div className="glass-card rounded-[1.5rem] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            <h2 className="font-bold card-heading text-base">How it works</h2>
          </div>
          <div className="space-y-2">
            {[
              { step: "1", text: "Copy the Arduino code below into Arduino IDE" },
              { step: "2", text: "Fill in your WiFi name and password" },
              { step: "3", text: "Your API key and farm details are already filled in" },
              { step: "4", text: "Flash to your ESP32 — data appears on the dashboard" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-500">{step}</span>
                </div>
                <p className="text-sm card-body">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wiring guide */}
        <div className="glass-card rounded-[1.5rem] p-5 space-y-3">
          <h2 className="font-bold card-heading text-base flex items-center gap-2">
            <Wifi className="h-5 w-5 text-emerald-500" /> Sensor Wiring
          </h2>
          <div className="space-y-2">
            {[
              { sensor: "pH Sensor (analog out)", pin: "GPIO 34", color: "text-purple-500" },
              { sensor: "Soil Moisture (analog out)", pin: "GPIO 35", color: "text-emerald-500" },
              { sensor: "All sensors VCC", pin: "3.3V", color: "text-red-500" },
              { sensor: "All sensors GND", pin: "GND", color: "text-gray-400" },
            ].map(({ sensor, pin, color }) => (
              <div key={sensor} className="flex items-center justify-between py-2 border-b divider last:border-0">
                <span className="text-sm card-body">{sensor}</span>
                <span className={`text-sm font-bold ${color}`}>{pin}</span>
              </div>
            ))}
          </div>
          <p className="text-xs card-muted">You can change the pins in the code if needed</p>
        </div>

        {/* API Key */}
        <div className="glass-card rounded-[1.5rem] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold card-heading text-base flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" /> Your API Key
            </h2>
            <button
              onClick={() => regenerate.mutate()}
              disabled={regenerate.isPending || !farmId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 dark:text-red-400 transition-all hover:scale-[1.02]"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${regenerate.isPending ? "animate-spin" : ""}`} />
              Regenerate
            </button>
          </div>

          {keyLoading || !farmId ? (
            <div className="h-12 glass-tile rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl glass-tile font-mono text-sm card-value break-all">
                {showKey ? apiKey : maskedKey}
              </div>
              <button onClick={() => setShowKey(v => !v)} className="h-10 w-10 rounded-xl glass-tile flex items-center justify-center flex-shrink-0">
                {showKey ? <EyeOff className="h-4 w-4 card-muted" /> : <Eye className="h-4 w-4 card-muted" />}
              </button>
              <button onClick={() => copyText(apiKey, "API key")} className="h-10 w-10 rounded-xl glass-tile flex items-center justify-center flex-shrink-0">
                <Copy className="h-4 w-4 text-blue-500" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 px-4 py-3 rounded-xl glass-tile text-center">
              <p className="text-xs card-muted mb-1">Farm ID</p>
              <p className="font-bold card-value text-lg">{farmId || "—"}</p>
            </div>
            <div className="flex-1 px-4 py-3 rounded-xl glass-tile text-center">
              <p className="text-xs card-muted mb-1">Field ID</p>
              <p className="font-bold card-value text-lg">{fieldId || "—"}</p>
            </div>
          </div>
          <p className="text-xs card-muted text-center">Keep your API key secret — it gives write access to your farm data</p>
        </div>

        {/* Arduino code */}
        <div className="glass-card rounded-[1.5rem] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold card-heading text-base">Arduino Code</h2>
            <button
              onClick={() => copyText(code, "Arduino code")}
              disabled={!code}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
              style={{
                background: copied ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.12)",
                border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.25)"}`,
                color: copied ? "#22c55e" : "#3b82f6",
              }}
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy all"}
            </button>
          </div>

          {!code ? (
            <div className="rounded-xl glass-tile p-4 text-sm card-muted text-center">
              {!farmId ? "No farm found. Create a farm first from the dashboard." :
               !fieldId ? "No field found. Add a field to your farm first." :
               "Loading..."}
            </div>
          ) : (
            <div className="relative">
              <pre className="rounded-xl overflow-x-auto text-xs leading-relaxed p-4 font-mono card-value"
                style={{ background: "rgba(0,0,0,0.25)", maxHeight: "420px", overflowY: "auto" }}>
                {code}
              </pre>
            </div>
          )}

          <div className="rounded-xl p-4 space-y-1" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p className="text-xs font-bold text-blue-500">Required Arduino libraries</p>
            <p className="text-xs card-muted">Install these via <strong>Sketch → Include Library → Manage Libraries</strong></p>
            {["WiFi (built-in for ESP32)", "HTTPClient (built-in for ESP32)", "ArduinoJson by Benoit Blanchon"].map(lib => (
              <div key={lib} className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-blue-400" />
                <span className="text-xs card-body">{lib}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test endpoint */}
        <div className="glass-card rounded-[1.5rem] p-5 space-y-2">
          <h2 className="font-bold card-heading text-base">API Endpoint</h2>
          <p className="text-xs card-muted">The ESP32 sends a POST request to:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 rounded-xl glass-tile font-mono text-xs card-value break-all">
              {DOMAIN}/api/esp32/sensor-data
            </div>
            <button onClick={() => copyText(`${DOMAIN}/api/esp32/sensor-data`, "Endpoint URL")} className="h-10 w-10 rounded-xl glass-tile flex items-center justify-center flex-shrink-0">
              <Copy className="h-4 w-4 text-blue-500" />
            </button>
          </div>
          <p className="text-xs card-muted">JSON body fields: <code className="text-blue-400">apiKey, farmId, fieldId, ph, soilMoisture</code></p>
        </div>

      </main>

      <BottomNavigation />
    </PageShell>
  );
}
