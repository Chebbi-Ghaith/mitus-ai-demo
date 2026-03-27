import { db } from "@workspace/db";
import {
  playersTable,
  wearableDataTable,
  medicalRecordsTable,
  injuryHistoryTable,
  sessionsTable,
  sessionPlayersTable,
  movementAnalysisTable,
  preventionProtocolsTable,
  exercisesTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("Seeding Ari database...");

  const existingPlayers = await db.select().from(playersTable);
  if (existingPlayers.length > 0) {
    console.log("Database already seeded, skipping.");
    process.exit(0);
  }

  const players = [
    { name: "Marco Rossi", number: 9, position: "Centravanti", age: 26, nationality: "Italia", height: 1.84, weight: 82, muscleMass: 42.5, injuryRisk: "high" as const, status: "active" as const },
    { name: "Luis García", number: 7, position: "Ala Destra", age: 24, nationality: "Spagna", height: 1.75, weight: 72, muscleMass: 38.2, injuryRisk: "medium" as const, status: "active" as const },
    { name: "Kevin Müller", number: 5, position: "Centrocampista", age: 28, nationality: "Germania", height: 1.81, weight: 78, muscleMass: 40.1, injuryRisk: "low" as const, status: "active" as const },
    { name: "Antoine Bernard", number: 3, position: "Terzino Sinistro", age: 22, nationality: "Francia", height: 1.79, weight: 74, muscleMass: 39.0, injuryRisk: "medium" as const, status: "recovering" as const },
    { name: "Carlos Silva", number: 11, position: "Ala Sinistra", age: 25, nationality: "Portogallo", height: 1.72, weight: 69, muscleMass: 36.8, injuryRisk: "low" as const, status: "active" as const },
    { name: "Luca Ferrari", number: 1, position: "Portiere", age: 30, nationality: "Italia", height: 1.90, weight: 88, muscleMass: 45.2, injuryRisk: "low" as const, status: "active" as const },
    { name: "Jamal Hassan", number: 4, position: "Difensore Centrale", age: 27, nationality: "Marocco", height: 1.88, weight: 85, muscleMass: 44.1, injuryRisk: "high" as const, status: "injured" as const },
    { name: "Tom Nielsen", number: 8, position: "Mezzala", age: 23, nationality: "Danimarca", height: 1.80, weight: 76, muscleMass: 39.5, injuryRisk: "medium" as const, status: "active" as const },
    { name: "Pedro Alves", number: 10, position: "Trequartista", age: 29, nationality: "Brasile", height: 1.76, weight: 73, muscleMass: 37.9, injuryRisk: "low" as const, status: "active" as const },
    { name: "Stefan Kovač", number: 6, position: "Difensore Centrale", age: 31, nationality: "Serbia", height: 1.87, weight: 87, muscleMass: 44.8, injuryRisk: "medium" as const, status: "active" as const },
    { name: "Youssef El Amri", number: 14, position: "Centrocampista", age: 21, nationality: "Tunisia", height: 1.78, weight: 71, muscleMass: 37.5, injuryRisk: "low" as const, status: "active" as const },
    { name: "Alexei Petrov", number: 2, position: "Terzino Destro", age: 26, nationality: "Russia", height: 1.82, weight: 79, muscleMass: 40.7, injuryRisk: "medium" as const, status: "active" as const },
  ];

  const insertedPlayers = await db.insert(playersTable).values(players).returning();

  const wearables = insertedPlayers.map((p, i) => ({
    playerId: p.id,
    heartRate: [142, 128, 155, 98, 134, 72, 68, 148, 131, 145, 138, 127][i] || 130,
    heartRateMax: [195, 192, 188, 182, 194, 185, 180, 196, 189, 191, 193, 187][i] || 190,
    speed: [28.4, 31.2, 24.1, 5.2, 30.8, 0, 0, 27.5, 26.9, 25.3, 29.1, 28.7][i] || 0,
    distance: [8.4, 9.1, 7.2, 1.1, 8.9, 0, 0, 8.6, 9.3, 7.8, 8.2, 8.5][i] || 0,
    acceleration: [3.2, 3.8, 2.9, 0.4, 3.5, 0, 0, 3.1, 3.4, 2.8, 3.3, 3.0][i] || 0,
    fatigue: [68, 45, 38, 82, 52, 15, 95, 71, 43, 55, 40, 62][i] || 50,
  }));

  await db.insert(wearableDataTable).values(wearables);

  const medicals = insertedPlayers.map((p, i) => ({
    playerId: p.id,
    bloodType: ["A+", "O+", "B+", "AB+", "A-", "O+", "B-", "A+", "O-", "AB+", "A+", "O+"][i] || "A+",
    allergies: [["Ibuprofene"], [], ["Penicillina"], [], [], [], ["Lattosio"], [], [], ["Aspirina"], [], []][i] || [],
    medications: [["Omega-3", "Vitamina D"], [], ["Magnesio"], ["Antinfiammatori"], [], [], ["Antidolorifico"], [], ["Vitamina C"], [], [], ["Vitamina B12"]][i] || [],
    notes: [
      "Storia di lesioni al ginocchio. Monitorare attentamente.",
      "Nessuna condizione preesistente.",
      "Tendenza alle crampi muscolari.",
      "In recupero da distorsione alla caviglia sinistra.",
      "Ottima forma fisica generale.",
      "Recente visita di controllo senza anomalie.",
      "Rottura legamento crociato, operato. In fase riabilitativa.",
      "Lieve ipermobilità articolare.",
      "Ottima condizione fisica.",
      "Problema cronico alla schiena. Fisioterapia settimanale.",
      "Nessuna nota particolare.",
      "Condizione eccellente.",
    ][i] || "",
    lastExamDate: "2026-03-15",
    clearanceStatus: ["cleared", "cleared", "cleared", "restricted", "cleared", "cleared", "not-cleared", "cleared", "cleared", "restricted", "cleared", "cleared"][i] as "cleared" | "restricted" | "not-cleared",
  }));

  await db.insert(medicalRecordsTable).values(medicals);

  await db.insert(injuryHistoryTable).values([
    { playerId: insertedPlayers[0].id, type: "Lesione menisco sinistro", date: "2024-09-12", recovered: 1, notes: "Operazione e 3 mesi di recupero" },
    { playerId: insertedPlayers[0].id, type: "Stiramento muscolo retto femorale", date: "2025-11-03", recovered: 1, notes: "Recupero in 3 settimane" },
    { playerId: insertedPlayers[3].id, type: "Distorsione caviglia sinistra grado II", date: "2026-02-20", recovered: 0, notes: "In fase di recupero, previsto ritorno il 15 aprile" },
    { playerId: insertedPlayers[6].id, type: "Rottura legamento crociato anteriore destro", date: "2025-08-05", recovered: 0, notes: "Operazione a settembre. Terapia riabilitativa in corso." },
    { playerId: insertedPlayers[9].id, type: "Ernia del disco L4-L5", date: "2024-06-18", recovered: 1, notes: "Gestita con fisioterapia e iniezioni" },
    { playerId: insertedPlayers[7].id, type: "Contusione coscia sinistra", date: "2025-12-10", recovered: 1, notes: "Recupero rapido in 10 giorni" },
  ]);

  const sessions = await db.insert(sessionsTable).values([
    { type: "training", date: "2026-03-27", duration: 90, description: "Allenamento tattico pre-partita. Focus su pressing alto e transizioni.", status: "completed" },
    { type: "match", date: "2026-03-24", duration: 96, description: "Serie A - Giornata 29 vs Juventus FC. Vittoria 2-1.", status: "completed" },
    { type: "training", date: "2026-03-26", duration: 60, description: "Sessione di recupero e scarico post-partita.", status: "completed" },
    { type: "training", date: "2026-03-28", duration: 90, description: "Allenamento tecnico: cross e finalizzazione.", status: "scheduled" },
    { type: "recovery", date: "2026-03-25", duration: 45, description: "Sessione rigenerativa: idroterapia e stretching.", status: "completed" },
    { type: "match", date: "2026-03-31", duration: 90, description: "Serie A - Giornata 30 vs Inter Milan. Partita in casa.", status: "scheduled" },
  ]).returning();

  const activePlayerIds = insertedPlayers.filter((p) => p.status !== "injured").map((p) => p.id);

  for (const s of sessions) {
    const ids = s.status === "scheduled" ? activePlayerIds : activePlayerIds.slice(0, 9);
    for (const pid of ids) {
      await db.insert(sessionPlayersTable).values({ sessionId: s.id, playerId: pid });
    }
  }

  const movementTypes = ["Sprint", "Cambio direzione", "Tiro in porta", "Contrasto", "Ricezione", "Salto", "Dribbling", "Passaggio lungo"];
  const issues = [
    ["Rotazione eccessiva del ginocchio", "Postura del busto inclinata"],
    ["Sovraccarico del tendine d'Achille"],
    ["Tecnica di calcio sbilanciata", "Posizione del piede non ottimale"],
    ["Impatto con carico errato sulla colonna"],
    [],
    ["Atterraggio asimmetrico", "Stress articolare caviglia"],
    [],
    ["Tensione lombare elevata"],
  ];
  const bodyPartMap: Record<string, string[]> = {
    "Sprint": ["Quadricipiti", "Tendine d'Achille", "Polpacci"],
    "Cambio direzione": ["Ginocchio", "Caviglia", "Anca"],
    "Tiro in porta": ["Piede", "Anca", "Core"],
    "Contrasto": ["Colonna vertebrale", "Ginocchio"],
    "Ricezione": ["Piede", "Caviglia"],
    "Salto": ["Caviglia", "Ginocchio", "Core"],
    "Dribbling": ["Piede", "Caviglia"],
    "Passaggio lungo": ["Lombari", "Anca", "Piede"],
  };

  const analysisRows = [];
  const completedSessions = sessions.filter((s) => s.status === "completed");

  for (const session of completedSessions) {
    const sessionPlayers = activePlayerIds.slice(0, 8);
    for (const playerId of sessionPlayers) {
      const numAnalyses = Math.floor(Math.random() * 3) + 2;
      for (let k = 0; k < numAnalyses; k++) {
        const mtype = movementTypes[Math.floor(Math.random() * movementTypes.length)];
        const issue = issues[movementTypes.indexOf(mtype)] || [];
        const isCorrect = issue.length === 0 || Math.random() > 0.45;
        const riskScore = isCorrect ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 45) + 45;
        analysisRows.push({
          playerId,
          sessionId: session.id,
          timestamp: new Date(session.date).toISOString(),
          movementType: mtype,
          correct: isCorrect ? 1 : 0,
          riskScore,
          detectedIssues: isCorrect ? [] : issue,
          bodyParts: bodyPartMap[mtype] || ["Anca"],
          recommendation: isCorrect
            ? "Esecuzione corretta. Continuare con il protocollo attuale."
            : `Correggere la tecnica: ${issue[0] || "revisione posturale raccomandata"}. Consultare il fisioterapista.`,
          confidence: Math.round((0.82 + Math.random() * 0.16) * 100) / 100,
        });
      }
    }
  }
  await db.insert(movementAnalysisTable).values(analysisRows);

  const protocols = await db.insert(preventionProtocolsTable).values([
    { playerId: insertedPlayers[0].id, title: "Rinforzo Legamento e Ginocchio", category: "strength", frequency: "3x a settimana", priority: "critical" },
    { playerId: insertedPlayers[0].id, title: "Stretching Preventivo Pre-Allenamento", category: "stretching", frequency: "Quotidiano", priority: "high" },
    { playerId: insertedPlayers[3].id, title: "Riabilitazione Caviglia", category: "recovery", frequency: "Quotidiano", priority: "critical" },
    { playerId: insertedPlayers[6].id, title: "Fisioterapia LCA", category: "recovery", frequency: "2x al giorno", priority: "critical" },
    { playerId: insertedPlayers[7].id, title: "Mobilità Articolare", category: "mobility", frequency: "3x a settimana", priority: "medium" },
    { playerId: insertedPlayers[9].id, title: "Rinforzo Core e Schiena", category: "strength", frequency: "4x a settimana", priority: "high" },
    { playerId: insertedPlayers[1].id, title: "Warm-up Esplosività", category: "warm-up", frequency: "Prima di ogni allenamento", priority: "medium" },
  ]).returning();

  await db.insert(exercisesTable).values([
    { protocolId: protocols[0].id, name: "Squat monopodalico", sets: 3, reps: "12", duration: "15 min", notes: "Focus su stabilizzazione del ginocchio" },
    { protocolId: protocols[0].id, name: "Leg press controllata", sets: 4, reps: "10", duration: "20 min", notes: "Carico progressivo" },
    { protocolId: protocols[0].id, name: "Esercizi propriocettivi su tavoletta", sets: 3, reps: "60 sec", duration: "10 min", notes: "Occhi aperti e chiusi" },
    { protocolId: protocols[1].id, name: "Stretching quadricipiti", sets: 2, reps: "30 sec", duration: "5 min", notes: "Tenere la posizione staticamente" },
    { protocolId: protocols[1].id, name: "Stiramento catena posteriore", sets: 2, reps: "45 sec", duration: "8 min", notes: "Respirazione profonda" },
    { protocolId: protocols[2].id, name: "Esercizi di mobilità caviglia", sets: 3, reps: "15", duration: "10 min", notes: "Rotazioni controllate" },
    { protocolId: protocols[2].id, name: "Rinforzo peronieri", sets: 3, reps: "20", duration: "12 min", notes: "Con elastico" },
    { protocolId: protocols[3].id, name: "Elettrostimolazione quadricipite", sets: 1, reps: "20 min", duration: "20 min", notes: "Bassa intensità, fase infiammatoria" },
    { protocolId: protocols[3].id, name: "Mobilità passiva ginocchio", sets: 3, reps: "10", duration: "15 min", notes: "Assistito dal fisioterapista" },
    { protocolId: protocols[4].id, name: "Rotazioni articolari complete", sets: 2, reps: "10 per articolazione", duration: "15 min", notes: "Lente e controllate" },
    { protocolId: protocols[5].id, name: "Plank con varianti", sets: 4, reps: "45 sec", duration: "15 min", notes: "Laterale e frontale" },
    { protocolId: protocols[5].id, name: "Bird-dog", sets: 3, reps: "12 per lato", duration: "10 min", notes: "Stabilizzazione lombare" },
    { protocolId: protocols[6].id, name: "Attivazione gluti", sets: 2, reps: "15", duration: "5 min", notes: "Resistenza elastica" },
    { protocolId: protocols[6].id, name: "Salti pliometrici leggeri", sets: 3, reps: "8", duration: "8 min", notes: "Atterraggio controllato" },
  ]);

  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
