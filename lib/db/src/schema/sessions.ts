import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  duration: integer("duration").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionPlayersTable = pgTable("session_players", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  playerId: integer("player_id").notNull(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;

export const movementAnalysisTable = pgTable("movement_analysis", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  sessionId: integer("session_id").notNull(),
  timestamp: text("timestamp").notNull(),
  movementType: text("movement_type").notNull(),
  correct: integer("correct").notNull().default(1),
  riskScore: integer("risk_score").notNull().default(0),
  detectedIssues: text("detected_issues").array().notNull().default([]),
  bodyParts: text("body_parts").array().notNull().default([]),
  recommendation: text("recommendation").notNull(),
  confidence: real("confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type MovementAnalysis = typeof movementAnalysisTable.$inferSelect;

export const preventionProtocolsTable = pgTable("prevention_protocols", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  frequency: text("frequency").notNull(),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  protocolId: integer("protocol_id").notNull().references(() => preventionProtocolsTable.id),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
  duration: text("duration").notNull(),
  notes: text("notes").notNull().default(""),
});

export type PreventionProtocol = typeof preventionProtocolsTable.$inferSelect;
export type Exercise = typeof exercisesTable.$inferSelect;
