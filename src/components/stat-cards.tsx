"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/lib/types";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function StatCards({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Current WPM",
      value: stats.currentWpm,
      hint:
        stats.wpmDelta === 0
          ? "steady"
          : stats.wpmDelta > 0
          ? `▲ ${stats.wpmDelta} vs last`
          : `▼ ${Math.abs(stats.wpmDelta)} vs last`,
      tone: "sage",
    },
    {
      label: "Best WPM",
      value: stats.bestWpm,
      hint: "personal record",
      tone: "card",
    },
    {
      label: "Average Accuracy",
      value: `${stats.avgAccuracy}%`,
      hint: "last 10 sessions",
      tone: "blue",
    },
    {
      label: "Current Streak",
      value: stats.currentStreak,
      hint: stats.currentStreak === 1 ? "day in a row" : "days in a row",
      tone: "lavender",
    },
  ] as const;

  const toneBar: Record<string, string> = {
    sage: "bg-[#9cbfa6]",
    card: "bg-[#c9b79c]",
    blue: "bg-[#9cc0cf]",
    lavender: "bg-[#b3accd]",
  };

  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 md:px-8">
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
              <p className="mt-6 font-display text-5xl tracking-tight text-ink tnum">
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
