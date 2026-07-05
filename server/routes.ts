import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { z } from "zod";
import { insertUserSchema, insertFarmSchema, insertFieldSchema, insertWaterQualitySchema, insertSoilMoistureSchema, insertWeatherPredictionSchema, insertIrrigationTipSchema } from "@shared/schema";
import passport from "passport";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { handleChatRequest } from "./chatbot";
import { handleLocalChat } from "./localChatbot";
import { fetchRealWeather, fetchDefaultWeather } from "./weather";
import { generateRecommendations } from "./recommendations";

// Extend Express Session to include user property
declare module 'express-session' {
  interface SessionData {
    user?: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Middleware to handle errors
  const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => 
    (req: Request, res: Response) => {
      Promise.resolve(fn(req, res)).catch(err => {
        console.error("API Error:", err);
        res.status(500).json({ 
          error: err.message || "Internal Server Error",
        });
      });
    };

  // Test login endpoint for development (id=1 maps to seeded farm data)
  app.post("/api/test-login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'aarav' && password === '123456') {
      const testUser = {
        id: 1,
        username: 'aarav',
        firstName: 'Aarav',
        lastName: 'Dixit',
        email: 'aarav@jalsetu.app',
        createdAt: new Date().toISOString()
      };
      req.session.user = testUser;
      res.json({ user: testUser });
    } else {
      res.status(401).json({ message: "Invalid credentials. Use aarav/123456" });
    }
  });

  // Authentication routes
  app.post("/api/register", asyncHandler(async (req, res) => {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    
    // Create user with hashed password
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  }));
  
  app.post("/api/login", (req, res, next) => {
    const { username, password } = req.body || {};

    // Demo credentials — bypass Passport and DB entirely
    if (username === 'aarav' && password === '123456') {
      const demoUser = {
        id: 1,
        username: 'aarav',
        firstName: 'Aarav',
        lastName: 'Dixit',
        email: 'aarav@jalsetu.app',
        createdAt: new Date().toISOString(),
      };
      (req.session as any).user = demoUser;
      req.user = demoUser as any;
      return res.json({ user: demoUser });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Don't return password in response
        const { password: _pw, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });
  
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/user", (req, res) => {
    // Check for test user session first
    if (req.session?.user) {
      res.json(req.session.user);
    } else if (req.user) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      // Successful authentication, redirect home
      res.redirect("/");
    }
  );

  // Farm routes - protected with authentication
  app.post("/api/farms", isAuthenticated, asyncHandler(async (req, res) => {
    const farmData = insertFarmSchema.parse({
      ...req.body,
      userId: (req.user as any).id // Assign farm to current user
    });
    const farm = await storage.createFarm(farmData);
    res.status(201).json(farm);
  }));

  app.get("/api/farms/:id", isAuthenticated, asyncHandler(async (req, res) => {
    const farmId = parseInt(req.params.id);
    const farm = await storage.getFarm(farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    // Check if user owns this farm
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to view this farm" });
    }
    
    res.json(farm);
  }));

  app.patch("/api/farms/:id", isAuthenticated, asyncHandler(async (req, res) => {
    const farmId = parseInt(req.params.id);
    const farm = await storage.getFarm(farmId);
    
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    // Check if user owns this farm
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to update this farm" });
    }
    
    const farmData = insertFarmSchema.partial().parse(req.body);
    const updatedFarm = await storage.updateFarm(farmId, farmData);
    res.json(updatedFarm);
  }));
  
  // Get user's farms
  app.get("/api/my-farms", isAuthenticated, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const farms = await storage.getFarmsByUserId(userId);
    res.json(farms);
  }));

  // Field routes - protected with authentication
  app.post("/api/fields", isAuthenticated, asyncHandler(async (req, res) => {
    const fieldData = insertFieldSchema.parse(req.body);
    
    // Verify the user owns the farm
    const farm = await storage.getFarm(fieldData.farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to add fields to this farm" });
    }
    
    const field = await storage.createField(fieldData);
    res.status(201).json(field);
  }));

  app.get("/api/farms/:farmId/fields", isAuthenticated, asyncHandler(async (req, res) => {
    const farmId = parseInt(req.params.farmId);
    
    // Verify the user owns the farm
    const farm = await storage.getFarm(farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to view fields for this farm" });
    }
    
    const fields = await storage.getFieldsByFarmId(farmId);
    res.json(fields);
  }));

  // Water Quality routes - protected with authentication
  app.post("/api/water-qualities", isAuthenticated, asyncHandler(async (req, res) => {
    const qualityData = insertWaterQualitySchema.parse(req.body);
    
    // Verify the user owns the farm
    const farm = await storage.getFarm(qualityData.farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to add water quality data to this farm" });
    }
    
    const quality = await storage.createWaterQuality(qualityData);
    res.status(201).json(quality);
  }));

  // Soil Moisture routes - protected with authentication
  app.post("/api/soil-moistures", isAuthenticated, asyncHandler(async (req, res) => {
    const moistureData = insertSoilMoistureSchema.parse(req.body);
    
    // Verify the user owns the farm
    const farm = await storage.getFarm(moistureData.farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to add soil moisture data to this farm" });
    }
    
    const moisture = await storage.createSoilMoisture(moistureData);
    res.status(201).json(moisture);
  }));

  // Weather Prediction routes - protected with authentication
  app.post("/api/weather-predictions", isAuthenticated, asyncHandler(async (req, res) => {
    const predictionData = insertWeatherPredictionSchema.parse(req.body);
    
    // Verify the user owns the farm
    const farm = await storage.getFarm(predictionData.farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to add weather predictions to this farm" });
    }
    
    const prediction = await storage.createWeatherPrediction(predictionData);
    res.status(201).json(prediction);
  }));

  // Irrigation Tip routes - protected with authentication
  app.post("/api/irrigation-tips", isAuthenticated, asyncHandler(async (req, res) => {
    const tipData = insertIrrigationTipSchema.parse(req.body);
    
    // Verify the user owns the farm
    const farm = await storage.getFarm(tipData.farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    
    if (farm.userId !== (req.user as any).id) {
      return res.status(403).json({ error: "You don't have permission to add irrigation tips to this farm" });
    }
    
    const tip = await storage.createIrrigationTip(tipData);
    res.status(201).json(tip);
  }));

  // Dashboard data routes - protected with authentication
  app.get("/api/farm-data/:farmId", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const farmId = parseInt(req.params.farmId);
      
      // Check if farm exists in the database
      const farm = await storage.getFarm(farmId);
      
      if (!farm) {
        return res.status(404).json({ error: "Farm not found" });
      }
      
      // Verify the user owns the farm
      if (farm.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "You don't have permission to view this farm's data" });
      }
      
      // Get dashboard data from database
      const dashboardData = await storage.getFarmDashboardData(farmId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching farm data:", error);
      res.status(500).json({ message: "Failed to fetch farm data" });
    }
  }));
  
  // For first-time users who don't have farms yet, return their user info
  app.get("/api/user-dashboard", isAuthenticated, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const farms = await storage.getFarmsByUserId(userId);
    
    if (farms.length > 0) {
      // Redirect to the first farm's dashboard data
      const farmId = farms[0].id;
      const dashboardData = await storage.getFarmDashboardData(farmId);
      res.json(dashboardData);
    } else {
      // Return just the user info since they don't have farms yet
      res.json({
        farmer: {
          id: (req.user as any).id,
          name: (req.user as any).username,
        },
        needsSetup: true
      });
    }
  }));

  // Soil moisture data for details page
  app.get("/api/farm/:id/soil-moisture", isAuthenticated, asyncHandler(async (req, res) => {
    const farmId = parseInt(req.params.id);
    if (isNaN(farmId)) return res.status(400).json({ error: "Invalid farm id" });

    const farm = await storage.getFarm(farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });
    if (farm.userId !== (req.user as any).id) return res.status(403).json({ error: "Forbidden" });

    const [fields, rawHistory] = await Promise.all([
      storage.getFieldsByFarmId(farmId),
      storage.getSoilMoistureHistory(farmId, 100),
    ]);

    // Sort fields by id so position-based indexing matches ESP32 order
    fields.sort((a, b) => a.id - b.id);

    // Latest reading per field — use null (not 0) for missing readings so 0% is valid
    const fieldReadings = fields.map(field => {
      const latest = rawHistory.find(r => r.fieldId === field.id);
      return {
        id: field.id,
        name: field.name,
        // null = no reading ever; 0 = valid "critically dry" reading
        value: latest !== undefined ? latest.moistureLevel : null as number | null,
        status: latest?.status ?? "warning",
        hasReading: latest !== undefined,
      };
    });

    const readingsWithData = fieldReadings.filter(f => f.hasReading);
    const avgLevel = readingsWithData.length
      ? Math.round(readingsWithData.reduce((s, f) => s + (f.value as number), 0) / readingsWithData.length)
      : null;
    const overallStatus =
      avgLevel === null      ? "No Data"
      : avgLevel >= 60       ? "Ideal Moisture Level"
      : avgLevel >= 35       ? "Needs Attention"
      :                        "Critically Low";

    // Group history by calendar date → average per field per day (last 7 days)
    const byDate: Record<string, Record<number, number[]>> = {};
    for (const row of rawHistory) {
      const dateKey = new Date(row.createdAt!).toLocaleDateString("en-IN", {
        day: "numeric", month: "short"
      });
      if (!byDate[dateKey]) byDate[dateKey] = {};
      if (!byDate[dateKey][row.fieldId]) byDate[dateKey][row.fieldId] = [];
      byDate[dateKey][row.fieldId].push(row.moistureLevel);
    }
    const history = Object.entries(byDate)
      .slice(0, 7)
      .map(([date, fieldMap]) => {
        const fieldAvgs = fields.map(f => {
          const vals = fieldMap[f.id] ?? [];
          return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        });
        const defined = fieldAvgs.filter((v): v is number => v !== null);
        const avg = defined.length
          ? Math.round(defined.reduce((a, b) => a + b, 0) / defined.length)
          : 0;
        return { date, average: avg, fieldAvgs };
      });

    res.json({ level: avgLevel, status: overallStatus, fields: fieldReadings, history, fieldNames: fields.map(f => f.name), hasAnyData: readingsWithData.length > 0 });
  }));

  // ── Real-time alerts ────────────────────────────────────────────
  // Generate deterministic alert objects from live sensor readings.
  // IDs are stable (condition-based) so the client can track dismissals.
  function generateAlertsFromDashboard(dashboard: any): Array<{
    id: string; title: string; message: string;
    type: "info" | "warning" | "danger"; time: string;
  }> {
    type AlertItem = { id: string; title: string; message: string; type: "info" | "warning" | "danger"; time: string };
    const alerts: AlertItem[] = [];
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const wq: any[] = dashboard?.waterQuality ?? [];
    const sm: any  = dashboard?.soilMoisture;

    // ── Water Quality ──
    if (wq.length > 0) {
      const phEntry  = wq.find((m: any) => m.icon === "ph");
      const tdsEntry = wq.find((m: any) => m.icon === "tds");

      if (phEntry) {
        const ph = parseFloat(String(phEntry.value));
        if (!isNaN(ph)) {
          if (ph < 6.0)
            alerts.push({ id: "ph-danger-low",  title: "Critical pH — Too Acidic",    message: `Water pH is ${ph} — dangerously acidic. Do not irrigate until corrected.`, type: "danger",  time: timeStr });
          else if (ph > 9.0)
            alerts.push({ id: "ph-danger-high", title: "Critical pH — Too Alkaline",  message: `Water pH is ${ph} — dangerously alkaline. Do not irrigate until corrected.`, type: "danger", time: timeStr });
          else if (ph < 6.5)
            alerts.push({ id: "ph-warning-low", title: "pH Level Low",                message: `Water pH is ${ph} — slightly below the safe 6.5–8.5 range. Monitor closely.`, type: "warning", time: timeStr });
          else if (ph > 8.5)
            alerts.push({ id: "ph-warning-high",title: "pH Level High",               message: `Water pH is ${ph} — slightly above the safe 6.5–8.5 range. Monitor closely.`, type: "warning", time: timeStr });
        }
      }

      if (tdsEntry) {
        const tdsNum = parseFloat(String(tdsEntry.value).replace(/[^\d.]/g, ""));
        if (!isNaN(tdsNum)) {
          if (tdsNum > 1000)
            alerts.push({ id: "tds-danger",   title: "Critical TDS Level", message: `TDS is ${tdsNum} ppm — extremely high. Avoid irrigation until water quality improves.`, type: "danger",  time: timeStr });
          else if (tdsNum > 500)
            alerts.push({ id: "tds-warning",  title: "High TDS Level",     message: `TDS is ${tdsNum} ppm — above the safe 500 ppm limit. May affect crop health.`, type: "warning", time: timeStr });
        }
      }
    } else {
      alerts.push({ id: "wq-no-data", title: "No Water Quality Data", message: "No pH or TDS readings yet. Connect your ESP32 to start water quality monitoring.", type: "info", time: timeStr });
    }

    // ── Soil Moisture ──
    const hasAnySoilReading = sm?.fields?.some((f: any) => f.hasReading);
    if (!sm || !hasAnySoilReading) {
      alerts.push({ id: "soil-no-data", title: "No Soil Moisture Data", message: "No soil moisture readings yet. Connect your ESP32 to start field monitoring.", type: "info", time: timeStr });
    } else {
      for (const field of (sm.fields ?? [])) {
        if (!field.hasReading) continue;
        if (field.value < 35)
          alerts.push({ id: `soil-field-${field.id}-danger`,  title: `Critically Dry: ${field.name}`, message: `${field.name} is at ${field.value}% moisture — critically low. Irrigate immediately to prevent crop loss.`, type: "danger",  time: timeStr });
        else if (field.value < 60)
          alerts.push({ id: `soil-field-${field.id}-warning`, title: `Low Moisture: ${field.name}`,   message: `${field.name} is at ${field.value}% — below the optimal 60–80% range. Schedule irrigation soon.`, type: "warning", time: timeStr });
      }
    }

    return alerts;
  }

  // GET /api/my-alerts — authenticated, returns alerts for the user's first farm
  app.get("/api/my-alerts", isAuthenticated, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const farms  = await storage.getFarmsByUserId(userId);
    if (!farms.length) return res.json({ alerts: [], generatedAt: new Date().toISOString(), farmId: null });

    const farmId   = farms[0].id;
    const dashboard = await storage.getFarmDashboardData(farmId);
    const alerts   = generateAlertsFromDashboard(dashboard);

    res.json({ alerts, generatedAt: new Date().toISOString(), farmId });
  }));

  // Water quality history for details page
  app.get("/api/farm/:id/water-quality", isAuthenticated, asyncHandler(async (req, res) => {
    const farmId = parseInt(req.params.id);
    if (isNaN(farmId)) return res.status(400).json({ error: "Invalid farm id" });

    // Ownership check — prevent IDOR
    const farm = await storage.getFarm(farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });
    if (farm.userId !== (req.user as any).id) return res.status(403).json({ error: "Forbidden" });

    const [latest, history] = await Promise.all([
      storage.getLatestWaterQualityByFarmId(farmId),
      storage.getWaterQualityHistory(farmId, 10),
    ]);
    res.json({ latest: latest ?? null, history });
  }));

  // Initialize database with seed data route (for development/demo purposes)
  app.post("/api/seed-database", asyncHandler(async (req, res) => {
    // Create user
    const user = await storage.createUser({
      username: "Ramesh",
      password: "password123" // In production, this should be hashed
    });

    // Create farm
    const farm = await storage.createFarm({
      name: "Green Valley Farm",
      location: "Karnataka",
      userId: user.id,
      status: "Your farm is thriving"
    });

    // Create fields
    const field1 = await storage.createField({
      name: "Field 1",
      farmId: farm.id
    });

    const field2 = await storage.createField({
      name: "Field 2",
      farmId: farm.id
    });

    // Create water quality
    const waterQuality = await storage.createWaterQuality({
      farmId: farm.id,
      phLevel: "6.8",
      tds: "320 ppm",
      temperature: "28°C"
    });

    // Create soil moistures
    const soilMoisture1 = await storage.createSoilMoisture({
      farmId: farm.id,
      fieldId: field1.id,
      moistureLevel: 68,
      status: "optimal"
    });

    const soilMoisture2 = await storage.createSoilMoisture({
      farmId: farm.id,
      fieldId: field2.id,
      moistureLevel: 45,
      status: "warning"
    });

    // Create weather prediction
    const weatherPrediction = await storage.createWeatherPrediction({
      farmId: farm.id,
      message: "Rain expected in 2 days",
      advice: "Delay irrigation to save water and energy.",
      forecast: [
        { day: "Today", temperature: "32°C", weather: "sunny" },
        { day: "Tomorrow", temperature: "30°C", weather: "partly-cloudy" },
        { day: "Thu", temperature: "27°C", weather: "rainy" }
      ]
    });

    // Create irrigation tip
    const irrigationTip = await storage.createIrrigationTip({
      farmId: farm.id,
      tip: "Based on your soil type and current moisture levels, water your crops early morning (5-7 AM) to minimize evaporation and maximize absorption."
    });

    res.status(201).json({
      message: "Database seeded successfully",
      data: {
        user,
        farm,
        fields: [field1, field2],
        waterQuality,
        soilMoistures: [soilMoisture1, soilMoisture2],
        weatherPrediction,
        irrigationTip
      }
    });
  }));

  // Water prediction details for a specific farm — uses Open-Meteo 7-day forecast
  app.get("/api/farm/:farmId/water-prediction", asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    try {
      const weather = (!isNaN(lat) && !isNaN(lon))
        ? await fetchRealWeather(lat, lon)
        : await fetchDefaultWeather();
      res.json(weather);
    } catch (err) {
      console.error("Water prediction fetch failed:", err);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  }));

  // Real weather endpoint using Open-Meteo (free, no API key)
  app.get("/api/weather", asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    try {
      const weather = (!isNaN(lat) && !isNaN(lon))
        ? await fetchRealWeather(lat, lon)
        : await fetchDefaultWeather();
      res.json(weather);
    } catch (err) {
      console.error("Weather fetch failed:", err);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  }));

  // ── Location geocoding (Open-Meteo free geocoding, no API key) ──
  app.get("/api/geocode", asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Query required" });

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: "Geocoding service unavailable" });

    const data = await response.json() as { results?: Array<{ name: string; country: string; admin1?: string; latitude: number; longitude: number }> };
    const results = (data.results || []).map(r => ({
      cityName: r.admin1 ? `${r.name}, ${r.admin1}` : r.name,
      country: r.country,
      lat: r.latitude,
      lon: r.longitude,
      display: r.admin1 ? `${r.name}, ${r.admin1}, ${r.country}` : `${r.name}, ${r.country}`,
    }));

    res.json({ results });
  }));

  // ── Smart AI Recommendations (free, rule-based) ─────────────────
  app.get("/api/farm/:farmId/recommendations", asyncHandler(async (req, res) => {
    const farmId = parseInt(req.params.farmId);
    const { lat, lon } = req.query;

    // Default sensor demo values (used when DB is unavailable)
    let ph = 6.8, tds = 320, waterTemp = 28;
    let soilMoistureAvg = 62;
    let fields: Array<{ name: string; value: number; status: string }> = [
      { name: "Field 1", value: 70, status: "optimal" },
      { name: "Field 2", value: 44, status: "warning" },
    ];
    let rainChanceTomorrow = 20;
    let forecastTemp = 34;

    // Try reading real data from DB
    try {
      const dashboard = await storage.getFarmDashboardData(farmId);
      if (dashboard) {
        const wq = (dashboard as any).waterQuality;
        if (wq && wq.length) {
          const phEntry  = wq.find((m: any) => m.icon === "ph");
          const tdsEntry = wq.find((m: any) => m.icon === "tds");
          const tmpEntry = wq.find((m: any) => m.icon === "temp");
          if (phEntry)  ph        = parseFloat(String(phEntry.value))  || ph;
          if (tdsEntry) tds       = parseFloat(String(tdsEntry.value)) || tds;
          if (tmpEntry) waterTemp = parseFloat(String(tmpEntry.value)) || waterTemp;
        }
        const sm = (dashboard as any).soilMoisture;
        if (sm) {
          soilMoistureAvg = sm.level || soilMoistureAvg;
          if (sm.fields?.length) fields = sm.fields;
        }
      }
    } catch (_) {
      // Fall through to defaults
    }

    // Try real weather
    try {
      const parsedLat = parseFloat(String(lat));
      const parsedLon = parseFloat(String(lon));
      const weather = (!isNaN(parsedLat) && !isNaN(parsedLon))
        ? await fetchRealWeather(parsedLat, parsedLon)
        : await fetchDefaultWeather();
      const tomorrowForecast = weather?.forecast?.[1];
      if (tomorrowForecast) {
        rainChanceTomorrow = tomorrowForecast.rainChance ?? rainChanceTomorrow;
      }
      const todayForecast = weather?.forecast?.[0];
      if (todayForecast) {
        const tempStr = todayForecast.temperature?.replace("°C", "");
        forecastTemp = parseFloat(tempStr) || forecastTemp;
      }
    } catch (_) {
      // Fall through to defaults
    }

    const recs = generateRecommendations({
      ph, tds, waterTemp,
      soilMoistureAvg,
      fields,
      rainChanceTomorrow,
      forecastTemp,
      hour: new Date().getHours(),
    });

    res.json({ recommendations: recs, generatedAt: new Date().toISOString() });
  }));

  // ── ESP32 Integration (demo — single hardcoded secret) ───────────
  // Secret the ESP32 sends in every request. Change this if you want.
  const ESP32_SECRET = "JALSETU2024";

  // In-memory status: tracks the last time the ESP32 sent data
  let esp32LastSeen: Date | null = null;
  let esp32LastData: { tds?: number; soilMoisture?: number; ph?: number } = {};

  // Status endpoint — frontend polls this to show online/offline badge
  app.get("/api/esp32/status", (req, res) => {
    const onlineThresholdMs = 5 * 60 * 1000; // 5 minutes
    const online = esp32LastSeen !== null &&
      (Date.now() - esp32LastSeen.getTime()) < onlineThresholdMs;
    res.json({
      online,
      lastSeen: esp32LastSeen?.toISOString() ?? null,
      lastData: esp32LastData,
    });
  });

  // Sensor data ingestion — called by the ESP32, no login needed
  // Active sensors: TDS + Soil Moisture (pH sensor temporarily disabled)
  app.post("/api/esp32/sensor-data", asyncHandler(async (req, res) => {
    const schema = z.object({
      secret: z.string(),
      farmId: z.number().int().positive(),
      fieldId: z.number().int().positive(),
      tds: z.number().min(0).optional(),          // TDS in ppm
      ph: z.number().min(0).max(14).optional(),   // pH 0–14
      soilMoisture: z.number().min(0).max(100).optional(), // moisture %
      waterTemp: z.number().optional(),            // optional temperature °C
    });

    const data = schema.parse(req.body);

    if (data.secret !== ESP32_SECRET) {
      return res.status(401).json({ error: "Invalid secret" });
    }

    // Update in-memory status
    esp32LastSeen = new Date();
    esp32LastData = { tds: data.tds, soilMoisture: data.soilMoisture, ph: data.ph };

    const saved: Record<string, any> = {};

    // Save water quality reading — uses real pH when available
    if (data.tds !== undefined || data.ph !== undefined) {
      saved.waterQuality = await storage.createWaterQuality({
        farmId: data.farmId,
        phLevel: data.ph !== undefined ? data.ph.toFixed(1) : "N/A",
        tds: data.tds !== undefined ? `${Math.round(data.tds)} ppm` : "N/A",
        temperature: data.waterTemp !== undefined ? `${data.waterTemp.toFixed(1)}°C` : "N/A",
      });
    }

    // Save soil moisture reading
    // ESP32 sends fieldId as a 1-based sequential index (1, 2, 3…)
    // Map it to the actual DB field id by looking up the farm's fields ordered by id
    if (data.soilMoisture !== undefined) {
      const farmFields = await storage.getFieldsByFarmId(data.farmId);
      farmFields.sort((a, b) => a.id - b.id);
      const targetField = farmFields[data.fieldId - 1]; // 1-based → 0-based index
      if (!targetField) {
        return res.status(422).json({
          error: `Farm has ${farmFields.length} field(s); received fieldId ${data.fieldId} which is out of range`,
        });
      }
      const level = Math.round(data.soilMoisture);
      saved.soilMoisture = await storage.createSoilMoisture({
        farmId: data.farmId,
        fieldId: targetField.id,
        moistureLevel: level,
        status: level >= 60 ? "optimal" : level >= 35 ? "warning" : "danger",
      });
    }

    res.status(201).json({ success: true, saved });
  }));

  // Chatbot API endpoint — Gemini (free tier) with local knowledge-base fallback
  app.post("/api/chat", asyncHandler(async (req, res) => {
    try {
      await handleChatRequest(req, res);
    } catch (error) {
      console.error("Gemini chat failed, falling back to local knowledge base:", error);
      await handleLocalChat(req, res);
    }
  }));

  app.post("/api/chat/local", asyncHandler(handleLocalChat));

  const httpServer = createServer(app);

  return httpServer;
}
