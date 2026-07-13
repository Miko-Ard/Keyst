"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import type { Stats } from "@/lib/types";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function Hero({ stats }: { stats: Stats }) {
  const todayPct = stats.todayWpm
    ? Math.min(1, stats.todayWpm / stats.goal)
    : stats.goalProgress;

  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left — editorial title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8ba58f]" />
            A calm space for daily practice
          </span>

          <h1 className="mt-6 font-display text-6xl leading-[1.0] tracking-tightest text-ink md:text-8xl">
            Keyst
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft text-balance">
            Build consistent typing habits. Track your progress every day.
            Reach&nbsp;
            <span className="text-ink">100&nbsp;WPM</span> with calm and focused
            practice.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-ink-soft">
            <Metric label="Sessions logged" value={stats.totalSessions} />
            <span className="h-4 w-px bg-border" />
            <Metric label="Best so far" value={`${stats.bestWpm} wpm`} />
            <span className="h-4 w-px bg-border" />
            <Metric
              label="Goal"
              value={`${stats.goal} wpm`}
            />
          </div>
        </motion.div>

        {/* Right — progress, streak, goal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-b from-surface to-card/40 p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg text-ink">Today</p>
                <p className="text-sm text-ink-soft">
                  {stats.todayWpm
                    ? "Logged — nicely done."
                    : "No session yet today."}
                </p>
              </div>
              <span className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-ink-soft">
                {Math.round(todayPct * 100)}% to goal
              </span>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <ProgressRing
                value={todayPct}
                label={
                  stats.todayWpm ? `${stats.todayWpm}` : `${stats.currentWpm}`
                }
                caption="wpm"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat
                tone="sage"
                emoji="🔥"
                value={`${stats.currentStreak}`}
                label={stats.currentStreak === 1 ? "day streak" : "day streak"}
              />
              <MiniStat
                tone="lavender"
                emoji="🎯"
                value={`${stats.goal}`}
                label="wpm goal"
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="flex flex-col">
      <span className="font-display text-xl text-ink tnum">{value}</span>
      <span className="text-xs text-ink-soft">{label}</span>
    </span>
  );
}

function MiniStat({
  tone,
  emoji,
  value,
  label,
}: {
  tone: "sage" | "lavender";
  emoji: string;
  value: string;
  label: string;
}) {
  const bg = tone === "sage" ? "bg-sage" : "bg-lavender";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border ${bg} px-4 py-3`}
    >
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-display text-2xl text-ink tnum">{value}</span>
        <span className="text-xs text-ink-soft">{label}</span>
      </span>
    </div>
  );
}
