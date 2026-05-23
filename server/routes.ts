import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { z } from "zod";
import { insertUserSchema, insertFarmSchema, insertFieldSchema, insertWaterQualitySchema, insertSoilMoistureSchema, insertWeatherPredictionSchema, insertIrrigationTipSchema } from "@shared/schema";
import passport from "passport";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { handleChatRequest } from "./chatbot";
import { handlePerplexityChat } from "./perplexity";
import { handleLocalChat } from "./localChatbot";
import { handleEdenAIChat } from "./edenAI";
import { handleOpenAIChat } from "./openaiChatbot";
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

  // Test login endpoint for development
  app.post("/api/test-login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'aarav' && password === '123456') {
      const testUser = {
        id: 999,
        username: 'aarav',
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: 'aarav@jalsetu.app',
        createdAt: new Date().toISOString()
      };
      
      // Create a session manually
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
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Don't return password in response
        const { password, ...userWithoutPassword } = user;
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

  // Chatbot API endpoint - with multiple AI provider support
  app.post("/api/chat", asyncHandler(async (req, res) => {
    const { provider = "openai" } = req.body;
    
    try {
      switch (provider.toLowerCase()) {
        case "openai":
        case "chatgpt":
          await handleOpenAIChat(req, res);
          break;
        case "gemini":
          await handleChatRequest(req, res);
          break;
        case "perplexity":
          await handlePerplexityChat(req, res);
          break;
        case "eden":
        case "edenai":
          await handleEdenAIChat(req, res);
          break;
        case "local":
          await handleLocalChat(req, res);
          break;
        default:
          // Default to OpenAI if provider not specified or recognized
          await handleOpenAIChat(req, res);
      }
    } catch (error) {
      console.error(`Chat provider ${provider} failed:`, error);
      // Fallback to local knowledge base
      await handleLocalChat(req, res);
    }
  }));

  // Specific provider endpoints for direct access
  app.post("/api/chat/openai", asyncHandler(handleOpenAIChat));
  app.post("/api/chat/gemini", asyncHandler(handleChatRequest));
  app.post("/api/chat/perplexity", asyncHandler(handlePerplexityChat));
  app.post("/api/chat/eden", asyncHandler(handleEdenAIChat));
  app.post("/api/chat/local", asyncHandler(handleLocalChat));

  const httpServer = createServer(app);

  return httpServer;
}
