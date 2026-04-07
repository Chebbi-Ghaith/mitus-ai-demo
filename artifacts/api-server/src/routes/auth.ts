import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";

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

const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().min(1).email(),
  password: z.string().min(6),
  role: z.string().optional().default("Head Coach"),
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


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
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid registration data provided." });
    return;
  }
  const { name, email, password, role } = result.data;

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
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  const { email, password } = result.data;

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

  // Verify the Google JWT via google-auth-library
  let googleUser: { sub: string; email: string; name: string; picture?: string } | null = null;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) throw new Error("Missing payload fields");
    googleUser = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture,
    };
  } catch (err: any) {
    req.log?.error({ err }, "Google Token verification failed");
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
