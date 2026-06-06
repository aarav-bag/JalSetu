import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define all tables first, then relations

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Farm schema
export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").default("Your farm is thriving"),
  esp32ApiKey: text("esp32_api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fields schema (for soil moisture readings)
export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  farmId: integer("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Water Quality schema
export const waterQualities = pgTable("water_qualities", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  phLevel: text("ph_level").notNull(),
  tds: text("tds").notNull(),
  temperature: text("temperature").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Soil Moisture schema
export const soilMoistures = pgTable("soil_moistures", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  fieldId: integer("field_id").notNull().references(() => fields.id, { onDelete: "cascade" }),
  moistureLevel: integer("moisture_level").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weather Prediction schema
export const weatherPredictions = pgTable("weather_predictions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  advice: text("advice").notNull(),
  forecast: jsonb("forecast").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Irrigation Tips schema
export const irrigationTips = pgTable("irrigation_tips", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  tip: text("tip").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations after all tables are defined
export const usersRelations = relations(users, ({ many }) => ({
  farms: many(farms),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  user: one(users, {
    fields: [farms.userId],
    references: [users.id],
  }),
  waterQualities: many(waterQualities),
  soilMoistures: many(soilMoistures),
  weatherPredictions: many(weatherPredictions),
  irrigationTips: many(irrigationTips),
  fields: many(fields),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  farm: one(farms, {
    fields: [fields.farmId],
    references: [farms.id],
  }),
  soilMoistures: many(soilMoistures),
}));

export const waterQualitiesRelations = relations(waterQualities, ({ one }) => ({
  farm: one(farms, {
    fields: [waterQualities.farmId],
    references: [farms.id],
  }),
}));

export const soilMoisturesRelations = relations(soilMoistures, ({ one }) => ({
  farm: one(farms, {
    fields: [soilMoistures.farmId],
    references: [farms.id],
  }),
  field: one(fields, {
    fields: [soilMoistures.fieldId],
    references: [fields.id],
  }),
}));

export const weatherPredictionsRelations = relations(weatherPredictions, ({ one }) => ({
  farm: one(farms, {
    fields: [weatherPredictions.farmId],
    references: [farms.id],
  }),
}));

export const irrigationTipsRelations = relations(irrigationTips, ({ one }) => ({
  farm: one(farms, {
    fields: [irrigationTips.farmId],
    references: [farms.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
});

export const insertFarmSchema = createInsertSchema(farms).pick({
  name: true,
  location: true,
  userId: true,
  status: true,
});

export const insertFieldSchema = createInsertSchema(fields).pick({
  name: true,
  farmId: true,
});

export const insertWaterQualitySchema = createInsertSchema(waterQualities).pick({
  farmId: true,
  phLevel: true,
  tds: true,
  temperature: true,
});

export const insertSoilMoistureSchema = createInsertSchema(soilMoistures).pick({
  farmId: true,
  fieldId: true,
  moistureLevel: true,
  status: true,
});

export const insertWeatherPredictionSchema = createInsertSchema(weatherPredictions).pick({
  farmId: true,
  message: true,
  advice: true,
  forecast: true,
});

export const insertIrrigationTipSchema = createInsertSchema(irrigationTips).pick({
  farmId: true,
  tip: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFarm = z.infer<typeof insertFarmSchema>;
export type Farm = typeof farms.$inferSelect;

export type InsertField = z.infer<typeof insertFieldSchema>;
export type Field = typeof fields.$inferSelect;

export type InsertWaterQuality = z.infer<typeof insertWaterQualitySchema>;
export type WaterQuality = typeof waterQualities.$inferSelect;

export type InsertSoilMoisture = z.infer<typeof insertSoilMoistureSchema>;
export type SoilMoisture = typeof soilMoistures.$inferSelect;

export type InsertWeatherPrediction = z.infer<typeof insertWeatherPredictionSchema>;
export type WeatherPrediction = typeof weatherPredictions.$inferSelect;

export type InsertIrrigationTip = z.infer<typeof insertIrrigationTipSchema>;
export type IrrigationTip = typeof irrigationTips.$inferSelect;
