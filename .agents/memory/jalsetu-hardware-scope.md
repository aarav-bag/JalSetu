---
name: JalSetu hardware scope
description: Confirmed board separation and safety limits for JalSetu sensor and irrigation firmware.
---

The non-camera ESP32 handles TDS, two soil-moisture probes, and the REL_35-style 3.3 V water-level sensor. The ESP32-S3 camera board is separate and camera/streaming functionality is out of the current sensor firmware scope. A physical pH sensor is not installed, so firmware and UI must not simulate or present pH as live. Water-level output must remain raw until dry/full calibration is completed. The user wants two separately controlled pumps for Field 1 and Field 2 through a two-relay module. Current prototype hardware reported by the user: two pumps labeled 5 V DC, two separate 5 V single-channel relay modules, and two 9 V rectangular batteries. A shared listing snippet said 9 V DC, so the physical pump label is the source to follow. The user confirmed the contact wiring for each pump as supply positive → COM → NO → pump positive, pump negative → supply negative, with NC unused, and says this wiring operates.

The user wants automatic irrigation to start for dry soil only when rain probability is not high, plus separate manual app control for both field pumps. Current policy uses 35% start soil, 60% stop soil, and pauses at 50% rain probability. The user confirmed the hardware commissioning and calibration work is complete and asked to continue coding.

Do not energize pump relays or run automatic irrigation until relay GPIOs and trigger polarity, pump power wiring, water-level thresholds, independent low-water protection, and safe run-time limits are verified. The current small 3–9 V pump is a prototype, not the final field irrigation pump.

**Why:** The user confirmed the outstanding hardware setup and calibration are complete; continue implementation without repeating those confirmation requests. The confirmed COM/NO contact path alone does not establish safe supply voltage/current, ESP32 input mapping or polarity, or low-water protection, so revisit checks only if hardware changes.

**How to apply:** Keep firmware sensor telemetry separate from camera code. Model pump state per field and retain server authentication, fail-closed weather/soil rules, run-time limits, and physical safeguards. Missing/stale weather must not authorize automatic starts; manual controls must not bypass safety limits.

**Why:** The user wants app-based manual control and rain-aware automatic irrigation, but the device still needs verified actuator wiring and independent safety behavior.