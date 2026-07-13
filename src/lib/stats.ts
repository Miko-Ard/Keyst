import type { SessionDTO, Stats } from "./types";
import { GOAL_WPM } from "./achievements";

/** Local YYYY-MM-DD key for a date. */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Consecutive-day streak counting back from today (or yesterday, so a streak
 * stays alive until the end of the following day).
 */
export function computeStreak(sessions: SessionDTO[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dayKey(new Date(s.date))));

  const today = new Date();
  const todayKey = dayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Anchor: if practiced today start there, else if practiced yesterday start there.
  let cursor: Date;
  if (days.has(todayKey)) cursor = today;
  else if (days.has(dayKey(yesterday))) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeStats(sessions: SessionDTO[]): Stats {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) {
    return {
      currentWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      currentStreak: 0,
      totalSessions: 0,
      wpmDelta: 0,
      goal: GOAL_WPM,
      goalProgress: 0,
      todayWpm: null,
    };
  }

  const latest = sorted[sorted.length - 1];
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const bestWpm = Math.max(...sorted.map((s) => s.wpm));

  // Average accuracy over the last 10 sessions for a stable, recent read.
  const recent = sorted.slice(-10);
  const avgAccuracy =
    recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;

  const streak = computeStreak(sorted);

  const todayKey = dayKey(new Date());
  const todaySession = sorted.find((s) => dayKey(new Date(s.date)) === todayKey);

  return {
    currentWpm: latest.wpm,
    bestWpm,
    avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    currentStreak: streak,
    totalSessions: sorted.length,
    wpmDelta: prev ? latest.wpm - prev.wpm : 0,
    goal: GOAL_WPM,
    goalProgress: Math.min(1, bestWpm / GOAL_WPM),
    todayWpm: todaySession ? todaySession.wpm : null,
  };
}
