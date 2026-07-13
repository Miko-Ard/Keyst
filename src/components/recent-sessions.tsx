"use client";

import { motion } from "framer-motion";
import type { SessionDTO } from "@/lib/types";
import { FEELINGS } from "@/lib/types";
import { formatDayMonth, formatDuration } from "@/lib/utils";

const ease = [0.22, 0.61, 0.36, 1] as const;

const feelingMeta = Object.fromEntries(
  FEELINGS.map((f) => [f.value, f])
) as Record<string, (typeof FEELINGS)[number]>;

export function RecentSessions({ sessions }: { sessions: SessionDTO[] }) {
  const rows = [...sessions].reverse().slice(0, 8);

  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 md:px-8">
      <div className="mb-6">
        <h2 className="font-display text-3xl tracking-tight text-ink">
          Recent sessions
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Your latest practice, most recent first.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease }}
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft"
      >
        {/* header */}
        <div className="hidden grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr_1fr] gap-4 border-b border-border px-6 py-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft md:grid">
          <span>Date</span>
          <span className="text-right">WPM</span>
          <span className="text-right">Accuracy</span>
          <span className="text-right">Duration</span>
          <span className="text-right">Feeling</span>
        </div>

        <div className="divide-y divide-border">
          {rows.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-ink-soft">
              No sessions yet. Log your first one above.
            </div>
          )}
          {rows.map((s) => {
            const f = feelingMeta[s.feeling] ?? feelingMeta.focused;
            return (
              <div
                key={s.id}
                className="grid grid-cols-2 items-center gap-4 px-6 py-5 transition-colors duration-200 ease-calm hover:bg-background/50 md:grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr_1fr]"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ink">
                    {formatDayMonth(s.date)}
                  </span>
                  {s.notes ? (
                    <span className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                      {s.notes}
                    </span>
                  ) : (
                    <span className="mt-0.5 text-xs text-ink-soft/60">
                      raw {s.rawWpm} wpm
                    </span>
                  )}
                </div>

                <span className="text-right font-display text-xl text-ink tnum md:text-2xl">
                  {s.wpm}
                </span>

                <span className="text-right text-sm text-ink tnum">
                  {s.accuracy}%
                </span>

                <span className="hidden text-right text-sm text-ink-soft tnum md:block">
                  {formatDuration(s.duration)}
                </span>

                <span className="col-span-2 flex justify-start md:col-span-1 md:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-ink-soft">
                    <span aria-hidden>{f.emoji}</span>
                    {f.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
