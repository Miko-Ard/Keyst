import { PrismaClient } from "@prisma/client";
import { ACHIEVEMENT_DEFS } from "../src/lib/achievements";

const prisma = new PrismaClient();

/**
 * Wipes all sessions and re-creates the achievement catalog in a locked state.
 * Use this to start monitoring your own practice from a clean slate.
 */
async function main() {
  console.log("Resetting Keyst to a clean slate…");

  await prisma.session.deleteMany();
  await prisma.achievement.deleteMany();

  for (const def of ACHIEVEMENT_DEFS) {
    await prisma.achievement.create({
      data: {
        key: def.key,
        title: def.title,
        description: def.description,
        emoji: def.emoji,
        tone: def.tone,
        unlocked: false,
        unlockedAt: null,
      },
    });
  }

  console.log("  ✓ 0 sessions");
  console.log(`  ✓ ${ACHIEVEMENT_DEFS.length} achievements (all locked)`);
  console.log("Done. Log your first session to begin.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
