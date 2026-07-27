import type {
  Feeling,
  FeelingStat,
  LanguageStat,
  PeriodFilter,
  PeriodStats,
  SessionDTO,
  Stats,
} from "./types";
import { FEELINGS, LANGUAGES } from "./types";
import { GOAL_WPM } from "./achievements";

/** Timezone-aware YYYY-MM-DD key for a date. */
export function dayKey(d: Date, timeZone?: string): string {
  try {
    const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(d);
  } catch {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
}

/** Get start of day/week/month bounds in milliseconds */
export function isSessionInPeriod(
  sessionDate: Date,
  period: PeriodFilter,
  now: Date = new Date()
): boolean {
  if (period === "all") return true;

  const sessionTime = sessionDate.getTime();
  const nowTime = now.getTime();

  if (period === "daily") {
    // Within last 24 hours or same calendar day
    const oneDayMs = 24 * 60 * 60 * 1000;
    return nowTime - sessionTime <= oneDayMs;
  }

  if (period === "weekly") {
    // Within last 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return nowTime - sessionTime <= sevenDaysMs;
  }

  if (period === "monthly") {
    // Within last 30 days
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return nowTime - sessionTime <= thirtyDaysMs;
  }

  return true;
}

/**
 * Consecutive-day streak counting back from today (or yesterday).
 */
export function computeStreak(sessions: SessionDTO[], timeZone?: string): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dayKey(new Date(s.date), timeZone)));

  const today = new Date();
  const todayKey = dayKey(today, timeZone);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let cursor: Date;
  if (days.has(todayKey)) cursor = today;
  else if (days.has(dayKey(yesterday, timeZone))) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (days.has(dayKey(cursor, timeZone))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeStats(sessions: SessionDTO[], customGoal?: number): Stats {
  const goal = customGoal || GOAL_WPM;
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
      goal,
      goalProgress: 0,
      todayWpm: null,
      totalDurationSec: 0,
    };
  }

  const latest = sorted[sorted.length - 1];
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const bestWpm = Math.max(...sorted.map((s) => s.wpm));

  const recent = sorted.slice(-10);
  const avgAccuracy =
    recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;

  const streak = computeStreak(sorted);
  const totalDurationSec = sorted.reduce((sum, s) => sum + (s.duration || 0), 0);

  const todayKey = dayKey(new Date());
  const todaySession = sorted.find((s) => dayKey(new Date(s.date)) === todayKey);

  return {
    currentWpm: latest.wpm,
    bestWpm,
    avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    currentStreak: streak,
    totalSessions: sorted.length,
    wpmDelta: prev ? latest.wpm - prev.wpm : 0,
    goal,
    goalProgress: Math.min(1, bestWpm / goal),
    todayWpm: todaySession ? todaySession.wpm : null,
    totalDurationSec,
  };
}

/**
 * Computes aggregated statistics for a specified time period (daily, weekly, monthly, all).
 */
export function computePeriodStats(
  sessions: SessionDTO[],
  period: PeriodFilter,
  timeZone?: string
): PeriodStats {
  const now = new Date();
  const filtered = sessions.filter((s) =>
    isSessionInPeriod(new Date(s.date), period, now)
  );

  if (filtered.length === 0) {
    return {
      period,
      sessionCount: 0,
      totalDurationSec: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      languages: [],
      feelings: [],
      wpmTrendDelta: 0,
    };
  }

  const totalDurationSec = filtered.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgWpm = Math.round(
    filtered.reduce((acc, s) => acc + s.wpm, 0) / filtered.length
  );
  const bestWpm = Math.max(...filtered.map((s) => s.wpm));
  const avgAccuracy =
    Math.round(
      (filtered.reduce((acc, s) => acc + s.accuracy, 0) / filtered.length) * 10
    ) / 10;

  // Language Breakdown
  const langMap = new Map<string, { count: number; totalWpm: number; bestWpm: number }>();
  filtered.forEach((s) => {
    const lang = s.language || "english";
    const cur = langMap.get(lang) || { count: 0, totalWpm: 0, bestWpm: 0 };
    langMap.set(lang, {
      count: cur.count + 1,
      totalWpm: cur.totalWpm + s.wpm,
      bestWpm: Math.max(cur.bestWpm, s.wpm),
    });
  });

  const languages: LanguageStat[] = Array.from(langMap.entries()).map(([lang, val]) => {
    const labelObj = LANGUAGES.find((l) => l.value === lang);
    return {
      language: lang,
      label: labelObj ? labelObj.label : lang.charAt(0).toUpperCase() + lang.slice(1),
      sessionCount: val.count,
      avgWpm: Math.round(val.totalWpm / val.count),
      bestWpm: val.bestWpm,
    };
  });

  // Feeling Breakdown
  const feelingMap = new Map<
    Feeling,
    { count: number; totalWpm: number; totalAcc: number }
  >();

  filtered.forEach((s) => {
    const f = s.feeling || "focused";
    const cur = feelingMap.get(f) || { count: 0, totalWpm: 0, totalAcc: 0 };
    feelingMap.set(f, {
      count: cur.count + 1,
      totalWpm: cur.totalWpm + s.wpm,
      totalAcc: cur.totalAcc + s.accuracy,
    });
  });

  const feelings: FeelingStat[] = Array.from(feelingMap.entries()).map(
    ([f, val]) => {
      const meta = FEELINGS.find((item) => item.value === f) || {
        label: f,
        emoji: "🎯",
      };
      return {
        feeling: f,
        label: meta.label,
        emoji: meta.emoji,
        sessionCount: val.count,
        avgWpm: Math.round(val.totalWpm / val.count),
        avgAccuracy: Math.round((val.totalAcc / val.count) * 10) / 10,
      };
    }
  );

  // Compute trend delta (compared to prior session or period half)
  const half = Math.floor(filtered.length / 2);
  let wpmTrendDelta = 0;
  if (half > 0) {
    const firstHalfAvg =
      filtered.slice(0, half).reduce((a, b) => a + b.wpm, 0) / half;
    const secondHalfAvg =
      filtered.slice(half).reduce((a, b) => a + b.wpm, 0) / (filtered.length - half);
    wpmTrendDelta = Math.round(secondHalfAvg - firstHalfAvg);
  }

  return {
    period,
    sessionCount: filtered.length,
    totalDurationSec,
    avgWpm,
    bestWpm,
    avgAccuracy,
    languages,
    feelings,
    wpmTrendDelta,
  };
}
