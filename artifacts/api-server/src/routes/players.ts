import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  playersTable,
  wearableDataTable,
  medicalRecordsTable,
  injuryHistoryTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/players", async (req, res) => {
  try {
    const players = await db.select().from(playersTable);
    const wearables = await db.select().from(wearableDataTable);
    const result = players.map((p) => {
      const w = wearables.find((wd) => wd.playerId === p.id);
      return {
        ...p,
        wearableData: w
          ? {
              heartRate: w.heartRate,
              heartRateMax: w.heartRateMax,
              speed: w.speed,
              distance: w.distance,
              acceleration: w.acceleration,
              fatigue: w.fatigue,
              lastUpdated: w.lastUpdated?.toISOString() ?? new Date().toISOString(),
            }
          : {
              heartRate: 72,
              heartRateMax: 190,
              speed: 0,
              distance: 0,
              acceleration: 0,
              fatigue: 10,
              lastUpdated: new Date().toISOString(),
            },
      };
    });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list players");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/players/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [player] = await db.select().from(playersTable).where(eq(playersTable.id, id));
    if (!player) return res.status(404).json({ error: "Player not found" });
    const [wearable] = await db.select().from(wearableDataTable).where(eq(wearableDataTable.playerId, id));
    return res.json({
      ...player,
      wearableData: wearable
        ? {
            heartRate: wearable.heartRate,
            heartRateMax: wearable.heartRateMax,
            speed: wearable.speed,
            distance: wearable.distance,
            acceleration: wearable.acceleration,
            fatigue: wearable.fatigue,
            lastUpdated: wearable.lastUpdated?.toISOString() ?? new Date().toISOString(),
          }
        : {
            heartRate: 72,
            heartRateMax: 190,
            speed: 0,
            distance: 0,
            acceleration: 0,
            fatigue: 10,
            lastUpdated: new Date().toISOString(),
          },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get player");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/players", async (req, res) => {
  try {
    const { name, number, position, age, nationality, height, weight, muscleMass } = req.body;
    const [player] = await db
      .insert(playersTable)
      .values({ name, number, position, age, nationality, height, weight, muscleMass })
      .returning();
    await db.insert(wearableDataTable).values({
      playerId: player.id,
      heartRate: 72,
      heartRateMax: 190,
      speed: 0,
      distance: 0,
      acceleration: 0,
      fatigue: 10,
    });
    return res.status(201).json({ ...player, wearableData: { heartRate: 72, heartRateMax: 190, speed: 0, distance: 0, acceleration: 0, fatigue: 10, lastUpdated: new Date().toISOString() } });
  } catch (err) {
    req.log.error({ err }, "Failed to create player");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/players/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { name, number, position, age, nationality, height, weight, muscleMass, injuryRisk, status } = req.body;
    const updates: Partial<typeof playersTable.$inferInsert> = {};
    if (name !== undefined) updates.name = name;
    if (number !== undefined) updates.number = number;
    if (position !== undefined) updates.position = position;
    if (age !== undefined) updates.age = age;
    if (nationality !== undefined) updates.nationality = nationality;
    if (height !== undefined) updates.height = height;
    if (weight !== undefined) updates.weight = weight;
    if (muscleMass !== undefined) updates.muscleMass = muscleMass;
    if (injuryRisk !== undefined) updates.injuryRisk = injuryRisk;
    if (status !== undefined) updates.status = status;
    const [updated] = await db.update(playersTable).set(updates).where(eq(playersTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Player not found" });
    const [wearable] = await db.select().from(wearableDataTable).where(eq(wearableDataTable.playerId, id));
    return res.json({
      ...updated,
      wearableData: wearable
        ? { heartRate: wearable.heartRate, heartRateMax: wearable.heartRateMax, speed: wearable.speed, distance: wearable.distance, acceleration: wearable.acceleration, fatigue: wearable.fatigue, lastUpdated: wearable.lastUpdated?.toISOString() ?? new Date().toISOString() }
        : { heartRate: 72, heartRateMax: 190, speed: 0, distance: 0, acceleration: 0, fatigue: 10, lastUpdated: new Date().toISOString() },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update player");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/players/:id/medical", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [record] = await db.select().from(medicalRecordsTable).where(eq(medicalRecordsTable.playerId, id));
    if (!record) return res.status(404).json({ error: "Medical record not found" });
    const injuries = await db.select().from(injuryHistoryTable).where(eq(injuryHistoryTable.playerId, id));
    return res.json({
      playerId: record.playerId,
      bloodType: record.bloodType,
      allergies: record.allergies,
      medications: record.medications,
      notes: record.notes,
      lastExamDate: record.lastExamDate,
      clearanceStatus: record.clearanceStatus,
      injuries: injuries.map((i) => ({
        type: i.type,
        date: i.date,
        recovered: i.recovered === 1,
        notes: i.notes,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get medical record");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/players/:id/medical", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { bloodType, allergies, medications, notes, lastExamDate, clearanceStatus } = req.body;
    const updates: Partial<typeof medicalRecordsTable.$inferInsert> = {};
    if (bloodType !== undefined) updates.bloodType = bloodType;
    if (allergies !== undefined) updates.allergies = allergies;
    if (medications !== undefined) updates.medications = medications;
    if (notes !== undefined) updates.notes = notes;
    if (lastExamDate !== undefined) updates.lastExamDate = lastExamDate;
    if (clearanceStatus !== undefined) updates.clearanceStatus = clearanceStatus;
    const existing = await db.select().from(medicalRecordsTable).where(eq(medicalRecordsTable.playerId, id));
    let record;
    if (existing.length === 0) {
      [record] = await db.insert(medicalRecordsTable).values({ playerId: id, bloodType: bloodType || "A+", allergies: allergies || [], medications: medications || [], notes: notes || "", lastExamDate: lastExamDate || new Date().toISOString().split("T")[0], clearanceStatus: clearanceStatus || "cleared" }).returning();
    } else {
      [record] = await db.update(medicalRecordsTable).set(updates).where(eq(medicalRecordsTable.playerId, id)).returning();
    }
    const injuries = await db.select().from(injuryHistoryTable).where(eq(injuryHistoryTable.playerId, id));
    return res.json({
      playerId: record!.playerId,
      bloodType: record!.bloodType,
      allergies: record!.allergies,
      medications: record!.medications,
      notes: record!.notes,
      lastExamDate: record!.lastExamDate,
      clearanceStatus: record!.clearanceStatus,
      injuries: injuries.map((i) => ({ type: i.type, date: i.date, recovered: i.recovered === 1, notes: i.notes })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update medical record");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
