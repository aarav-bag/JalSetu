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
| GPIO 2  | Onboard LED (status indicator) |
| GPIO 0  | BOOT button — hold 3 s to reset WiFi |

This firmware is for the sensor/pump-control ESP32, not the separate camera board. It reads TDS and both soil probes. Water-level and pH sensors are not included. It supports app-to-ESP32 pump commands; relay outputs initialize OFF.

## Sensor wiring

| Sensor/module | ESP32 connection |
|---|---|
| TDS board `AO` / `OUT` | GPIO 34 |
| Soil probe for Field 1 `AO` | GPIO 32 |
| Soil probe for Field 2 `AO` | GPIO 36 / VP |
| Each sensor `GND` | ESP32 GND (shared ground) |
| Each sensor `VCC` | Power the module at its rated voltage; ensure every analog output stays at or below 3.3 V |

GPIO 34 and GPIO 36 are input-only ADC pins, which is suitable for these analog sensor outputs. GPIO 35 is unused now that water-level sensing has been removed. No pH sensor is connected.

## Two-pump relay setup

The Irrigation page in the app has a two-pump wiring tutorial and separate Field 1 / Field 2 manual and automatic controls. The relay-contact wiring for each pump is:

```text
regulated 5V pump supply + -> inline fuse -> relay COM
relay NO -> pump +
pump - -> regulated 5V pump supply -
relay NC -> unused
```

The pictured pumps are labeled **5V DC**. Do not connect a 9V battery directly to them or to the relay board's `VCC`. No series resistor is needed. Size the regulated supply and branch fuses for the actual pump startup current; it is not available from the pump label.

Control wiring for the current firmware:

| ESP32 / relay pin | Connection |
|---|---|
| GPIO 25 | Field 1 relay `IN` |
| GPIO 26 | Field 2 relay `IN` |
| Regulated 5V | Relay module `VCC` |
| ESP32 GND | Relay module `GND` when required by that module's control-input design |

The current firmware is configured for GPIO 25 and 26 with active-low relay inputs (`PUMP_RELAY_ACTIVE_LOW true`), based on the user's hardware commissioning confirmation. `PUMP_OUTPUTS_ARMED` is enabled. Outputs initialize to OFF; the ESP32 only applies a pump target received from the authenticated server. Keep the app's per-field commissioning checks complete and use the saved maximum run time. If relay modules, pin mapping, trigger level, pump supply, or low-water protection change, turn the outputs off and re-verify before use.

Automatic mode uses each field's latest soil reading and today's Open-Meteo rain probability:

- Start below 35% soil moisture only when rain chance is below 50%.
- Skip/stop if rain chance is 50% or higher.
- Stop at 60% soil moisture.
- Missing/stale soil data or an unavailable rain forecast fails closed and keeps the pump off.
- Every run uses its configured maximum duration; the ESP32 also stops on server loss and at the firmware hard cap.
- Manual app control is per field and does not bypass the run-time or physical low-water safeguards.

Choose the farm location in the app so its coordinates can be saved for the server's weather check. The backend stores pump mode per field, and the ESP32 polls target states every five seconds and reports actual relay state.

## LED meanings

| LED state | Meaning |
|-----------|---------|
| Off | Connecting / portal open |
| Fast blink (6×) | Wiping WiFi credentials |
| 3 short blinks | Sending data to server |
| Solid ON | Connected, idle, all good |
