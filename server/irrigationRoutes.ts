import type { Express, Request, Response } from "express";
import { z } from "zod";
import { pool } from "./db";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import { fetchRealWeather } from "./weather";
import { decidePumpTarget, IRRIGATION_POLICY } from "./irrigationPolicy";

type WeatherCacheEntry = { fetchedAt: number; rainChance: number };
const weatherCache = new Map<string, WeatherCacheEntry>();
const WEATHER_CACHE_MS = 10 * 60 * 1000;

const asyncHandler = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((error: unknown) => {
      console.error("Irrigation API error:", error);
      res.status(500).json({ error: "Irrigation request failed" });
    });
  };

async function getOwnedFarm(userId: number) {
  const farms = await storage.getFarmsByUserId(userId);
  return farms[0];
}

async function ensurePumpRows(farmId: number) {
  await pool.query(
    `INSERT INTO irrigation_pump_controls (field_id, farm_id)
     SELECT id, farm_id FROM fields WHERE farm_id = $1
     ON CONFLICT (field_id) DO NOTHING`,
    [farmId],
  );
}

async function getCurrentRainChance(lat: number | null, lon: number | null) {
  if (lat === null || lon === null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < WEATHER_CACHE_MS) return cached.rainChance;

  const weather = await fetchRealWeather(lat, lon);
  const rainChance = weather.forecast[0]?.rainChance;
  if (typeof rainChance !== "number" || !Number.isFinite(rainChance)) return null;
  weatherCache.set(key, { fetchedAt: Date.now(), rainChance });
  return rainChance;
}

export function registerIrrigationRoutes(
  app: Express,
  deviceSecret: string,
  isDeviceOnline: () => boolean,
) {
  app.post("/api/irrigation/location", isAuthenticated, asyncHandler(async (req, res) => {
    const schema = z.object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
    });
    const { lat, lon } = schema.parse(req.body);
    const farm = await getOwnedFarm(Number((req.user as any).id));
    if (!farm) return res.status(404).json({ error: "No farm found for this account" });

    await pool.query(
      "UPDATE farms SET latitude = $1, longitude = $2 WHERE id = $3 AND user_id = $4",
      [lat, lon, farm.id, Number((req.user as any).id)],
    );
    res.json({ saved: true });
  }));

  app.get("/api/irrigation/pumps", isAuthenticated, asyncHandler(async (req, res) => {
    const userId = Number((req.user as any).id);
    const farm = await getOwnedFarm(userId);
    if (!farm) return res.status(404).json({ error: "No farm found for this account" });
    await ensurePumpRows(farm.id);

    let rainChance: number | null = null;
    try {
      rainChance = await getCurrentRainChance(farm.latitude ?? null, farm.longitude ?? null);
    } catch {
      rainChance = null;
    }

    const { rows } = await pool.query(
      `SELECT f.id AS "fieldId", f.name AS "fieldName",
              c.mode, c.manual_on AS "manualOn",
              c.actual_on AS "actualOn",
              c.actual_updated_at AS "actualUpdatedAt",
              c.cooldown_until AS "cooldownUntil",
              sm.moisture_level AS "soilMoisture",
              sm.created_at AS "soilObservedAt"
       FROM fields f
       JOIN irrigation_pump_controls c ON c.field_id = f.id
       LEFT JOIN LATERAL (
         SELECT moisture_level, created_at
         FROM soil_moistures
         WHERE field_id = f.id
         ORDER BY created_at DESC
         LIMIT 1
       ) sm ON TRUE
       WHERE f.farm_id = $1
       ORDER BY f.id`,
      [farm.id],
    );

    res.json({
      farmId: farm.id,
      locationConfigured: farm.latitude !== null && farm.longitude !== null,
      pumps: rows.map((row) => {
        const soilMoisture = row.soilMoisture === null ? null : Number(row.soilMoisture);
        const decision = decidePumpTarget({
          mode: row.mode,
          manualOn: row.manualOn,
          actualOn: row.actualOn,
          soilMoisture,
          soilObservedAt: row.soilObservedAt ? new Date(row.soilObservedAt) : null,
          maxRunSeconds: IRRIGATION_POLICY.maxRunSeconds,
          actualUpdatedAt: row.actualUpdatedAt ? new Date(row.actualUpdatedAt) : null,
          cooldownUntil: row.cooldownUntil ? new Date(row.cooldownUntil) : null,
        });

        return {
          ...row,
          maxRunSeconds: IRRIGATION_POLICY.maxRunSeconds,
          soilMoisture,
          rainChance,
          desiredOn: decision.desiredOn,
          decisionReason: decision.reason,
          autoBlocked: decision.autoBlocked,
        };
      }),
    });
  }));

  app.patch("/api/irrigation/pumps/:fieldId", isAuthenticated, asyncHandler(async (req, res) => {
    const schema = z.object({
      mode: z.enum(["off", "manual", "auto"]),
      manualOn: z.boolean().optional(),
    });
    const values = schema.parse(req.body);
    const userId = Number((req.user as any).id);
    const farm = await getOwnedFarm(userId);
    if (!farm) return res.status(404).json({ error: "No farm found for this account" });

    const fieldId = Number(req.params.fieldId);
    const field = await storage.getField(fieldId);
    if (!field || field.farmId !== farm.id) return res.status(404).json({ error: "Field not found" });
    await ensurePumpRows(farm.id);

    if (values.mode === "manual" && values.manualOn === undefined) {
      return res.status(400).json({ error: "Manual mode requires manualOn" });
    }
    if (values.mode === "manual" && values.manualOn === true && !isDeviceOnline()) {
      return res.status(503).json({
        error: "Pump start was not sent because the ESP32 is offline. Reconnect the device and try again.",
      });
    }

    await pool.query(
      `UPDATE irrigation_pump_controls SET
         mode = $1,
         manual_on = $2,
         actual_on = CASE WHEN $1 = 'off' OR ($1 = 'manual' AND NOT $2) THEN FALSE ELSE actual_on END,
         updated_at = NOW()
       WHERE field_id = $3 AND farm_id = $4`,
      [values.mode, values.mode === "manual" ? values.manualOn === true : false, fieldId, farm.id],
    );
    res.json({ saved: true });
  }));

  app.get("/api/esp32/pump-targets", asyncHandler(async (req, res) => {
    if (req.header("x-jalsetu-device-secret") !== deviceSecret) {
      return res.status(401).json({ error: "Device authentication failed" });
    }
    const farmId = Number(req.query.farmId);
    if (!Number.isInteger(farmId) || farmId < 1) return res.status(400).json({ error: "Invalid farmId" });
    const farm = await storage.getFarm(farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });
    await ensurePumpRows(farm.id);

    const { rows } = await pool.query(
      `SELECT f.id AS "fieldId", c.mode, c.manual_on AS "manualOn",
              c.actual_on AS "actualOn",
              c.actual_updated_at AS "actualUpdatedAt",
              c.cooldown_until AS "cooldownUntil",
              sm.moisture_level AS "soilMoisture",
              sm.created_at AS "soilObservedAt"
       FROM fields f
       JOIN irrigation_pump_controls c ON c.field_id = f.id
       LEFT JOIN LATERAL (
         SELECT moisture_level, created_at
         FROM soil_moistures
         WHERE field_id = f.id
         ORDER BY created_at DESC
         LIMIT 1
       ) sm ON TRUE
       WHERE f.farm_id = $1
       ORDER BY f.id`,
      [farm.id],
    );

    const targets = rows.map((row, index: number) => {
      const decision = decidePumpTarget({
        mode: row.mode,
        manualOn: row.manualOn,
        actualOn: row.actualOn,
        soilMoisture: row.soilMoisture === null ? null : Number(row.soilMoisture),
        soilObservedAt: row.soilObservedAt ? new Date(row.soilObservedAt) : null,
        maxRunSeconds: IRRIGATION_POLICY.maxRunSeconds,
        actualUpdatedAt: row.actualUpdatedAt ? new Date(row.actualUpdatedAt) : null,
        cooldownUntil: row.cooldownUntil ? new Date(row.cooldownUntil) : null,
      });
      return {
        fieldIndex: index + 1,
        desiredOn: decision.desiredOn,
        reason: decision.reason,
        autoBlocked: decision.autoBlocked,
        maxRunSeconds: IRRIGATION_POLICY.maxRunSeconds,
        mode: row.mode as string,
      };
    });

    res.json({ farmId, targets, serverTime: new Date().toISOString() });
  }));

  app.post("/api/esp32/pump-status", asyncHandler(async (req, res) => {
    if (req.header("x-jalsetu-device-secret") !== deviceSecret) {
      return res.status(401).json({ error: "Device authentication failed" });
    }
    const schema = z.object({
      farmId: z.number().int().positive(),
      firmwareEnabled: z.boolean(),
      states: z.array(z.object({
        fieldIndex: z.number().int().positive(),
        actualOn: z.boolean(),
        runtimeExpired: z.boolean().optional(),
      })).max(8),
    });
    const data = schema.parse(req.body);
    const farm = await storage.getFarm(data.farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const farmFields = await storage.getFieldsByFarmId(farm.id);
    farmFields.sort((a, b) => a.id - b.id);
    for (const state of data.states) {
      const field = farmFields[state.fieldIndex - 1];
      if (!field) continue;
      await pool.query(
        `UPDATE irrigation_pump_controls SET
           firmware_enabled = $1,
           actual_updated_at = CASE WHEN actual_on IS DISTINCT FROM $2 THEN NOW() ELSE actual_updated_at END,
           actual_on = $2,
           cooldown_until = CASE WHEN $3 AND mode = 'auto' THEN NOW() + INTERVAL '10 minutes' ELSE cooldown_until END,
           mode = CASE WHEN $3 AND mode = 'manual' THEN 'off' ELSE mode END,
           manual_on = CASE WHEN $3 THEN FALSE ELSE manual_on END,
           updated_at = NOW()
         WHERE field_id = $4 AND farm_id = $5`,
        [data.firmwareEnabled, state.actualOn, state.runtimeExpired === true, field.id, farm.id],
      );
    }
    res.json({ saved: true });
  }));
}
