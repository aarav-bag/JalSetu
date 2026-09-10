---
name: Sensor data trust
description: Rules for keeping JalSetu sensor displays honest while hardware capabilities are incomplete.
---

JalSetu must not display simulated pH or seeded pH/TDS values as current sensor readings. pH remains unavailable until a physical pH sensor sends a payload; TDS may display only the latest real ESP32 measurement.

**Why:** The ESP32 firmware previously generated random neutral pH values and older seed/recommendation paths used plausible-looking demo readings, which made the dashboard appear connected when the physical sensor was not present.

**How to apply:** When adding sensor cards, API fallbacks, recommendations, or firmware payload fields, prefer an explicit no-reading state over a plausible default. Preserve historical readings separately from current-device status.