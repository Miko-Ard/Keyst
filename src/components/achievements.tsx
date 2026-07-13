"use client";

import { motion } from "framer-motion";
import type { AchievementDTO } from "@/lib/types";

const ease = [0.22, 0.61, 0.36, 1] as const;

const toneBg: Record<AchievementDTO["tone"], string> = {
  sage: "bg-sage",
  lavender: "bg-lavender",
  blue: "bg-blue",
  card: "bg-card",
};

export function Achievements({ items }: { items: AchievementDTO[] }) {
  const unlockedCount = items.filter((a) => a.unlocked).length;

  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 md:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-tight text-ink">
            Achievements
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Small milestones on the way to 100&nbsp;WPM.
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-ink-soft tnum">
          {unlockedCount} / {items.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((a, i) => (
          <motion.div
            key={a.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease, delay: (i % 4) * 0.05 }}
            className={`relative overflow-hidden rounded-2xl border border-border p-5 transition-all duration-200 ease-calm hover:-translate-y-1 ${
              a.unlocked ? toneBg[a.tone] : "bg-surface"
            } ${a.unlocked ? "" : "opacity-70"}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`grid h-11 w-11 place-items-center rounded-xl border border-border bg-background/50 text-2xl ${
                  a.unlocked ? "" : "grayscale"
                }`}
                aria-hidden
              >
                {a.unlocked ? a.emoji : "🔒"}
              </span>
              {a.unlocked && (
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft">
                  Unlocked
                </span>
              )}
            </div>
            <p className="mt-4 font-display text-lg leading-tight text-ink">
              {a.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {a.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
