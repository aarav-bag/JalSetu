export type PumpMode = "off" | "manual" | "auto";

export const IRRIGATION_POLICY = {
  soilStartBelow: 35,
  soilStopAtOrAbove: 60,
  soilFreshForMs: 2 * 60 * 1000,
  maxRunSeconds: 5,
} as const;

export interface PumpDecisionInput {
  mode: PumpMode;
  manualOn: boolean;
  actualOn: boolean;
  soilMoisture: number | null;
  soilObservedAt: Date | null;
  maxRunSeconds: number;
  actualUpdatedAt: Date | null;
  cooldownUntil: Date | null;
  now?: Date;
}

export interface PumpDecision {
  desiredOn: boolean;
  reason: string;
  autoBlocked: boolean;
}

export function decidePumpTarget(input: PumpDecisionInput): PumpDecision {
  const now = input.now ?? new Date();

  if (
    input.mode === "auto"
    && input.cooldownUntil
    && input.cooldownUntil.getTime() > now.getTime()
  ) {
    return {
      desiredOn: false,
      reason: "Pump is in its post-run safety cooldown",
      autoBlocked: true,
    };
  }

  const maxRunMs = Math.max(5, Math.min(IRRIGATION_POLICY.maxRunSeconds, input.maxRunSeconds)) * 1000;
  if (
    input.actualOn
    && input.actualUpdatedAt
    && now.getTime() - input.actualUpdatedAt.getTime() >= maxRunMs
  ) {
    return { desiredOn: false, reason: "Maximum run time reached", autoBlocked: false };
  }

  if (input.mode === "off") {
    return { desiredOn: false, reason: "Pump is set to off", autoBlocked: false };
  }

  if (input.mode === "manual") {
    return {
      desiredOn: input.manualOn,
      reason: input.manualOn ? "Manual app command" : "Manually stopped in app",
      autoBlocked: false,
    };
  }

  if (
    input.soilMoisture === null
    || !Number.isFinite(input.soilMoisture)
    || !input.soilObservedAt
    || now.getTime() - input.soilObservedAt.getTime() > IRRIGATION_POLICY.soilFreshForMs
  ) {
    return {
      desiredOn: false,
      reason: "Soil reading is missing or stale",
      autoBlocked: false,
    };
  }

  if (input.soilMoisture < IRRIGATION_POLICY.soilStartBelow) {
    return { desiredOn: true, reason: "Soil is dry", autoBlocked: false };
  }

  if (input.soilMoisture >= IRRIGATION_POLICY.soilStopAtOrAbove) {
    return {
      desiredOn: false,
      reason: "Soil moisture reached the stop threshold",
      autoBlocked: false,
    };
  }

  return {
    desiredOn: input.actualOn,
    reason: input.actualOn ? "Maintaining pump state between thresholds" : "Soil is between thresholds",
    autoBlocked: false,
  };
}
