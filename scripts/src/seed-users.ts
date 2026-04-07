import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const DEMO_USERS = [
  { name: "Coach Carter", email: "coach@ari.ai", role: "Head Coach" },
  { name: "Coach Mancini", email: "mancini@ari.ai", role: "Fitness Coach" },
  { name: "Coach García", email: "garcia@ari.ai", role: "Analytics Coach" },
];

async function seedUsers() {
  console.log("Seeding demo users...");
  const hash = await bcrypt.hash("coach123", 12);

  for (const u of DEMO_USERS) {
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, u.email));
    if (!existing) {
      await db.insert(usersTable).values({
        name: u.name,
        email: u.email,
        passwordHash: hash,
        role: u.role,
        provider: "local",
      });
      console.log(`✓ Created: ${u.email}`);
    } else {
      // Update password hash to ensure it's correct
      await db
        .update(usersTable)
        .set({ passwordHash: hash })
        .where(eq(usersTable.email, u.email));
      console.log(`↺ Updated: ${u.email}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

seedUsers().catch((e) => {
  console.error(e);
  process.exit(1);
});
