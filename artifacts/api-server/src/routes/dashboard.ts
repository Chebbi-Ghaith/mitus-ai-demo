import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { playersTable, sessionsTable, movementAnalysisTable, wearableDataTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const players = await db.select().from(playersTable);
    const sessions = await db.select().from(sessionsTable);
    const analyses = await db.select().from(movementAnalysisTable);
    const wearables = await db.select().from(wearableDataTable);

    const totalPlayers = players.length;
    const activePlayers = players.filter((p) => p.status === "active").length;
    const injuredPlayers = players.filter((p) => p.status === "injured").length;
    const highRiskPlayers = players.filter((p) => p.injuryRisk === "high").length;
    const totalSessions = sessions.length;
    const recentAnalyses = analyses.length;

    const teamFatigue =
      wearables.length > 0
        ? wearables.reduce((sum, w) => sum + w.fatigue, 0) / wearables.length
        : 25;
    const teamAvgHeartRate =
      wearables.length > 0
        ? wearables.reduce((sum, w) => sum + w.heartRate, 0) / wearables.length
        : 72;

    res.json({
      totalPlayers,
      activePlayers,
      injuredPlayers,
      highRiskPlayers,
      totalSessions,
      recentAnalyses,
      teamFatigue,
      teamAvgHeartRate,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
