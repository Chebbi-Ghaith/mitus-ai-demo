# Ari — Sports Analytics Dashboard

## Overview

AI-powered football (soccer) player performance analytics platform for coaches. Identifies individual players via Computer Vision, analyzes movements during matches and training, detects incorrect movements and injury risk, and suggests prevention protocols.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/ari-dashboard), Tailwind CSS, Recharts, Framer Motion, Radix UI
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── ari-dashboard/        # React + Vite frontend (Ari dashboard)
│   └── api-server/           # Express API server
├── lib/
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas
│   └── db/                   # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts           # Database seed script
└── attached_assets/          # Demo GIFs (copied to ari-dashboard/public/demo/)
```

## Features

- **Dashboard**: Team overview KPIs, fatigue trend chart, high-risk player alerts
- **Squad (Players)**: Full squad grid with injury risk badges, position, fatigue and status
- **Player Profile**: Tabs for Overview (vitals, wearable), Medical Record, Prevention Protocols
- **Sessions**: Training/match/recovery session log with CV analysis links
- **CV Analysis (Live Feed)**: Simulated Computer Vision tracking with real-time event stream

## Database Schema

- `players` - Player profiles (name, position, number, nationality, height, weight, muscle mass, injury risk, status)
- `wearable_data` - Live wearable metrics per player (heart rate, speed, distance, acceleration, fatigue)
- `medical_records` - Medical records per player (blood type, allergies, medications, clearance status)
- `injury_history` - Injury history records per player
- `sessions` - Training/match/recovery sessions
- `session_players` - Many-to-many player participation in sessions
- `movement_analysis` - AI-detected movement events per player per session
- `prevention_protocols` - AI-suggested prevention programs per player
- `exercises` - Exercises within each protocol

## API Endpoints

- `GET /api/players` — list all players with wearable data
- `GET /api/players/:id` — player detail
- `POST /api/players` — create player
- `PUT /api/players/:id` — update player
- `GET /api/players/:id/medical` — medical record
- `PUT /api/players/:id/medical` — update medical record
- `GET /api/players/:id/analysis` — movement analyses for player
- `GET /api/players/:id/protocols` — prevention protocols for player
- `GET /api/sessions` — list all sessions
- `POST /api/sessions` — create session
- `GET /api/sessions/:id` — session detail
- `GET /api/sessions/:id/analysis` — movement analysis for session
- `GET /api/dashboard/stats` — team dashboard statistics
- `GET /api/healthz` — health check

## Seed Data

Run: `pnpm --filter @workspace/scripts run seed`
Seeds 12 players with Italian/European names, wearable data, medical records, injury history, sessions, movement analyses, and prevention protocols.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.
- Run `pnpm run typecheck` from root
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`
