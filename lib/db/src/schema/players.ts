import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: integer("number").notNull(),
  position: text("position").notNull(),
  age: integer("age").notNull(),
  nationality: text("nationality").notNull(),
  height: real("height").notNull(),
  weight: real("weight").notNull(),
  muscleMass: real("muscle_mass").notNull(),
  injuryRisk: text("injury_risk").notNull().default("low"),
  status: text("status").notNull().default("active"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true, createdAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;

export const wearableDataTable = pgTable("wearable_data", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => playersTable.id),
  heartRate: integer("heart_rate").notNull(),
  heartRateMax: integer("heart_rate_max").notNull(),
  speed: real("speed").notNull(),
  distance: real("distance").notNull(),
  acceleration: real("acceleration").notNull(),
  fatigue: integer("fatigue").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertWearableSchema = createInsertSchema(wearableDataTable).omit({ id: true, lastUpdated: true });
export type InsertWearable = z.infer<typeof insertWearableSchema>;
export type WearableData = typeof wearableDataTable.$inferSelect;

export const medicalRecordsTable = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => playersTable.id),
  bloodType: text("blood_type").notNull(),
  allergies: text("allergies").array().notNull().default([]),
  medications: text("medications").array().notNull().default([]),
  notes: text("notes").notNull().default(""),
  lastExamDate: text("last_exam_date").notNull(),
  clearanceStatus: text("clearance_status").notNull().default("cleared"),
});

export const insertMedicalSchema = createInsertSchema(medicalRecordsTable).omit({ id: true });
export type InsertMedical = z.infer<typeof insertMedicalSchema>;
export type MedicalRecord = typeof medicalRecordsTable.$inferSelect;

export const injuryHistoryTable = pgTable("injury_history", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => playersTable.id),
  type: text("type").notNull(),
  date: text("date").notNull(),
  recovered: integer("recovered").notNull().default(1),
  notes: text("notes").notNull().default(""),
});

export type InjuryHistory = typeof injuryHistoryTable.$inferSelect;
