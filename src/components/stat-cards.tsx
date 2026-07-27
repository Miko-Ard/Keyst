"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { PeriodStats, Stats } from "@/lib/types";
import { formatTotalTime } from "@/lib/utils";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function StatCards({
  stats,
  periodStats,
}: {
  stats: Stats;
  periodStats?: PeriodStats;
}) {
  const currentPeriod = periodStats || {
    sessionCount: stats.totalSessions,
    totalDurationSec: stats.totalDurationSec || 0,
    avgWpm: stats.currentWpm,
    bestWpm: stats.bestWpm,
    avgAccuracy: stats.avgAccuracy,
  };

  const items = [
    {
      label: "Current Speed",
      value: `${stats.currentWpm} WPM`,
      hint:
        stats.wpmDelta === 0
          ? "steady pace"
          : stats.wpmDelta > 0
          ? `▲ +${stats.wpmDelta} vs previous`
          : `▼ ${stats.wpmDelta} vs previous`,
      tone: "sage",
    },
    {
      label: "Best Speed",
      value: `${stats.bestWpm} WPM`,
      hint: "personal record",
      tone: "card",
    },
    {
      label: "Avg Accuracy",
      value: `${stats.avgAccuracy}%`,
      hint: "recent precision rate",
      tone: "blue",
    },
    {
      label: "Total Practice Time",
      value: formatTotalTime(currentPeriod.totalDurationSec),
      hint: `${stats.totalSessions} sessions logged`,
      tone: "lavender",
    },
  ];

  const toneBar: Record<string, string> = {
    sage: "bg-[#9cbfa6]",
    card: "bg-[#c9b79c]",
    blue: "bg-[#9cc0cf]",
    lavender: "bg-[#b3accd]",
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease, delay: i * 0.06 }}
          >
            <Card className="group h-full p-6 transition-all duration-200 ease-calm hover:-translate-y-1 hover:shadow-hover">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
                  {item.label}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${toneBar[item.tone]}`}
                  aria-hidden
                />
              </div>
              <p className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink tnum md:text-5xl">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-ink-soft">{item.hint}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
