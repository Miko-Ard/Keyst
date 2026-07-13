import { prisma } from "./prisma";
import type { AchievementDTO, Feeling, SessionDTO } from "./types";
import { ACHIEVEMENT_DEFS } from "./achievements";
import { computeStreak } from "./stats";

export async function getSessions(): Promise<SessionDTO[]> {
  const rows = await prisma.session.findMany({ orderBy: { date: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    wpm: r.wpm,
    rawWpm: r.rawWpm,
    accuracy: r.accuracy,
    duration: r.duration,
    feeling: r.feeling as Feeling,
    notes: r.notes,
  }));
}

/**
 * Recomputes which achievements are unlocked from current session data,
 * persists newly unlocked ones, and returns the full catalog.
 */
export async function syncAchievements(
  sessions: SessionDTO[]
): Promise<AchievementDTO[]> {
  const streak = computeStreak(sessions);

  // Ensure catalog rows exist.
  const existing = await prisma.achievement.findMany();
  const existingByKey = new Map(existing.map((a) => [a.key, a]));

  const result: AchievementDTO[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    const earned = def.earned(sessions, streak);
    const row = existingByKey.get(def.key);

    if (!row) {
      const created = await prisma.achievement.create({
        data: {
          key: def.key,
          title: def.title,
          description: def.description,
          emoji: def.emoji,
          tone: def.tone,
          unlocked: earned,
          unlockedAt: earned ? new Date() : null,
        },
      });
      result.push(toAchievementDTO(created));
      continue;
    }

    if (earned && !row.unlocked) {
      const updated = await prisma.achievement.update({
        where: { key: def.key },
        data: { unlocked: true, unlockedAt: new Date() },
      });
      result.push(toAchievementDTO(updated));
    } else {
      result.push(toAchievementDTO(row));
    }
  }

  // Preserve catalog order defined in ACHIEVEMENT_DEFS.
  const order = new Map(ACHIEVEMENT_DEFS.map((d, i) => [d.key, i]));
  result.sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0));
  return result;
}

function toAchievementDTO(a: {
  id: string;
  key: string;
  title: string;
  description: string;
  emoji: string;
  tone: string;
  unlocked: boolean;
  unlockedAt: Date | null;
}): AchievementDTO {
  return {
    id: a.id,
    key: a.key,
    title: a.title,
    description: a.description,
    emoji: a.emoji,
    tone: a.tone as AchievementDTO["tone"],
    unlocked: a.unlocked,
    unlockedAt: a.unlockedAt ? a.unlockedAt.toISOString() : null,
  };
}
