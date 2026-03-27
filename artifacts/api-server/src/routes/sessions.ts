import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  sessionsTable,
  sessionPlayersTable,
  movementAnalysisTable,
  preventionProtocolsTable,
  exercisesTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/sessions", async (req, res) => {
  try {
    const sessions = await db.select().from(sessionsTable);
    const result = await Promise.all(
      sessions.map(async (s) => {
        const players = await db.select().from(sessionPlayersTable).where(eq(sessionPlayersTable.sessionId, s.id));
        return { ...s, playerIds: players.map((p) => p.playerId) };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list sessions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id));
    if (!session) return res.status(404).json({ error: "Session not found" });
    const players = await db.select().from(sessionPlayersTable).where(eq(sessionPlayersTable.sessionId, id));
    return res.json({ ...session, playerIds: players.map((p) => p.playerId) });
  } catch (err) {
    req.log.error({ err }, "Failed to get session");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const { type, date, duration, playerIds, description } = req.body;
    const [session] = await db.insert(sessionsTable).values({ type, date, duration, description }).returning();
    if (playerIds && Array.isArray(playerIds)) {
      for (const pid of playerIds) {
        await db.insert(sessionPlayersTable).values({ sessionId: session.id, playerId: pid });
      }
    }
    return res.status(201).json({ ...session, playerIds: playerIds || [] });
  } catch (err) {
    req.log.error({ err }, "Failed to create session");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions/:id/analysis", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const analyses = await db.select().from(movementAnalysisTable).where(eq(movementAnalysisTable.sessionId, id));
    res.json(
      analyses.map((a) => ({
        ...a,
        correct: a.correct === 1,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get session analysis");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/players/:id/analysis", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const analyses = await db.select().from(movementAnalysisTable).where(eq(movementAnalysisTable.playerId, id));
    res.json(
      analyses.map((a) => ({
        ...a,
        correct: a.correct === 1,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get player analysis");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/players/:id/protocols", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const protocols = await db.select().from(preventionProtocolsTable).where(eq(preventionProtocolsTable.playerId, id));
    const result = await Promise.all(
      protocols.map(async (p) => {
        const exercises = await db.select().from(exercisesTable).where(eq(exercisesTable.protocolId, p.id));
        return {
          id: p.id,
          playerId: p.playerId,
          title: p.title,
          category: p.category,
          frequency: p.frequency,
          priority: p.priority,
          createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
          exercises: exercises.map((e) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            notes: e.notes,
          })),
        };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get protocols");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
