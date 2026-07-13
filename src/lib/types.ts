export type Feeling =
  | "calm"
  | "focused"
  | "tired"
  | "frustrated"
  | "energized";

export interface SessionDTO {
  id: string;
  date: string; // ISO
  wpm: number;
  rawWpm: number;
  accuracy: number;
  duration: number; // seconds
  language: string;
  testDuration: number; // selected test length in seconds
  feeling: Feeling;
  notes: string;
}

export interface AchievementDTO {
  id: string;
  key: string;
  title: string;
  description: string;
  emoji: string;
  tone: "sage" | "lavender" | "blue" | "card";
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface Stats {
  currentWpm: number;
  bestWpm: number;
  avgAccuracy: number;
  currentStreak: number;
  totalSessions: number;
  wpmDelta: number; // vs previous session
  goal: number;
  goalProgress: number; // 0..1 toward goal based on best recent
  todayWpm: number | null;
}

export const FEELINGS: {
  value: Feeling;
  label: string;
  emoji: string;
}[] = [
  { value: "calm", label: "Calm", emoji: "🌿" },
  { value: "focused", label: "Focused", emoji: "🎯" },
  { value: "energized", label: "Energized", emoji: "✨" },
  { value: "tired", label: "Tired", emoji: "🌙" },
  { value: "frustrated", label: "Frustrated", emoji: "🌧" },
];

export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "indonesian", label: "Indonesian" },
] as const;

export const DURATIONS = [15, 30, 60, 120] as const;
