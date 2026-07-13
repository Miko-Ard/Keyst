import type { SessionDTO } from "./types";

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  emoji: string;
  tone: "sage" | "lavender" | "blue" | "card";
  /** Returns true when the set of sessions satisfies the achievement. */
  earned: (sessions: SessionDTO[], streak: number) => boolean;
}

export const GOAL_WPM = 100;

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    key: "first-session",
    title: "First Session",
    description: "Logged your very first practice.",
    emoji: "🌱",
    tone: "sage",
    earned: (s) => s.length >= 1,
  },
  {
    key: "wpm-80",
    title: "First 80 WPM",
    description: "Crossed 80 words per minute.",
    emoji: "🏅",
    tone: "card",
    earned: (s) => s.some((x) => x.wpm >= 80),
  },
  {
    key: "wpm-90",
    title: "First 90 WPM",
    description: "Crossed 90 words per minute.",
    emoji: "🏅",
    tone: "lavender",
    earned: (s) => s.some((x) => x.wpm >= 90),
  },
  {
    key: "wpm-100",
    title: "The 100 Club",
    description: "Reached the 100 WPM goal.",
    emoji: "👑",
    tone: "blue",
    earned: (s) => s.some((x) => x.wpm >= 100),
  },
  {
    key: "accuracy-98",
    title: "98% Accuracy",
    description: "A near-flawless session.",
    emoji: "🎯",
    tone: "sage",
    earned: (s) => s.some((x) => x.accuracy >= 98),
  },
  {
    key: "streak-7",
    title: "7 Day Streak",
    description: "Practiced seven days in a row.",
    emoji: "🔥",
    tone: "card",
    earned: (_s, streak) => streak >= 7,
  },
  {
    key: "streak-14",
    title: "14 Day Streak",
    description: "Two calm, consistent weeks.",
    emoji: "🌿",
    tone: "lavender",
    earned: (_s, streak) => streak >= 14,
  },
  {
    key: "sessions-25",
    title: "Dedicated",
    description: "Twenty-five sessions logged.",
    emoji: "📚",
    tone: "blue",
    earned: (s) => s.length >= 25,
  },
];
