import { 
  users, type User, type InsertUser,
  farms, type Farm, type InsertFarm,
  fields, type Field, type InsertField,
  waterQualities, type WaterQuality, type InsertWaterQuality,
  soilMoistures, type SoilMoisture, type InsertSoilMoisture,
  weatherPredictions, type WeatherPrediction, type InsertWeatherPrediction,
  irrigationTips, type IrrigationTip, type InsertIrrigationTip
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Farm methods
  getFarm(id: number): Promise<Farm | undefined>;
  getFarmsByUserId(userId: number): Promise<Farm[]>;
  getFarmByApiKey(apiKey: string): Promise<Farm | undefined>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  updateFarm(id: number, farm: Partial<InsertFarm>): Promise<Farm | undefined>;
  setFarmApiKey(farmId: number, apiKey: string): Promise<Farm | undefined>;
  
  // Field methods
  getField(id: number): Promise<Field | undefined>;
  getFieldsByFarmId(farmId: number): Promise<Field[]>;
  createField(field: InsertField): Promise<Field>;
  
  // Water Quality methods
  getWaterQuality(id: number): Promise<WaterQuality | undefined>;
  getLatestWaterQualityByFarmId(farmId: number): Promise<WaterQuality | undefined>;
  getWaterQualityHistory(farmId: number, limit?: number): Promise<WaterQuality[]>;
  createWaterQuality(waterQuality: InsertWaterQuality): Promise<WaterQuality>;
  
  // Soil Moisture methods
  getSoilMoisture(id: number): Promise<SoilMoisture | undefined>;
  getLatestSoilMoistureByFieldId(fieldId: number): Promise<SoilMoisture | undefined>;
  getSoilMoisturesByFarmId(farmId: number): Promise<SoilMoisture[]>;
  createSoilMoisture(soilMoisture: InsertSoilMoisture): Promise<SoilMoisture>;
  
  // Weather Prediction methods
  getWeatherPrediction(id: number): Promise<WeatherPrediction | undefined>;
  getLatestWeatherPredictionByFarmId(farmId: number): Promise<WeatherPrediction | undefined>;
  createWeatherPrediction(weatherPrediction: InsertWeatherPrediction): Promise<WeatherPrediction>;
  
  // Irrigation Tip methods
  getIrrigationTip(id: number): Promise<IrrigationTip | undefined>;
  getLatestIrrigationTipByFarmId(farmId: number): Promise<IrrigationTip | undefined>;
  createIrrigationTip(irrigationTip: InsertIrrigationTip): Promise<IrrigationTip>;
  
  // Dashboard data method
  getFarmDashboardData(farmId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Farm methods
  async getFarm(id: number): Promise<Farm | undefined> {
    const [farm] = await db.select().from(farms).where(eq(farms.id, id));
    return farm;
  }
  
  async getFarmsByUserId(userId: number): Promise<Farm[]> {
    return await db.select().from(farms).where(eq(farms.userId, userId));
  }

  async getFarmByApiKey(apiKey: string): Promise<Farm | undefined> {
    const [farm] = await db.select().from(farms).where(eq(farms.esp32ApiKey, apiKey));
    return farm;
  }
  
  async createFarm(farm: InsertFarm): Promise<Farm> {
    const [newFarm] = await db.insert(farms).values(farm).returning();
    return newFarm;
  }
  
  async updateFarm(id: number, farmData: Partial<InsertFarm>): Promise<Farm | undefined> {
    const [farm] = await db.update(farms).set(farmData).where(eq(farms.id, id)).returning();
    return farm;
  }

  async setFarmApiKey(farmId: number, apiKey: string): Promise<Farm | undefined> {
    const [farm] = await db.update(farms).set({ esp32ApiKey: apiKey }).where(eq(farms.id, farmId)).returning();
    return farm;
  }
  
  // Field methods
  async getField(id: number): Promise<Field | undefined> {
    const [field] = await db.select().from(fields).where(eq(fields.id, id));
    return field;
  }
  
  async getFieldsByFarmId(farmId: number): Promise<Field[]> {
    return await db.select().from(fields).where(eq(fields.farmId, farmId));
  }
  
  async createField(field: InsertField): Promise<Field> {
    const [newField] = await db.insert(fields).values(field).returning();
    return newField;
  }
  
  // Water Quality methods
  async getWaterQuality(id: number): Promise<WaterQuality | undefined> {
    const [quality] = await db.select().from(waterQualities).where(eq(waterQualities.id, id));
    return quality;
  }
  
  async getLatestWaterQualityByFarmId(farmId: number): Promise<WaterQuality | undefined> {
    const [quality] = await db
      .select()
      .from(waterQualities)
      .where(eq(waterQualities.farmId, farmId))
      .orderBy(desc(waterQualities.createdAt))
      .limit(1);
    return quality;
  }
  
  async getWaterQualityHistory(farmId: number, limit = 10): Promise<WaterQuality[]> {
    return db
      .select()
      .from(waterQualities)
      .where(eq(waterQualities.farmId, farmId))
      .orderBy(desc(waterQualities.createdAt))
      .limit(limit);
  }

  async createWaterQuality(quality: InsertWaterQuality): Promise<WaterQuality> {
    const [newQuality] = await db.insert(waterQualities).values(quality).returning();
    return newQuality;
  }
  
  // Soil Moisture methods
  async getSoilMoisture(id: number): Promise<SoilMoisture | undefined> {
    const [moisture] = await db.select().from(soilMoistures).where(eq(soilMoistures.id, id));
    return moisture;
  }
  
  async getLatestSoilMoistureByFieldId(fieldId: number): Promise<SoilMoisture | undefined> {
    const [moisture] = await db
      .select()
      .from(soilMoistures)
      .where(eq(soilMoistures.fieldId, fieldId))
      .orderBy(desc(soilMoistures.createdAt))
      .limit(1);
    return moisture;
  }
  
  async getSoilMoisturesByFarmId(farmId: number): Promise<SoilMoisture[]> {
    return await db
      .select()
      .from(soilMoistures)
      .where(eq(soilMoistures.farmId, farmId));
  }
  
  async createSoilMoisture(moisture: InsertSoilMoisture): Promise<SoilMoisture> {
    const [newMoisture] = await db.insert(soilMoistures).values(moisture).returning();
    return newMoisture;
  }
  
  // Weather Prediction methods
  async getWeatherPrediction(id: number): Promise<WeatherPrediction | undefined> {
    const [prediction] = await db.select().from(weatherPredictions).where(eq(weatherPredictions.id, id));
    return prediction;
  }
  
  async getLatestWeatherPredictionByFarmId(farmId: number): Promise<WeatherPrediction | undefined> {
    const [prediction] = await db
      .select()
      .from(weatherPredictions)
      .where(eq(weatherPredictions.farmId, farmId))
      .orderBy(desc(weatherPredictions.createdAt))
      .limit(1);
    return prediction;
  }
  
  async createWeatherPrediction(prediction: InsertWeatherPrediction): Promise<WeatherPrediction> {
    const [newPrediction] = await db.insert(weatherPredictions).values(prediction).returning();
    return newPrediction;
  }
  
  // Irrigation Tip methods
  async getIrrigationTip(id: number): Promise<IrrigationTip | undefined> {
    const [tip] = await db.select().from(irrigationTips).where(eq(irrigationTips.id, id));
    return tip;
  }
  
  async getLatestIrrigationTipByFarmId(farmId: number): Promise<IrrigationTip | undefined> {
    const [tip] = await db
      .select()
      .from(irrigationTips)
      .where(eq(irrigationTips.farmId, farmId))
      .orderBy(desc(irrigationTips.createdAt))
      .limit(1);
    return tip;
  }
  
  async createIrrigationTip(tip: InsertIrrigationTip): Promise<IrrigationTip> {
    const [newTip] = await db.insert(irrigationTips).values(tip).returning();
    return newTip;
  }
  
  // Dashboard data method - combines all relevant data for the farm dashboard
  async getFarmDashboardData(farmId: number): Promise<any> {
    // Get farm information
    const farm = await this.getFarm(farmId);
    if (!farm) {
      throw new Error(`Farm with id ${farmId} not found`);
    }
    
    // Get farm owner
    const user = await this.getUser(farm.userId);
    
    // Get latest water quality data
    const waterQuality = await this.getLatestWaterQualityByFarmId(farmId);
    
    // Get farm fields and soil moisture
    const fields = await this.getFieldsByFarmId(farmId);
    
    // Get the LATEST soil moisture reading per field
    const soilMoistureReadings = await Promise.all(
      fields.map(f => this.getLatestSoilMoistureByFieldId(f.id))
    );
    
    // Get latest weather prediction
    const weatherPrediction = await this.getLatestWeatherPredictionByFarmId(farmId);
    
    // Get latest irrigation tip
    const irrigationTip = await this.getLatestIrrigationTipByFarmId(farmId);
    
    // Combine all data
    return {
      farmer: {
        id: user?.id,
        name: user?.username
      },
      farm: {
        id: farm.id,
        name: farm.name,
        location: farm.location,
        status: farm.status
      },
      waterQuality: waterQuality ? (() => {
        const ph  = parseFloat(waterQuality.phLevel ?? "7");
        const tds = parseFloat((waterQuality.tds ?? "0").toString().replace(/[^\d.]/g, ""));
        const phOk  = ph  >= 6.5 && ph  <= 8.5;
        const tdsOk = tds >= 0   && tds <= 500;
        const overall = (phOk && tdsOk)
          ? { value: "Safe",   status: "Good",    label: "Good" }
          : (!phOk && !tdsOk)
            ? { value: "Poor",  status: "bad",     label: "Alert" }
            : { value: "Fair",  status: "warning", label: "Warm" };
        return [
          { name: "pH Level", value: waterQuality.phLevel, status: "Good", icon: "ph" },
          { name: "TDS", value: waterQuality.tds, unit: "ppm", status: "Good", icon: "tds" },
          { name: "Quality", value: overall.value, status: overall.status, icon: "score" },
        ];
      })() : [],
      soilMoisture: (() => {
        // soilMoistureReadings[i] is the latest reading for fields[i]
        const fieldRows = fields.map((field, i) => ({
          id: field.id,
          name: field.name,
          value: soilMoistureReadings[i]?.moistureLevel ?? 0,
          status: (soilMoistureReadings[i]?.status as "optimal" | "warning" | "danger") ?? "warning"
        }));
        const readings = fieldRows.filter(f => f.value > 0);
        const avgLevel = readings.length
          ? Math.round(readings.reduce((s, f) => s + f.value, 0) / readings.length)
          : 0;
        const overallStatus =
          avgLevel >= 60 ? "Ideal Moisture Level"
          : avgLevel >= 35 ? "Needs Attention"
          : "Critically Low";
        return { level: avgLevel, status: overallStatus, fields: fieldRows };
      })(),
      waterPrediction: weatherPrediction ? {
        message: weatherPrediction.message,
        advice: weatherPrediction.advice,
        forecast: weatherPrediction.forecast
      } : {
        message: "No weather prediction available",
        advice: "Check back later for irrigation recommendations",
        forecast: []
      },
      irrigationTip: irrigationTip?.tip || "No irrigation tips available yet. Check back soon!"
    };
  }
}

export const storage = new DatabaseStorage();
