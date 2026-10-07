---
name: JalSetu hardware scope
description: Confirmed board separation and safety limits for JalSetu sensor and irrigation firmware.
---

The non-camera ESP32 handles TDS, two soil-moisture probes, and the REL_35-style 3.3 V water-level sensor. The ESP32-S3 camera board is separate and camera/streaming functionality is out of the current sensor firmware scope. A physical pH sensor is not installed, so firmware and UI must not simulate or present pH as live. Water-level output must remain raw until dry/full calibration is completed. The user wants two separately controlled pumps for Field 1 and Field 2 through a two-relay module. Current prototype hardware reported by the user: two pumps labeled 5 V DC, two separate 5 V single-channel relay modules, and two 9 V rectangular batteries. A shared listing snippet said 9 V DC, so the physical pump label is the source to follow.

The user wants automatic irrigation to start for dry soil only when rain probability is not high, plus separate manual app control for both field pumps. Exact moisture/rain thresholds and manual override behavior are not confirmed.

Do not energize pump relays or run automatic irrigation until relay GPIOs and trigger polarity, pump power wiring, water-level thresholds, independent low-water protection, and safe run-time limits are verified. The current small 3–9 V pump is a prototype, not the final field irrigation pump.

**Why:** The user wants independent pump control for two fields, but the current firmware has no verified relay setup and the discussed pump is a small prototype. Treating the camera or pump as part of sensor telemetry, or inventing interlocks, could create misleading readings or unsafe switching.

**How to apply:** Keep firmware sensor telemetry separate from camera code. Confirm actual pump voltage/current and relay DC contact rating before wiring. Model pump state per field, but ask for pin labels/polarity and verify power, water-level calibration, low-water protection, and run-time limits before enabling relay actuation. Missing/stale weather must not authorize automatic starts; manual controls must not bypass physical safety limits.

**Why:** The user wants app-based manual control and rain-aware automatic irrigation, but the device still needs verified actuator wiring and independent safety behavior.