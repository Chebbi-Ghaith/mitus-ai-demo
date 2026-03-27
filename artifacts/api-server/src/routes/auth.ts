import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const router: IRouter = Router();

const SALT_ROUNDS = 12;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  try {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db.insert(usersTable).values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "coach",
      provider: "local",
    }).returning();

    // Set session
    (req as any).session.userId = user.id;
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    (req as any).session.userId = user.id;
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// POST /api/auth/google — validate Google ID token
router.post("/auth/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Google credential is required." });
  }
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    return res.status(501).json({ error: "Google OAuth is not configured on this server." });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: "Invalid Google token." });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (!user) {
      [user] = await db.insert(usersTable).values({
        name: name ?? email,
        email: email.toLowerCase(),
        provider: "google",
        googleId,
        avatarUrl: picture,
        role: "coach",
      }).returning();
    } else if (!user.googleId) {
      // Link Google to existing account
      [user] = await db.update(usersTable).set({ googleId, avatarUrl: picture, provider: "google" })
        .where(eq(usersTable.id, user.id)).returning();
    }

    (req as any).session.userId = user.id;
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    req.log.error({ err }, "Google auth failed");
    return res.status(401).json({ error: "Google authentication failed." });
  }
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  const userId = (req as any).session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      (req as any).session.destroy(() => {});
      return res.status(401).json({ error: "User not found." });
    }
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
