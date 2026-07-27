"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { AchievementDTO, Feeling, SessionDTO } from "@/lib/types";
import { FEELINGS, LANGUAGES } from "@/lib/types";
import { dayKey, computeStats } from "@/lib/stats";
import { formatDayMonth, formatDuration, formatTotalTime } from "@/lib/utils";
import Link from "next/link";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function CalendarView({
  sessions,
  achievements,
}: {
  sessions: SessionDTO[];
  achievements: AchievementDTO[];
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const overallStats = useMemo(() => computeStats(sessions), [sessions]);

  // Map sessions by dayKey (YYYY-MM-DD)
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, SessionDTO[]>();
    sessions.forEach((s) => {
      const k = dayKey(new Date(s.date));
      const list = map.get(k) || [];
      list.push(s);
      map.set(k, list);
    });
    return map;
  }, [sessions]);

  // Map unlocked achievements by dayKey
  const achievementsByDay = useMemo(() => {
    const map = new Map<string, AchievementDTO[]>();
    achievements.forEach((a) => {
      if (a.unlocked && a.unlockedAt) {
        const k = dayKey(new Date(a.unlockedAt));
        const list = map.get(k) || [];
        list.push(a);
        map.set(k, list);
      }
    });
    return map;
  }, [achievements]);

  // Calendar Grid Computation for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const totalDays = lastDayOfMonth.getDate();

    const days: { date: Date; key: string; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, key: dayKey(d), isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, key: dayKey(d), isCurrentMonth: true });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, key: dayKey(d), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDaySessions = useMemo(() => {
    if (!selectedDayKey) return [];
    return sessionsByDay.get(selectedDayKey) || [];
  }, [selectedDayKey, sessionsByDay]);

  const selectedDayAchievements = useMemo(() => {
    if (!selectedDayKey) return [];
    return achievementsByDay.get(selectedDayKey) || [];
  }, [selectedDayKey, achievementsByDay]);

  // Selected Day Aggregated Metrics
  const selectedDayStats = useMemo(() => {
    if (selectedDaySessions.length === 0) return null;

    const totalDurationSec = selectedDaySessions.reduce(
      (acc, s) => acc + (s.duration || 0),
      0
    );
    const avgWpm = Math.round(
      selectedDaySessions.reduce((acc, s) => acc + s.wpm, 0) /
        selectedDaySessions.length
    );
    const bestWpm = Math.max(...selectedDaySessions.map((s) => s.wpm));
    const avgAccuracy =
      Math.round(
        (selectedDaySessions.reduce((acc, s) => acc + s.accuracy, 0) /
          selectedDaySessions.length) *
          10
      ) / 10;

    // Language breakdown
    const langMap = new Map<string, number>();
    selectedDaySessions.forEach((s) => {
      const l = s.language || "english";
      langMap.set(l, (langMap.get(l) || 0) + 1);
    });

    // Feeling breakdown
    const feelingMap = new Map<Feeling, number>();
    selectedDaySessions.forEach((s) => {
      const f = s.feeling || "focused";
      feelingMap.set(f, (feelingMap.get(f) || 0) + 1);
    });

    // Comparison vs overall avg
    const vsAvgPct =
      overallStats.currentWpm > 0
        ? Math.round(
            ((avgWpm - overallStats.currentWpm) / overallStats.currentWpm) * 100
          )
        : 0;

    return {
      sessionCount: selectedDaySessions.length,
      totalDurationSec,
      avgWpm,
      bestWpm,
      avgAccuracy,
      langMap,
      feelingMap,
      vsAvgPct,
    };
  }, [selectedDaySessions, overallStats]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayKeyStr = dayKey(new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="w-full"
    >
      <Card className="p-5 border-border bg-surface shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl tracking-tight text-ink">
              Practice Calendar
            </h2>
            <p className="text-xs text-ink-soft">
              Click dates to view activity
            </p>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-xs text-ink-soft transition-colors hover:text-ink hover:bg-card"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="min-w-[100px] text-center font-display text-sm font-medium text-ink">
              {monthLabel}
            </span>
            <button
              onClick={nextMonth}
              className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-xs text-ink-soft transition-colors hover:text-ink hover:bg-card"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {calendarDays.map(({ date, key, isCurrentMonth }) => {
            const daySessions = sessionsByDay.get(key) || [];
            const dayAchievements = achievementsByDay.get(key) || [];
            const isSelected = selectedDayKey === key;
            const isToday = key === todayKeyStr;
            const sessionCount = daySessions.length;

            // Heatmap styling using theme variables (works seamlessly in Light & Dark mode)
            let cellStyle = "bg-background/50 text-ink-soft hover:bg-background";
            if (sessionCount >= 5) {
              cellStyle = "bg-sage text-ink font-bold border border-border/60 hover:bg-sage/80";
            } else if (sessionCount >= 3) {
              cellStyle = "bg-sage/80 text-ink font-semibold hover:bg-sage";
            } else if (sessionCount >= 1) {
              cellStyle = "bg-sage/50 text-ink hover:bg-sage/70";
            }

            return (
              <button
                key={key}
                onClick={() => setSelectedDayKey(isSelected ? null : key)}
                className={`group relative flex h-10 flex-col items-center justify-between rounded-lg p-1 transition-all duration-150 ${cellStyle} ${
                  !isCurrentMonth ? "opacity-25" : "opacity-100"
                } ${
                  isSelected
                    ? "ring-2 ring-accent ring-offset-1 ring-offset-surface"
                    : "hover:scale-[1.04]"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`text-[11px] font-mono font-medium leading-none ${
                      isToday ? "rounded-full bg-accent px-1 text-background" : ""
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {dayAchievements.length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Achievement unlocked!" />
                  )}
                </div>

                {sessionCount > 0 && (
                  <span className="text-[9px] font-mono leading-none opacity-80">
                    {sessionCount}x
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Day Detail Drawer */}
        <AnimatePresence>
          {selectedDayKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease }}
              className="mt-4 overflow-hidden rounded-xl border border-border bg-background p-4 shadow-soft"
            >
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div>
                  <h3 className="font-display text-sm font-semibold text-ink">
                    {formatDayMonth(selectedDayKey)}
                  </h3>
                  <p className="text-[10px] text-ink-soft">
                    {selectedDayStats
                      ? `${selectedDayStats.sessionCount} test(s) · ${formatTotalTime(
                          selectedDayStats.totalDurationSec
                        )}`
                      : "No tests on this day"}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDayKey(null)}
                  className="grid h-6 w-6 place-items-center rounded-full border border-border text-[10px] text-ink-soft hover:text-ink hover:bg-surface"
                >
                  ✕
                </button>
              </div>

              {!selectedDayStats ? (
                /* Empty state */
                <div className="py-4 text-center">
                  <p className="text-xs text-ink-soft">
                    No sessions logged on this date.
                  </p>
                  <Link
                    href="/type"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[11px] font-medium text-background shadow-sm transition-all hover:scale-105"
                  >
                    Start practice →
                  </Link>
                </div>
              ) : (
                /* Detail content */
                <div className="mt-3 space-y-3">
                  {/* Aggregated Daily Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border bg-surface p-2 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-ink-soft">
                        Avg WPM
                      </span>
                      <p className="font-display text-lg font-semibold text-ink tnum">
                        {selectedDayStats.avgWpm}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-2 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-ink-soft">
                        Best WPM
                      </span>
                      <p className="font-display text-lg font-semibold text-ink tnum">
                        {selectedDayStats.bestWpm}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-2 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-ink-soft">
                        Accuracy
                      </span>
                      <p className="font-display text-lg font-semibold text-ink tnum">
                        {selectedDayStats.avgAccuracy}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-2 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-ink-soft">
                        vs Avg
                      </span>
                      <p
                        className={`font-display text-lg font-semibold tnum ${
                          selectedDayStats.vsAvgPct >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {selectedDayStats.vsAvgPct >= 0 ? "+" : ""}
                        {selectedDayStats.vsAvgPct}%
                      </p>
                    </div>
                  </div>

                  {/* Breakdown Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    {Array.from(selectedDayStats.langMap.entries()).map(([lang, count]) => {
                      const meta = LANGUAGES.find((l) => l.value === lang);
                      return (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-ink-soft"
                        >
                          <span>{lang === "indonesian" ? "🇮🇩" : "🇬🇧"}</span>
                          <span className="font-medium text-ink">
                            {meta ? meta.label : lang}:
                          </span>
                          <span>{count}x</span>
                        </span>
                      );
                    })}

                    {Array.from(selectedDayStats.feelingMap.entries()).map(([f, count]) => {
                      const meta = FEELINGS.find((item) => item.value === f) || {
                        label: f,
                        emoji: "🎯",
                      };
                      return (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-ink-soft"
                        >
                          <span>{meta.emoji}</span>
                          <span className="font-medium text-ink">{meta.label}:</span>
                          <span>x{count}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Unlocked Achievements */}
                  {selectedDayAchievements.length > 0 && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        🏆 Unlocked Achievement
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedDayAchievements.map((a) => (
                          <span
                            key={a.key}
                            className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 text-[10px] text-ink"
                          >
                            <span>{a.emoji}</span>
                            <span className="font-medium">{a.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Session List Table */}
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                      Sessions
                    </span>
                    <div className="mt-1 max-h-36 overflow-y-auto divide-y divide-border rounded-lg border border-border bg-surface text-[10px]">
                      {selectedDaySessions.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          className="flex items-center justify-between px-2.5 py-1.5"
                        >
                          <span className="font-mono text-ink-soft">
                            #{idx + 1}
                          </span>
                          <span className="font-display font-semibold text-ink">
                            {s.wpm} WPM
                          </span>
                          <span className="text-ink-soft">{s.accuracy}%</span>
                          <span className="capitalize text-ink-soft">{s.language}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
