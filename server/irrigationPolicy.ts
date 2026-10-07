export type PumpMode = "off" | "manual" | "auto";

export const IRRIGATION_POLICY = {
  soilStartBelow: 35,
  soilStopAtOrAbove: 60,
  highRainChanceAt: 50,
  soilFreshForMs: 2 * 60 * 1000,
} as const;

export interface PumpDecisionInput {
  mode: PumpMode;
  manualOn: boolean;
  safetyReady: boolean;
  actualOn: boolean;
  soilMoisture: number | null;
  soilObservedAt: Date | null;
  rainChance: number | null;
  maxRunSeconds: number;
  actualUpdatedAt: Date | null;
  manualCommandAt: Date | null;
  cooldownUntil: Date | null;
  now?: Date;
}

export interface PumpDecision {
  desiredOn: boolean;
  reason: string;
}

export function decidePumpTarget(input: PumpDecisionInput): PumpDecision {
  const now = input.now ?? new Date();

  if (!input.safetyReady) {
    return { desiredOn: false, reason: "Pump safety commissioning is incomplete" };
  }

  if (input.cooldownUntil && input.cooldownUntil.getTime() > now.getTime()) {
    return { desiredOn: false, reason: "Pump is in its post-run safety cooldown" };
  }

  const maxRunMs = Math.max(5, Math.min(600, input.maxRunSeconds)) * 1000;
  if (
    input.actualOn
    && input.actualUpdatedAt
    && now.getTime() - input.actualUpdatedAt.getTime() >= maxRunMs
  ) {
    return { desiredOn: false, reason: "Maximum run time reached" };
  }

  if (input.mode === "off") {
    return { desiredOn: false, reason: "Pump is set to off" };
  }

  if (input.mode === "manual") {
    if (
      input.manualOn
      && !input.actualOn
      && input.manualCommandAt
      && now.getTime() - input.manualCommandAt.getTime() > 20_000
    ) {
      return { desiredOn: false, reason: "Manual start command expired before the device received it" };
    }
    return {
      desiredOn: input.manualOn,
      reason: input.manualOn ? "Manual app command" : "Manually stopped in app",
    };
  }

  if (
    input.soilMoisture === null
    || !Number.isFinite(input.soilMoisture)
    || !input.soilObservedAt
    || now.getTime() - input.soilObservedAt.getTime() > IRRIGATION_POLICY.soilFreshForMs
  ) {
    return { desiredOn: false, reason: "Soil reading is missing or stale" };
  }

  if (input.rainChance === null || !Number.isFinite(input.rainChance)) {
    return { desiredOn: false, reason: "Rain forecast unavailable; automatic start blocked" };
  }

  if (input.rainChance >= IRRIGATION_POLICY.highRainChanceAt) {
<<<<<<< HEAD
    return { desiredOn: false, reason: "Rain chance is high; automatic irrigation is paused" };
=======
    return { desiredOn: false, reason: "Rain chance is high; irrigation skipped" };
>>>>>>> d6ac647 (Update irrigation page and handoff documentation)
  }

  if (input.soilMoisture < IRRIGATION_POLICY.soilStartBelow) {
    return { desiredOn: true, reason: "Soil is dry and rain chance is low" };
  }

  if (input.soilMoisture >= IRRIGATION_POLICY.soilStopAtOrAbove) {
    return { desiredOn: false, reason: "Soil moisture reached the stop threshold" };
  }

  return {
    desiredOn: input.actualOn,
<<<<<<< HEAD
    reason: input.actualOn
      ? "Maintaining irrigation until the stop threshold"
      : "Soil moisture is between the start and stop thresholds",
=======
    reason: input.actualOn ? "Maintaining irrigation until the stop threshold" : "Soil does not need irrigation yet",
>>>>>>> d6ac647 (Update irrigation page and handoff documentation)
  };
}
