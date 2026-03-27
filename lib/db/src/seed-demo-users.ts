import { db } from "./index";
import { usersTable } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const DEMO_USERS = [
  { name: "Coach Carter", email: "coach@ari.ai", role: "Head Coach" },
  { name: "Coach Mancini", email: "mancini@ari.ai", role: "Fitness Coach" },
  { name: "Coach García", email: "garcia@ari.ai", role: "Analytics Coach" },
];

const PASSWORD = "coach123";

async function seedDemoUsers() {
  const hash = await bcrypt.hash(PASSWORD, 12);
  for (const u of DEMO_USERS) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, u.email));
    if (!existing) {
      await db.insert(usersTable).values({ name: u.name, email: u.email, passwordHash: hash, role: u.role, provider: "local" });
      console.log(`Created demo user: ${u.email}`);
    } else {
      console.log(`Demo user already exists: ${u.email}`);
    }
  }
  process.exit(0);
}

seedDemoUsers().catch(e => { console.error(e); process.exit(1); });
