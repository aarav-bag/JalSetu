---
name: JalSetu hardware scope
description: Confirmed board separation and safety limits for JalSetu sensor and irrigation firmware.
---

The non-camera ESP32 handles TDS, two soil-moisture probes, and the REL_35-style 3.3 V water-level sensor. The ESP32-S3 camera board is separate and camera/streaming functionality is out of the current sensor firmware scope. A physical pH sensor is not installed, so firmware and UI must not simulate or present pH as live. Water-level output must remain raw until dry/full calibration is completed.

Do not energize pump relays or run automatic irrigation until relay trigger polarity, pump power wiring, level thresholds, and independent low-water protection are verified. The current small 3–9 V pump is a prototype, not the final field irrigation pump.

**Why:** The actual parts discussed include two different ESP32 boards, a conductive level sensor, relays, and a small demonstration pump. Treating the camera or pump as part of the sensor firmware, or inventing sensor values, would create misleading readings or unsafe switching.

**How to apply:** Keep firmware sensor telemetry separate from camera code. Ask for pin labels/calibration and verify relay/pump safety before adding actuator behavior.