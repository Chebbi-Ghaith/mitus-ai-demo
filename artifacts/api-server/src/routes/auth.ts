import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatarUrl: string | null;
    };
  }
}

const router: IRouter = Router();

function safeUser(u: { id: string; name: string; email: string; role: string; avatarUrl: string | null }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatarUrl: u.avatarUrl };
}

// GET /api/auth/me
router.get("/auth/me", (req: Request, res: Response) => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(req.session.user);
});

// POST /api/auth/register
router.post("/auth/register", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as Record<string, string>;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use." });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    role: role || "Head Coach",
    provider: "local",
  }).returning();
  req.session.user = safeUser({ ...user, avatarUrl: user.avatarUrl ?? null });
  res.status(201).json(req.session.user);
});

// POST /api/auth/login
router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  req.session.user = safeUser({ ...user, avatarUrl: user.avatarUrl ?? null });
  res.json(req.session.user);
});

// POST /api/auth/google
router.post("/auth/google", async (req: Request, res: Response) => {
  const { credential } = req.body as { credential: string };
  if (!credential) {
    res.status(400).json({ error: "Google credential is required." });
    return;
  }

  // Verify the Google JWT via tokeninfo endpoint
  let googleUser: { sub: string; email: string; name: string; picture?: string } | null = null;
  try {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Token verification failed");
    googleUser = await r.json() as { sub: string; email: string; name: string; picture?: string };
  } catch {
    res.status(401).json({ error: "Invalid Google credential." });
    return;
  }

  if (!googleUser?.sub || !googleUser?.email) {
    res.status(401).json({ error: "Google credential missing required fields." });
    return;
  }

  // Upsert user
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, googleUser.email));
  let user = existing[0];

  if (!user) {
    [user] = await db.insert(usersTable).values({
      name: googleUser.name || googleUser.email,
      email: googleUser.email,
      role: "Head Coach",
      provider: "google",
      googleId: googleUser.sub,
      avatarUrl: googleUser.picture ?? null,
    }).returning();
  } else if (!user.googleId) {
    await db.update(usersTable)
      .set({ googleId: googleUser.sub, provider: "google", avatarUrl: googleUser.picture ?? user.avatarUrl })
      .where(eq(usersTable.id, user.id));
    user = { ...user, googleId: googleUser.sub, provider: "google", avatarUrl: googleUser.picture ?? user.avatarUrl };
  }

  req.session.user = safeUser({ ...user, avatarUrl: user.avatarUrl ?? null });
  res.json(req.session.user);
});

// POST /api/auth/logout
router.post("/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
