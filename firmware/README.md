# JalSetu ESP32 Firmware

## Setup (first time)

1. Install **Arduino IDE** and add the ESP32 board package
2. Install these libraries via **Sketch → Include Library → Manage Libraries**:
   - `WiFiManager` by tzapu
   - `ArduinoJson` by bblanchon
3. Open `JalSetu_ESP32/JalSetu_ESP32.ino`
4. Select your board: **Tools → Board → ESP32 Dev Module**
5. Flash the code

## Configuring WiFi (no laptop needed after first flash)

On first boot — or whenever you hold the BOOT button for 3 seconds — the ESP32 creates a hotspot:

| Setting | Value |
|---|---|
| Network name | `JalSetu-Setup` |
| Password | *(none)* |
| Config page | `192.168.4.1` |

**Steps:**
1. Power on the ESP32 — LED will be off (not yet connected)
2. On your phone, connect to the `JalSetu-Setup` WiFi
3. A setup page opens automatically (or open a browser to `192.168.4.1`)
4. Tap **Configure WiFi** → select your network → enter password → **Save**
5. ESP32 reboots, connects, LED turns solid ON — done ✅

Credentials are saved to flash. The ESP32 will reconnect automatically on every reboot without needing the portal again.

## Changing WiFi (new location)

Hold the **BOOT button** (GPIO 0) for **3 seconds** while the ESP32 is running.  
The LED blinks fast → credentials wiped → hotspot reopens → follow steps 2–5 above.

## Pin Map

| Pin | Purpose |
|-----|---------|
| GPIO 34 | TDS sensor analog output |
| GPIO 32 | Soil moisture — Field 1 |
| GPIO 36 | Soil moisture — Field 2 (VP pin) |
| GPIO 35 | Water-level sensor analog output (raw ADC only; calibrate dry/full before percentage or pump logic) |
| GPIO 2  | Onboard LED (status indicator) |
| GPIO 0  | BOOT button — hold 3 s to reset WiFi |

This firmware is for the sensor/pump-control ESP32, not the separate camera board. It currently reads TDS, both soil probes, and raw water-level ADC. It does not send pH (no physical pH probe is connected), and it does not operate a pump or relay.

Connect the water-level module's `AO`/analog output only if that exact pin is present on your board. Power the module from 3.3 V and connect grounds together. Check the output voltage before connecting it to GPIO 35; never let an ESP32 ADC input exceed 3.3 V. Water-level values are sent as raw ADC counts until dry and full readings are calibrated.

## LED meanings

| LED state | Meaning |
|-----------|---------|
| Off | Connecting / portal open |
| Fast blink (6×) | Wiping WiFi credentials |
| 3 short blinks | Sending data to server |
| Solid ON | Connected, idle, all good |
