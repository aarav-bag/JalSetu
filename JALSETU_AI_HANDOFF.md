# JalSetu — Complete Project Handoff for Another AI

## 0. What this document is

This is a technical and product handoff for the JalSetu project. It is written so another AI coding assistant can understand the project before making changes.

This document describes the current implementation, not only the planned future system. Planned features such as pump control, automatic valves, MQTT, and full autonomous irrigation are **not implemented yet**.

Do not copy or expose credentials while working on this project. The repository contains environment-variable references and the firmware currently contains a device authentication value; those values should be treated as secrets and rotated/moved to secure provisioning before production use.

---

## 1. Product identity and purpose

**Product name:** JalSetu  
**Meaning:** A smart water-management bridge for farms  
**Primary purpose:** Help farmers monitor water quality, soil moisture, weather, and irrigation recommendations from one mobile-friendly web dashboard.

JalSetu currently combines:

- An ESP32-based sensor device
- Soil-moisture monitoring for multiple fields
- Water-quality monitoring using TDS and pH data
- PostgreSQL data persistence
- A React dashboard
- Weather forecasts from Open-Meteo
- Rule-based agricultural recommendations
- An AI farming chatbot with a local fallback
- Real-time-style polling for alerts
- Persistent alert history for triggered and resolved conditions

The current application is primarily a **monitoring and decision-support product**. It does not yet directly operate pumps, valves, relays, servos, or irrigation equipment.

---

## 2. Repository and Git information

### Repository

- GitHub repository: `https://github.com/aarav-bag/JalSetu.git`
- Main branch: `main`
- Current project is a monorepo containing frontend, backend, shared database types, and ESP32 firmware.

### Important Git behavior

- Changes are committed to Git locally and pushed to `origin/main`.
- The GitHub remote may report that the repository URL has moved to a capitalized/new canonical path, but pushes currently work.
- Do not rewrite history or force-push unless the user explicitly requests it.
- Before changes, inspect the latest branch and recent commits; older summaries may be stale.

### Recent implementation milestones

The current branch includes:

1. ESP32 Wi-FiManager setup flow
2. Real sensor data replacing fake dashboard readings
3. Soil-moisture details API and history
4. ESP32 field-index-to-database-field mapping fix
5. Home-screen removal of fake Field 2 values
6. Real-time generated alert conditions
7. Alert pop-up notifications outside the Alerts tab
8. Persistent database-backed alert history

---

## 3. High-level architecture

```text
ESP32 + analog sensors
        |
        | HTTPS JSON POST every 30 seconds
        v
Express + TypeScript backend
        |
        | Drizzle ORM
        v
PostgreSQL database
        |
        | authenticated REST APIs
        v
React + TypeScript + Vite frontend
        |
        +--> dashboard
        +--> charts/reports
        +--> alerts and toast notifications
        +--> chatbot
        +--> settings/onboarding
```

### Technology stack

#### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Wouter for routing
- TanStack Query for server state and polling
- Radix UI/shadcn-style components
- Lucide React icons
- Framer Motion for transitions and onboarding animations
- Recharts for charts

#### Backend

- Node.js 20
- Express 4
- TypeScript
- `tsx` for development execution
- esbuild for production server bundling
- Passport.js and `express-session`
- Local username/password authentication with bcrypt for normal users
- Optional Google OAuth when Google credentials are configured

#### Database

- PostgreSQL
- `pg` driver
- Drizzle ORM
- Shared schema in `shared/schema.ts`
- Startup database initialization in `server/db-init.ts`
- Drizzle push command available as `npm run db:push`

#### External services

- Open-Meteo for weather forecasts and geocoding; no API key required
- Groq-compatible OpenAI SDK client for the agricultural chatbot
- PostgreSQL/Neon-compatible database through `DATABASE_URL`
- Render deployment URL used by the current ESP32 firmware

---

## 4. Project structure

```text
/
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── firmware/
│   ├── README.md
│   └── JalSetu_ESP32/
│       └── JalSetu_ESP32.ino
├── server/
│   ├── auth.ts
│   ├── chatbot.ts
│   ├── db-init.ts
│   ├── db.ts
│   ├── index.ts
│   ├── localChatbot.ts
│   ├── recommendations.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── vite.ts
│   └── weather.ts
├── shared/
│   └── schema.ts
├── attached_assets/
├── package.json
├── package-lock.json
├── drizzle.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── .replit
├── render-build.sh
├── render-deploy.sh
└── JALSETU_AI_HANDOFF.md
```

### Important conventions

- API calls from the frontend use relative paths such as `/api/user-dashboard`.
- `client/src/lib/queryClient.ts` includes session credentials on requests.
- TanStack Query is configured with no global refetch interval, so features that need polling explicitly set `refetchInterval`.
- The backend and frontend are served together in development through the Express/Vite integration.
- The Replit preview uses port `5000`.

---

## 5. Frontend product experience

### Routes

The frontend uses Wouter routes:

```text
/                       Home dashboard
/login                  Login
/register               Registration
/reports                Reports dashboard
/alerts                 Active alerts and alert history
/settings               Settings
/edit-profile           Profile editing
/help-chatbot           Agricultural chatbot
/water-quality/:id      Water quality details
/soil-moisture/:id      Soil moisture details
/water-prediction/:id   Weather/water-prediction details
/irrigation-tips/:id    Irrigation tips details
/report-details/:type   Report detail route
```

Protected pages are wrapped by `ProtectedRoute` in `client/src/App.tsx`.

### Home dashboard

`client/src/pages/Home.tsx` loads `/api/user-dashboard` and renders:

- ESP32 online/offline badge
- Welcome/farm-status card
- Water quality card
- Soil moisture card
- Weather prediction card
- AI/rule-based recommendations card
- Smart irrigation tip card
- Bottom navigation

The ESP32 setup overlay appears on login/session setup, followed by the onboarding tour when appropriate.

### Water quality card

`client/src/components/WaterQualityCard.tsx` displays live database data:

- pH level
- TDS in ppm
- Overall water-quality assessment

If there is no real water-quality data, it shows a “No readings yet” state instead of fake sensor values.

### Soil moisture card

`client/src/components/SoilMoistureCard.tsx` displays:

- Average moisture percentage
- Overall status
- A circular gauge
- Per-field pills
- A progress bar

Important behavior:

- The backend supplies `hasReading` per field.
- A missing reading is not the same as a real 0% reading.
- The component hides fields that have never reported.
- A real 0% reading is allowed to appear as critically dry.

### Soil moisture details

`client/src/pages/SoilMoistureDetails.tsx` queries:

```text
GET /api/farm/:id/soil-moisture
```

It shows:

- Current average moisture
- Per-field readings
- Empty state when no data exists
- Historical daily averages
- Field analysis
- Data-based irrigation recommendations

There should be no hardcoded 68%, 70%, 45%, or fake historical readings in this page. If another AI modifies it, preserve the `null`/`hasReading` distinction.

### Alerts

`client/src/pages/Alerts.tsx` displays:

- Active, currently unresolved sensor alerts
- Danger/warning/info counts
- Dismiss buttons
- Clear-all action
- Refresh action
- Last-updated timestamp
- Collapsible resolved-alert history
- Triggered and resolved timestamps

`client/src/hooks/useAlerts.ts`:

- Queries `/api/my-alerts`
- Polls every 30 seconds
- Keeps client-side dismissals in localStorage per user
- Separates active alerts from resolved database history

`client/src/components/AlertNotificationManager.tsx` is mounted globally in `App.tsx`:

- Polls the same alert endpoint
- Does not show a toast while the user is already on `/alerts`
- Shows a toast when a new active alert appears elsewhere in the app
- Uses sessionStorage to avoid repeating the same toast during one browser session

`BottomNavigation.tsx` queries the same endpoint and displays an alert badge.

### Reports

`client/src/pages/Reports.tsx` currently uses static in-component chart arrays for:

- Water usage
- Soil health
- Seasonal analytics

This page is visually implemented but its chart values are currently demonstration/static data. It is not yet a true database-backed analytics system.

### Settings

Settings currently supports:

- Profile navigation
- Language selection
- Farm location selection
- Dark/light theme
- Animation preference
- Push-notification preference UI
- Farm Metrics Guide replay
- Help chatbot navigation
- Logout

The notification switch is currently a UI preference state and should be connected to the global alert manager before being treated as a real notification permission setting.

### Onboarding and ESP32 setup

#### Onboarding tour

Files:

- `client/src/components/OnboardingTour.tsx`
- `client/src/hooks/useOnboarding.ts`

The tour is a six-step farmer-friendly explanation of:

- pH
- TDS
- soil moisture
- weather
- recommendations
- overall dashboard use

It uses localStorage keyed by user ID and can be replayed from Settings.

#### ESP32 setup screen

Files:

- `client/src/components/Esp32SetupScreen.tsx`
- `client/src/hooks/useEsp32Setup.ts`

Phases:

1. Waiting for ESP32
2. Connected animation
3. Sensor verification

It polls `/api/esp32/status` approximately every three seconds during setup and uses sessionStorage so the setup flow can repeat per login session.

---

## 6. Database model

The canonical TypeScript schema is in `shared/schema.ts`. Startup table creation is in `server/db-init.ts`.

### `users`

```text
id
username
password
first_name
last_name
email
created_at
```

### `farms`

```text
id
name
location
user_id -> users.id
status
esp32_api_key
created_at
```

### `fields`

```text
id
name
farm_id -> farms.id
created_at
```

Fields are the logical farm subdivisions used for soil moisture readings.

### `water_qualities`

```text
id
farm_id -> farms.id
ph_level
tds
temperature
created_at
```

Values are stored as text because the current ingestion layer stores formatted values such as `"450 ppm"` and `"7.2"`.

### `soil_moistures`

```text
id
farm_id -> farms.id
field_id -> fields.id
moisture_level
status
created_at
```

`status` is currently derived at ingestion:

```text
60–100 => optimal
35–59  => warning
0–34   => danger
```

### `weather_predictions`

```text
id
farm_id
message
advice
forecast JSONB
created_at
```

### `irrigation_tips`

```text
id
farm_id
tip
created_at
```

### `farm_alerts`

Added for persistent alert history:

```text
id
farm_id -> farms.id
alert_key
title
message
type
is_resolved
created_at
resolved_at
```

Alert lifecycle:

```text
condition appears
  -> insert new farm_alerts row with is_resolved=false

condition remains active
  -> reuse the existing open alert key

condition disappears
  -> set is_resolved=true and resolved_at

condition appears again later
  -> create a new history row
```

### Current database initialization behavior

`server/db-init.ts` creates tables with `CREATE TABLE IF NOT EXISTS` on server startup. It also seeds or repairs the demo farm/field setup.

This is convenient for the current project, but a production migration system should eventually replace ad-hoc startup schema changes.

---

## 7. Backend API map

All authenticated user routes rely on the session cookie unless stated otherwise.

### Authentication

```text
POST /api/register
POST /api/login
POST /api/logout
GET  /api/user
GET  /api/auth/google
GET  /api/auth/google/callback
```

Authentication implementation:

- Passport local strategy
- bcrypt password comparison
- express-session
- optional Google OAuth
- `isAuthenticated` middleware

There is also a development/demo login path in the source. Do not place demo credentials into public documentation.

### Farm and field routes

```text
POST  /api/farms
GET   /api/farms/:id
PATCH /api/farms/:id
GET   /api/my-farms
POST  /api/fields
GET   /api/farms/:farmId/fields
```

Ownership checks are used on authenticated farm/field routes.

### Sensor data routes

```text
GET  /api/farm-data/:farmId
GET  /api/user-dashboard
GET  /api/farm/:id/soil-moisture
GET  /api/farm/:id/water-quality
POST /api/esp32/sensor-data
GET  /api/esp32/status
```

### Other routes

```text
POST /api/water-qualities
POST /api/soil-moistures
POST /api/weather-predictions
POST /api/irrigation-tips
GET  /api/farm/:farmId/water-prediction
GET  /api/weather
GET  /api/geocode
GET  /api/farm/:farmId/recommendations
GET  /api/my-alerts
POST /api/chat
POST /api/chat/local
POST /api/seed-database
```

### `GET /api/user-dashboard`

This is the main home-page data endpoint. It combines:

- Farmer/user summary
- Farm summary
- Latest water quality
- Latest soil moisture per field
- Weather prediction
- Latest irrigation tip

The storage layer fetches the latest soil-moisture reading separately for each field.

### `GET /api/farm/:id/soil-moisture`

Returns:

```text
{
  level: number | null,
  status: string,
  fields: [
    {
      id,
      name,
      value: number | null,
      status,
      hasReading
    }
  ],
  history: [
    {
      date,
      average,
      fieldAvgs
    }
  ],
  fieldNames,
  hasAnyData
}
```

The route verifies the farm exists and belongs to the authenticated user.

### `GET /api/my-alerts`

This endpoint:

1. Finds the authenticated user's first farm.
2. Reads current dashboard data.
3. Generates alert conditions from live pH, TDS, and soil values.
4. Persists newly triggered conditions into `farm_alerts`.
5. Resolves database alerts whose conditions are no longer active.
6. Returns active alerts plus resolved alert history.

Important implementation detail: this endpoint currently performs database writes during a GET request. It works for the current polling architecture, but a future production design could move alert evaluation into a scheduled worker or sensor-ingestion transaction.

### `POST /api/esp32/sensor-data`

Expected JSON shape:

```json
{
  "secret": "device-auth-value",
  "farmId": 1,
  "fieldId": 1,
  "tds": 450,
  "ph": 7.2,
  "soilMoisture": 72,
  "waterTemp": 27.5
}
```

The values are validated with Zod:

- `farmId`: positive integer
- `fieldId`: positive integer
- `tds`: optional, non-negative number
- `ph`: optional, 0–14
- `soilMoisture`: optional, 0–100
- `waterTemp`: optional number

The route is intentionally not session-authenticated because the ESP32 cannot use a browser session. It uses a device secret comparison instead.

When water-quality values exist, it inserts a water-quality row. When soil moisture exists, it inserts a soil-moisture row.

### ESP32 field mapping

The ESP32 sends sequential field numbers such as 1 and 2. Those are not assumed to be raw PostgreSQL IDs.

The server:

1. Loads all fields for the farm.
2. Sorts them by database ID.
3. Maps `fieldId: 1` to the first field.
4. Maps `fieldId: 2` to the second field.

This prevents auto-increment gaps from breaking Field 2 uploads.

---

## 8. ESP32 firmware and sensor modules

Firmware location:

```text
firmware/JalSetu_ESP32/JalSetu_ESP32.ino
```

The setup instructions are in:

```text
firmware/README.md
```

### Required Arduino libraries

- ESP32 board package
- WiFiManager by tzapu
- ArduinoJson by bblanchon
- HTTPClient from the ESP32 Arduino core

### Current pin map

| GPIO | Current purpose |
|---|---|
| 34 | TDS analog output |
| 32 | Soil moisture, Field 1 |
| 36 / VP | Soil moisture, Field 2 |
| 2 | Onboard status LED |
| 0 | BOOT button, Wi-Fi reset |

### Wi-Fi behavior

The firmware uses WiFiManager:

1. On first boot, it creates the `JalSetu-Setup` access point.
2. A phone connects to the access point.
3. The captive portal allows the farmer to choose a local Wi-Fi network and enter its password.
4. Credentials are stored in flash.
5. Future boots reconnect automatically.
6. Holding the BOOT button for three seconds clears saved Wi-Fi settings.

### TDS module

The TDS sensor is read from GPIO 34.

Current algorithm:

1. Take 30 analog samples.
2. Average them.
3. Convert ADC value to voltage using a 3.3V/12-bit assumption.
4. Apply a cubic approximation:

```text
tds = (133.42*v^3 - 255.86*v^2 + 857.39*v) * 0.5
```

5. Clamp negative values to zero.

Limitations:

- The code does not currently show temperature compensation in the TDS calculation.
- Real TDS modules require calibration against known solutions.
- The sensor should not be treated as laboratory-grade without calibration and proper probe conditioning.

### pH module

The current firmware does **not** read a physical pH sensor.

`readPH()` currently returns a random value selected from a neutral range around 7.0–7.5. This exists for demonstration and API/dashboard testing.

This is one of the most important facts for another AI:

> Any current pH number shown by the ESP32 path is simulated unless a physical pH probe and real calibration formula have been added separately.

To make pH real, the firmware needs:

- A pH probe and conditioning board
- Correct analog pin assignment
- Calibration using buffer solutions
- Temperature compensation if available
- Noise filtering
- Stable power and grounding
- A calibrated voltage-to-pH equation

### Soil-moisture modules

Two analog soil sensors are read:

- Field 1 on GPIO 32
- Field 2 on GPIO 36

Each reading averages 10 analog samples. The firmware converts raw ADC values into percentage using separate dry/wet calibration endpoints:

```text
Field 1:
  dry = 4095
  wet = 500

Field 2:
  dry = 4095
  wet = 1100
```

The percentage is constrained between 0 and 100.

Limitations:

- Calibration values are device/soil/sensor-specific.
- Resistive probes corrode and are less suitable for long-term deployment.
- Capacitive sensors are preferable for field use.
- A single field sensor may not represent an entire field.
- Moisture percentage is a calibrated relative scale, not a universal volumetric water-content measurement.

### Upload cycle

Every 30 seconds:

1. Read TDS.
2. Read simulated pH.
3. Read Field 1 moisture.
4. Read Field 2 moisture.
5. POST one payload for Field 1.
6. POST one payload for Field 2.

Both field uploads currently carry the same TDS and pH readings, while soil moisture differs by field.

The firmware does not yet:

- Control a pump
- Control a valve
- Read tank level
- Read flow
- Receive commands from JalSetu
- Queue uploads while offline
- Use MQTT
- Update firmware over the air

### Device status

The server stores the latest ESP32 timestamp/data in memory for the setup screen and status badge. This in-memory status resets when the server restarts.

Database readings remain persistent; only the lightweight online status cache is volatile.

---

## 9. Weather integration

File:

```text
server/weather.ts
```

Provider:

- Open-Meteo
- No API key required

The service requests:

- Seven-day forecast
- Maximum and minimum temperature
- Precipitation sum
- Precipitation probability
- WMO weather code

The backend converts WMO codes into:

```text
sunny
partly-cloudy
cloudy
rainy
```

The user can choose a farm location through the frontend location picker. If coordinates are missing, the fallback location is New Delhi, India.

Weather is used for:

- Dashboard forecast cards
- Water-prediction details
- Recommendation generation
- Rain-related irrigation advice

---

## 10. Recommendation engine

File:

```text
server/recommendations.ts
```

The current recommendation engine is deterministic and free; it does not require an AI API key.

Inputs include:

- pH
- TDS
- water temperature
- average soil moisture
- per-field moisture/status
- rain probability
- forecast temperature
- weather condition
- current hour

Recommendation categories:

- water-quality
- soil
- weather
- irrigation
- pest
- nutrient

Each recommendation contains:

```text
id
priority: high | medium | low
category
title
description
action
icon
metric
confidence
```

Rules include:

- Acidic/alkaline pH
- Low/moderate/high TDS
- Hot irrigation water
- Critical soil dryness
- Low soil moisture
- Optimal soil moisture
- Saturated/flooded soil
- Per-field emergency watering
- Heavy rain
- Dry weather
- Heat wave
- Avoiding midday irrigation

The word `confidence` is currently a rule-defined estimate, not a machine-learned probability.

---

## 11. Chatbot and AI behavior

### Main chatbot

File:

```text
server/chatbot.ts
```

The main chatbot uses an OpenAI-compatible client configured for Groq. The API key is read from an environment secret and must not be committed or displayed.

Current model call:

- Agricultural system prompt
- User conversation history
- Current user message
- Temperature around 0.7
- Maximum response length around 800 tokens

The prompt focuses the assistant on:

- Irrigation
- Soil moisture
- pH/TDS/temperature
- Weather and water conservation
- Crop-specific watering

### Local fallback chatbot

File:

```text
server/localChatbot.ts
```

The local chatbot uses keyword matching and a built-in knowledge base covering:

- Irrigation
- Soil moisture
- Water quality
- Crop-specific advice
- Conservation
- Weather

The fallback is useful when the AI provider is unavailable, rate limited, or misconfigured.

Important limitation:

The current chatbot does not automatically receive the user's live sensor readings in its prompt. A future version should add farm context securely and clearly label measured data versus general agricultural advice.

---

## 12. Alert system

### Live alert conditions

Current alert generation is in `server/routes.ts`.

Water quality:

```text
pH < 6.0      danger
pH > 9.0      danger
6.0–6.5       warning
8.5–9.0       warning
TDS > 1000    danger
TDS > 500     warning
```

Soil moisture:

```text
< 35%         danger
35–59%        warning
60% or more   no soil alert
```

No-data conditions generate informational alerts telling the user to connect the ESP32.

### Alert persistence

The alert key is deterministic, such as:

```text
ph-danger-low
tds-warning
soil-field-<field-id>-danger
```

As long as the condition stays active, the same open database alert is reused. When the condition clears, it is resolved. If the condition later returns, a new history row is created.

### Client dismissal versus resolution

These are different:

- **Dismiss:** client-side hiding using localStorage. It does not resolve the physical condition in the database.
- **Resolve:** backend detects that the sensor condition has cleared and records `resolved_at`.

If another AI changes alert behavior, preserve that distinction.

---

## 13. Authentication and security

Authentication is session-based.

Relevant file:

```text
server/auth.ts
```

Current mechanisms:

- express-session
- Passport local strategy
- bcrypt password verification
- optional Google OAuth
- authenticated route middleware
- farm ownership checks on sensitive farm routes

Security issues and production recommendations:

1. The ESP32 device authentication value is currently embedded in firmware. Firmware binaries can be inspected, so production devices should use per-device credentials or signed requests.
2. Device secrets should come from secure provisioning and should be rotatable.
3. Do not use a development fallback session secret in production.
4. Add CSRF protection for state-changing browser routes.
5. Add rate limiting to login and ESP32 ingestion.
6. Validate that the supplied `farmId` belongs to the device credential, not only that the credential is globally valid.
7. Consider HTTPS certificate validation behavior on the ESP32.
8. Replace demo/test authentication paths before public launch.
9. Avoid logging sensitive payload data in production.
10. `GET /api/my-alerts` currently performs writes; move this to a worker or idempotent event-processing path later.

Do not include actual secrets, passwords, session values, or API keys in handoff documents or AI prompts.

---

## 14. Deployment and runtime

### Replit development

The current Replit runtime uses:

```text
npm run dev
```

The Express server listens on:

```text
0.0.0.0:5000
```

Vite is integrated into the server in development.

### Production build

`package.json`:

```text
npm run build
  -> vite build
  -> esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

npm start
  -> NODE_ENV=production node dist/index.js
```

### Render

The current project has Render helper files:

- `render-build.sh`
- `render-deploy.sh`

The live backend URL currently referenced by the firmware is:

```text
https://jalsetu-rbeg.onrender.com
```

The backend requires at least:

- `DATABASE_URL`
- `SESSION_SECRET`

The chatbot requires its provider environment secret if the AI path is enabled.

### Deployment caveats

- `backend-deployment.json` and `frontend-deployment.json` are configuration examples and contain placeholder values.
- The current app is designed to serve frontend and backend together; splitting them requires correct API rewrites and CORS/session configuration.
- Render free-tier sleep/cold-start behavior can affect ESP32 HTTP uploads.
- The ESP32 currently does not queue failed uploads, so readings can be lost while the backend is sleeping or unavailable.

---

## 15. Current limitations and fake/demo data still present

This section is critical for another AI so it does not incorrectly claim the product is fully live.

### Firmware limitations

- pH is simulated, not physically measured.
- TDS requires calibration and has limited compensation.
- Soil sensors use fixed calibration constants.
- No actuator control exists.
- No pump or valve feedback exists.
- No offline queue exists.
- No device command channel exists.

### Frontend limitations

- Reports currently contain static demonstration chart arrays.
- Some UI fallback text still provides generic recommendations when data is absent.
- Settings notification switch is not yet connected to browser push permissions or alert-manager disablement.
- Alert notifications use in-app toast messages, not browser push notifications.
- Alert dismissals are local to the browser/user, not synchronized to the server.

### Backend limitations

- ESP32 online status is stored in memory and resets on restart.
- Alert evaluation is triggered by polling the alerts endpoint.
- The first farm is used for `/api/my-alerts` rather than allowing an explicit selected farm.
- The device credential is not per-device.
- Startup table creation is not a full migration workflow.
- The current pH/TDS/soil data model does not include sensor calibration metadata, units normalization, or sensor quality flags.

### Product limitations

JalSetu is not yet a complete irrigation automation controller. It currently monitors and recommends. It does not physically start pumps or open valves.

---

## 16. What a future full irrigation system would add

If extending this project, add these concepts rather than placing pump code directly inside the existing sensor upload route.

### Hardware

- Pump contactor or properly rated relay
- Normally-closed solenoid valve per irrigation zone
- Tank-level sensor
- Flow meter
- Pressure sensor
- Pump current/overload sensor
- Emergency-stop input
- Local manual override buttons
- Waterproof enclosure and electrical protection

### Database entities

```text
devices
irrigation_zones
actuators
irrigation_schedules
irrigation_rules
irrigation_runs
device_commands
device_command_acknowledgements
water_usage_readings
sensor_calibrations
```

### Device behavior

The ESP32 should enforce local safety even without internet:

- Maximum pump runtime
- Tank-low shutdown
- No-flow shutdown
- Over-flow/leak shutdown
- Emergency stop
- Safe valve state after reboot
- Watchdog reset
- Offline schedules

The cloud/server should handle:

- Remote commands
- Schedules
- History
- AI recommendations
- User permissions
- Reports

AI should recommend or optimize actions, but deterministic safety rules must be able to override AI.

---

## 17. Recommended development order

### Phase 1 — Make the current monitoring system trustworthy

1. Replace simulated pH with a calibrated physical pH sensor.
2. Calibrate TDS and soil sensors.
3. Add sensor timestamps and quality flags.
4. Remove remaining static report data.
5. Add automated tests around field mapping and alert thresholds.
6. Move secrets out of firmware source.

### Phase 2 — Add device management

1. Register ESP32 devices.
2. Use per-device credentials.
3. Store device heartbeat in PostgreSQL.
4. Show firmware version and sensor health.
5. Add offline upload retry/queueing.

### Phase 3 — Add one-zone actuator control

1. Add one low-power pump or a properly isolated pump controller.
2. Add one normally-closed valve.
3. Add manual start/stop with strict server and device limits.
4. Add flow confirmation.
5. Add emergency stop.
6. Store every irrigation run.

### Phase 4 — Add rule-based automation

Example rule:

```text
If Zone 2 moisture < 40%
and tank level > 25%
and rain probability < 50%
and current time is within an allowed window:
  irrigate Zone 2 for at most 10 minutes
  stop immediately if flow is zero
```

### Phase 5 — Add AI optimization

Use historical data to estimate:

- Water required per zone
- Moisture response after irrigation
- Drying rate
- Best irrigation time
- Leak and sensor anomalies

AI should produce an explanation and confidence, but not bypass physical safety rules.

---

## 18. How another AI should work on this repository

Before editing:

1. Read this document.
2. Check `replit.md`.
3. Inspect the latest Git state.
4. Search for the relevant route/component/schema before changing files.
5. Preserve the current React/Express/Drizzle structure.
6. Use relative API URLs for same-origin frontend requests.
7. Never hardcode secrets, passwords, database URLs, or device credentials.
8. Do not reintroduce fake sensor values as silent fallbacks.
9. Distinguish missing readings from valid zero readings.
10. Preserve farm ownership checks on authenticated data routes.

When adding a feature:

- Update the shared schema if data must be persisted.
- Update `server/db-init.ts` or the migration flow.
- Add storage interface and implementation methods.
- Add authenticated API routes with ownership checks.
- Add frontend query types and empty/loading/error states.
- Update firmware only when the device protocol changes.
- Update this handoff document if architecture changes.

When testing sensor features:

- Test no data.
- Test valid 0% moisture.
- Test multiple fields with non-sequential database IDs.
- Test invalid field indexes.
- Test sensor threshold boundaries.
- Test device/network failure.
- Test ownership/IDOR protection.
- Test alert creation, persistence, resolution, and re-triggering.

---

## 19. Fast context summary for an AI prompt

```text
JalSetu is a React 18 + TypeScript + Vite frontend with an Express + TypeScript backend, PostgreSQL/Drizzle storage, and ESP32 firmware. It is a smart farm water-management dashboard. The ESP32 currently reads two analog soil-moisture sensors and one TDS sensor, while pH is simulated in firmware. It uploads JSON over HTTPS every 30 seconds to /api/esp32/sensor-data. The server persists water-quality and soil-moisture readings and maps ESP32 field numbers as 1-based positions to actual database fields sorted by ID. The frontend uses TanStack Query and wouter. Home shows water quality, soil moisture, weather, recommendations, and irrigation tips. Alerts are generated from live sensor thresholds, persisted in farm_alerts, auto-resolved when conditions clear, displayed in /alerts, and shown as toast notifications outside that tab. Open-Meteo supplies weather. The recommendation engine is rule-based. The chatbot uses a Groq-compatible API with a local keyword-based fallback. The app currently monitors and recommends; it does not control pumps, valves, servos, or irrigation hardware. Avoid fake sensor fallbacks, preserve null versus zero semantics, preserve authentication/ownership checks, and never expose secrets.
```

---

## 20. Source-of-truth files

When details conflict, inspect these files in this order:

1. `shared/schema.ts` — current data types and database schema
2. `server/db-init.ts` — actual startup table creation
3. `server/storage.ts` — database behavior and dashboard aggregation
4. `server/routes.ts` — API contracts and authentication/ownership checks
5. `firmware/JalSetu_ESP32/JalSetu_ESP32.ino` — actual device behavior
6. `client/src/pages/Home.tsx` — dashboard composition
7. `client/src/hooks/useAlerts.ts` and `client/src/pages/Alerts.tsx` — alert behavior
8. `server/recommendations.ts` — recommendation rules
9. `server/weather.ts` — weather integration
10. `replit.md` — project-level collaboration context
