# Mitus AI — Sports Analytics Dashboard

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

## Authentication

- **Provider**: Custom email/password + Google OAuth
- **Session storage**: `express-session` (in-memory, server-side cookies)
- **Password hashing**: `bcrypt` (10 rounds)
- **Routes**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/google`, `GET /api/auth/me`, `POST /api/auth/logout`
- **Google OAuth**: Frontend uses `@react-oauth/google`. Backend verifies JWT via Google tokeninfo API. Requires `VITE_GOOGLE_CLIENT_ID` env var.
- **Frontend auth context**: `artifacts/ari-dashboard/src/lib/auth.tsx` — `AuthProvider` with `login`, `register`, `loginWithGoogle`, `logout`
- **Login page**: `artifacts/ari-dashboard/src/pages/Login.tsx` — full split-panel Sign In + Sign Up + Google OAuth forms
- **Demo accounts**: coach@ari.ai, mancini@ari.ai, garcia@ari.ai (password: coach123)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── ari-dashboard/        # React + Vite frontend (Mitus AI dashboard)
│   └── api-server/           # Express API server (uses Replit Auth)
├── lib/
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas
│   ├── db/                   # Drizzle ORM schema + DB connection
│   └── replit-auth-web/      # useAuth() hook for browser OIDC state
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

- `users` - Replit Auth user profiles (id=varchar UUID, email, firstName, lastName, profileImageUrl)
- `auth_sessions` - Replit Auth server-side sessions (sid, JSON payload, expire timestamp)
- `players` - Player profiles (name, position, number, nationality, height, weight, muscle mass, injury risk, status)
- `wearable_data` - Live wearable metrics per player (heart rate, speed, distance, acceleration, fatigue)
- `medical_records` - Medical records per player (blood type, allergies, medications, clearance status)
- `injury_history` - Injury history records per player
- `sessions` - Training/match/recovery sessions
- `session_players` - Many-to-many player participation in sessions
- `movement_analysis` - AI-detected movement events per player per session
- `prevention_protocols` - AI-suggested prevention programs per player
- `exercises` - Exercises within each protocol
- `player_integrations` - Wearable provider connections per player (Whoop, Apple, Oura, Garmin)
- `player_documents` - Medical/document uploads per player

## API Endpoints

### Auth (Replit OIDC)
- `GET /api/auth/user` — current auth state (returns `{user: AuthUser | null}`)
- `GET /api/login?returnTo=/` — initiate OIDC login flow (PKCE redirect)
- `GET /api/callback` — OIDC callback, creates session
- `GET /api/logout` — clear session + OIDC end-session redirect

### App
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
