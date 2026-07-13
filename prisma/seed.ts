import { PrismaClient } from "@prisma/client";
import { ACHIEVEMENT_DEFS } from "../src/lib/achievements";

const prisma = new PrismaClient();

type Feeling = "calm" | "focused" | "tired" | "frustrated" | "energized";

const FEELINGS: Feeling[] = [
  "calm",
  "focused",
  "energized",
  "tired",
  "frustrated",
];

const NOTES = [
  "Warm-up felt smooth today.",
  "Focused on accuracy over speed.",
  "Numbers row still slowing me down.",
  "Good rhythm on common words.",
  "Tried to relax my shoulders and breathe.",
  "Punctuation drills — getting cleaner.",
  "A little tired but pushed through calmly.",
  "New personal best, felt effortless.",
  "Slowed down deliberately, fewer errors.",
  "Short session, quality over quantity.",
  "",
  "",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// A gentle upward WPM curve from ~72 to ~96 with natural variance.
function wpmForDay(index: number, total: number): number {
  const t = index / (total - 1);
  const base = 72 + t * 24; // 72 -> 96
  const wobble = Math.sin(index * 1.7) * 2.4 + Math.cos(index * 0.9) * 1.6;
  return Math.round(base + wobble);
}

async function main() {
  console.log("Seeding Keyst…");

  await prisma.session.deleteMany();
  await prisma.achievement.deleteMany();

  const DAYS = 30;
  const today = new Date();
  today.setHours(9, 30, 0, 0);

  const sessions: {
    date: Date;
    wpm: number;
    rawWpm: number;
    accuracy: number;
    duration: number;
    feeling: string;
    notes: string;
  }[] = [];

  for (let i = 0; i < DAYS; i++) {
    // Skip a couple of rest days to keep the streak realistic (not skipping recent days).
    if (i === 9 || i === 19) continue;

    const dayOffset = DAYS - 1 - i;
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    // vary the practice hour a little
    date.setHours(8 + (i % 5), (i * 7) % 60, 0, 0);

    const wpm = wpmForDay(i, DAYS);
    const accuracy =
      Math.round((94 + (i / DAYS) * 4 + Math.sin(i * 2.1) * 1.2) * 10) / 10;
    const clampedAcc = Math.min(99.6, Math.max(92, accuracy));
    const rawWpm = Math.round(wpm * (1 + (100 - clampedAcc) / 100) + 2);
    const duration = 60 * (2 + (i % 4)); // 2–5 minutes

    sessions.push({
      date,
      wpm,
      rawWpm,
      accuracy: clampedAcc,
      duration,
      feeling: pick(FEELINGS, i + (i % 3)),
      notes: pick(NOTES, i * 3),
    });
  }

  await prisma.session.createMany({ data: sessions });
  console.log(`  ✓ ${sessions.length} sessions`);

  // Seed achievement catalog and mark those earned by the seeded data.
  const dto = sessions.map((s) => ({
    id: "",
    date: s.date.toISOString(),
    wpm: s.wpm,
    rawWpm: s.rawWpm,
    accuracy: s.accuracy,
    duration: s.duration,
    feeling: s.feeling as Feeling,
    notes: s.notes,
  }));

  // rough streak for seeding = trailing consecutive days
  const dayKeys = new Set(
    dto.map((s) => new Date(s.date).toISOString().slice(0, 10))
  );
  let streak = 0;
  const cursor = new Date();
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  for (const def of ACHIEVEMENT_DEFS) {
    const unlocked = def.earned(dto as any, streak);
    await prisma.achievement.create({
      data: {
        key: def.key,
        title: def.title,
        description: def.description,
        emoji: def.emoji,
        tone: def.tone,
        unlocked,
        unlockedAt: unlocked ? new Date() : null,
      },
    });
  }
  console.log(`  ✓ ${ACHIEVEMENT_DEFS.length} achievements`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
