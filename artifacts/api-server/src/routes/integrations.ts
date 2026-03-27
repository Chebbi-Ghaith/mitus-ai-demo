import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  playerIntegrationsTable,
  playerDocumentsTable,
  wearableDataTable,
  medicalRecordsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

// Store uploads in /tmp
const upload = multer({
  dest: "/tmp/ari-uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(_req, file, cb) {
    const allowed = [".csv", ".json", ".pdf", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// GET /api/players/:id/integrations
router.get("/players/:id/integrations", async (req, res) => {
  const playerId = parseInt(req.params.id);
  try {
    const integrations = await db
      .select()
      .from(playerIntegrationsTable)
      .where(eq(playerIntegrationsTable.playerId, playerId));

    const docs = await db
      .select()
      .from(playerDocumentsTable)
      .where(eq(playerDocumentsTable.playerId, playerId));

    return res.json({ integrations, documents: docs });
  } catch (err) {
    req.log.error({ err }, "Failed to get integrations");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/players/:id/integrations — connect or disconnect a provider
router.post("/players/:id/integrations", async (req, res) => {
  const playerId = parseInt(req.params.id);
  const { provider, action } = req.body; // action: 'connect' | 'disconnect'

  if (!provider || !action) {
    return res.status(400).json({ error: "provider and action are required" });
  }

  try {
    const [existing] = await db
      .select()
      .from(playerIntegrationsTable)
      .where(
        and(
          eq(playerIntegrationsTable.playerId, playerId),
          eq(playerIntegrationsTable.provider, provider)
        )
      );

    const now = new Date();
    const status = action === "connect" ? "connected" : "disconnected";

    let record;
    if (existing) {
      [record] = await db
        .update(playerIntegrationsTable)
        .set({
          status,
          lastSync: action === "connect" ? now : existing.lastSync,
          connectedAt: action === "connect" ? (existing.connectedAt ?? now) : existing.connectedAt,
        })
        .where(eq(playerIntegrationsTable.id, existing.id))
        .returning();
    } else {
      [record] = await db
        .insert(playerIntegrationsTable)
        .values({
          playerId,
          provider,
          status,
          connectedAt: action === "connect" ? now : undefined,
          lastSync: action === "connect" ? now : undefined,
        })
        .returning();
    }

    // When connecting, simulate a data sync by updating wearable with mock data
    if (action === "connect") {
      const mockByProvider: Record<string, { heartRate: number; heartRateMax: number; speed: number; distance: number; fatigue: number; acceleration: number }> = {
        whoop: { heartRate: 68, heartRateMax: 198, speed: 29.1, distance: 9.2, fatigue: 55, acceleration: 4.2 },
        apple_health: { heartRate: 74, heartRateMax: 192, speed: 27.5, distance: 8.0, fatigue: 48, acceleration: 3.8 },
        oura: { heartRate: 62, heartRateMax: 185, speed: 26.0, distance: 7.5, fatigue: 42, acceleration: 3.5 },
        garmin: { heartRate: 71, heartRateMax: 195, speed: 30.2, distance: 10.1, fatigue: 62, acceleration: 4.8 },
      };
      const mock = mockByProvider[provider];
      if (mock) {
        const [existingWear] = await db.select().from(wearableDataTable).where(eq(wearableDataTable.playerId, playerId));
        if (existingWear) {
          await db.update(wearableDataTable).set({ ...mock, lastUpdated: now }).where(eq(wearableDataTable.playerId, playerId));
        } else {
          await db.insert(wearableDataTable).values({ playerId, ...mock });
        }
      }
    }

    return res.json(record);
  } catch (err) {
    req.log.error({ err }, "Failed to update integration");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/players/:id/upload — upload and parse a file
router.post("/players/:id/upload", upload.single("file"), async (req, res) => {
  const playerId = parseInt(req.params.id);
  const category = (req.body.category as string) || "wearable";

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, filename, path: filePath } = req.file;
  const ext = path.extname(originalname).toLowerCase().replace(".", "");

  try {
    let parsedRows = 0;
    let status = "parsed";
    let notes = "";

    if (ext === "csv") {
      const raw = fs.readFileSync(filePath, "utf-8");
      const lines = raw.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, "_"));
      parsedRows = lines.length - 1;

      // Try to map CSV columns to wearable data
      if (category === "wearable" && parsedRows > 0) {
        const lastRow = lines[lines.length - 1].split(",");
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = lastRow[i]?.trim() ?? ""; });

        const fieldMap: Record<string, string> = {
          heart_rate: "heartRate", hr: "heartRate", bpm: "heartRate",
          heart_rate_max: "heartRateMax", max_hr: "heartRateMax",
          speed: "speed", velocity: "speed", top_speed: "speed",
          distance: "distance", dist: "distance", km: "distance",
          fatigue: "fatigue", fatigue_score: "fatigue",
          acceleration: "acceleration", accel: "acceleration",
        };

        const wearableUpdate: Record<string, number> = {};
        for (const [csvKey, dbKey] of Object.entries(fieldMap)) {
          if (row[csvKey] !== undefined && !isNaN(parseFloat(row[csvKey]))) {
            wearableUpdate[dbKey] = parseFloat(row[csvKey]);
          }
        }

        if (Object.keys(wearableUpdate).length > 0) {
          const [existing] = await db.select().from(wearableDataTable).where(eq(wearableDataTable.playerId, playerId));
          if (existing) {
            await db.update(wearableDataTable).set({ ...wearableUpdate, lastUpdated: new Date() }).where(eq(wearableDataTable.playerId, playerId));
          }
          notes = `Updated ${Object.keys(wearableUpdate).join(", ")} from ${parsedRows} rows`;
        } else {
          notes = `Parsed ${parsedRows} rows — no matching wearable fields found`;
        }
      }

      // Medical CSV: try to extract injury/medication info
      if (category === "medical" && parsedRows > 0) {
        notes = `Parsed ${parsedRows} medical records from CSV`;
        const [medRecord] = await db.select().from(medicalRecordsTable).where(eq(medicalRecordsTable.playerId, playerId));
        if (medRecord) {
          await db.update(medicalRecordsTable).set({ lastExamDate: new Date().toISOString().split("T")[0] }).where(eq(medicalRecordsTable.playerId, playerId));
        }
      }
    } else if (ext === "json") {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      const rows = Array.isArray(data) ? data : [data];
      parsedRows = rows.length;

      if (category === "wearable") {
        const last = rows[rows.length - 1];
        const wearableUpdate: Partial<{ heartRate: number; heartRateMax: number; speed: number; distance: number; fatigue: number; acceleration: number }> = {};
        if (last.heart_rate || last.heartRate) wearableUpdate.heartRate = last.heart_rate || last.heartRate;
        if (last.heart_rate_max || last.heartRateMax) wearableUpdate.heartRateMax = last.heart_rate_max || last.heartRateMax;
        if (last.speed) wearableUpdate.speed = last.speed;
        if (last.distance) wearableUpdate.distance = last.distance;
        if (last.fatigue) wearableUpdate.fatigue = last.fatigue;
        if (last.acceleration) wearableUpdate.acceleration = last.acceleration;

        if (Object.keys(wearableUpdate).length > 0) {
          const [existing] = await db.select().from(wearableDataTable).where(eq(wearableDataTable.playerId, playerId));
          if (existing) {
            await db.update(wearableDataTable).set({ ...wearableUpdate, lastUpdated: new Date() }).where(eq(wearableDataTable.playerId, playerId));
          }
        }
      }
      notes = `Parsed ${parsedRows} JSON records`;
    } else if (ext === "pdf") {
      parsedRows = 0;
      notes = "PDF stored — manual review required";
    } else {
      status = "error";
      notes = "Unsupported file format";
    }

    // Save document record to DB
    const [doc] = await db.insert(playerDocumentsTable).values({
      playerId,
      filename,
      originalName: originalname,
      fileType: ext,
      category,
      status,
      parsedRows,
      notes,
    }).returning();

    return res.status(201).json(doc);
  } catch (err) {
    req.log.error({ err }, "Failed to process upload");
    // Save failed document record
    await db.insert(playerDocumentsTable).values({
      playerId,
      filename,
      originalName: originalname,
      fileType: ext,
      category,
      status: "error",
      parsedRows: 0,
      notes: "Parse error",
    }).catch(() => {});
    return res.status(500).json({ error: "Failed to process file" });
  }
});

export default router;
