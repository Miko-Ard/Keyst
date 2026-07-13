"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SessionDTO } from "@/lib/types";
import { FEELINGS } from "@/lib/types";
import { formatDayMonth } from "@/lib/utils";

const ease = [0.22, 0.61, 0.36, 1] as const;

const feelingMeta = Object.fromEntries(
  FEELINGS.map((f) => [f.value, f])
) as Record<string, (typeof FEELINGS)[number]>;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function RecentSessions({
  sessions,
  onSaved,
}: {
  sessions: SessionDTO[];
  onSaved?: () => void;
}) {
  const rows = [...sessions].reverse().slice(0, 8);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sessions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok && onSaved) {
        onSaved();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

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
        <div className="hidden grid-cols-[1.2fr_0.7fr_0.7fr_0.6fr_0.6fr_0.7fr_0.3fr] gap-4 border-b border-border px-6 py-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft md:grid">
          <span>Date</span>
          <span className="text-right">WPM</span>
          <span className="text-right">Accuracy</span>
          <span className="text-right">Duration</span>
          <span className="text-right">Language</span>
          <span className="text-right">Feeling</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-border">
          {rows.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-ink-soft">
              No sessions yet. Click "Start typing" to begin!
            </div>
          )}
          {rows.map((s) => {
            const f = feelingMeta[s.feeling] ?? feelingMeta.focused;
            const isDeleting = deletingId === s.id;

            return (
              <div
                key={s.id}
                className="grid grid-cols-2 items-center gap-4 px-6 py-5 transition-colors duration-200 ease-calm hover:bg-background/50 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.6fr_0.6fr_0.7fr_0.3fr]"
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
                  {s.testDuration}s
                </span>

                <span className="hidden text-right text-sm text-ink-soft md:block">
                  {capitalize(s.language)}
                </span>

                <span className="flex justify-start md:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-ink-soft">
                    <span aria-hidden>{f.emoji}</span>
                    {f.label}
                  </span>
                </span>

                <span className="flex justify-end text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={isDeleting}
                    aria-label="Delete session"
                    className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-background/40 text-xs text-ink-soft transition-all duration-150 hover:bg-[#ca7070]/10 hover:text-[#ca7070] active:scale-95 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-soft border-t-transparent" />
                    ) : (
                      "✕"
                    )}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
