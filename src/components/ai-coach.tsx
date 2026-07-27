"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { PeriodStats, SessionDTO } from "@/lib/types";
import { formatTotalTime } from "@/lib/utils";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function AICoach({
  sessions,
  periodStats,
  goal,
}: {
  sessions: SessionDTO[];
  periodStats: PeriodStats;
  goal: number;
}) {
  const [insightIndex, setInsightIndex] = useState(0);

  const insights = useMemo(() => {
    if (sessions.length === 0) {
      return [
        {
          title: "Welcome to Keyst",
          body: "Start your first typing test above. I'll analyze your WPM speed, accuracy, and emotional focus over time to give you tailored practice recommendations.",
          tag: "Getting Started",
        },
      ];
    }

    const list = [];
    const { avgWpm, bestWpm, avgAccuracy, sessionCount, totalDurationSec, languages, feelings, wpmTrendDelta } =
      periodStats;

    // Insight 1: General WPM & Goal progress
    const gapToGoal = goal - bestWpm;
    if (bestWpm >= goal) {
      list.push({
        title: "Goal Achieved & Beyond",
        body: `Splendid consistency! You crossed your target goal of ${goal} WPM with a best speed of ${bestWpm} WPM across ${sessionCount} sessions (${formatTotalTime(
          totalDurationSec
        )} total practice time). Focus on maintaining accuracy above 98% for effortless flow.`,
        tag: "Goal Milestone",
      });
    } else {
      list.push({
        title: `Pacing Towards ${goal} WPM Goal`,
        body: `You're currently averaging ${avgWpm} WPM (best: ${bestWpm} WPM), just ${gapToGoal} WPM away from your ${goal} WPM goal. ${
          wpmTrendDelta > 0
            ? `Your speed is trending up by +${wpmTrendDelta} WPM in recent practice!`
            : "Keep a steady rhythm and prioritize accuracy over speed."
        }`,
        tag: "Speed Analysis",
      });
    }

    // Insight 2: Feeling & State correlation
    if (feelings.length > 0) {
      const sortedFeelings = [...feelings].sort((a, b) => b.avgWpm - a.avgWpm);
      const topFeeling = sortedFeelings[0];
      const lowestFeeling = sortedFeelings[sortedFeelings.length - 1];

      if (sortedFeelings.length > 1 && topFeeling.avgWpm > lowestFeeling.avgWpm) {
        const diff = topFeeling.avgWpm - lowestFeeling.avgWpm;
        list.push({
          title: "Mindset & Focus Correlation",
          body: `Your sessions tagged '${topFeeling.label}' ${topFeeling.emoji} average ${topFeeling.avgWpm} WPM (${diff} WPM faster than when you feel '${lowestFeeling.label}' ${lowestFeeling.emoji}). Practice when you feel calm and clear-headed for optimal progress.`,
          tag: "State Insight",
        });
      } else {
        list.push({
          title: "Mindset Analysis",
          body: `You most frequently practice in a '${topFeeling.label}' ${topFeeling.emoji} mindset, averaging ${topFeeling.avgWpm} WPM and ${topFeeling.avgAccuracy}% accuracy. Calm focus yields steady long-term gain.`,
          tag: "Focus Pattern",
        });
      }
    }

    // Insight 3: Language breakdown
    if (languages.length > 1) {
      const idLang = languages.find((l) => l.language === "indonesian");
      const enLang = languages.find((l) => l.language === "english");
      if (idLang && enLang) {
        list.push({
          title: "Language Fluency Breakdown",
          body: `In Indonesian 🇮🇩 you average ${idLang.avgWpm} WPM across ${idLang.sessionCount} tests, while in English 🇬🇧 you average ${enLang.avgWpm} WPM across ${enLang.sessionCount} tests. Balancing practice across languages strengthens finger memory.`,
          tag: "Language Comparison",
        });
      }
    }

    // Insight 4: Accuracy & Technique recommendation
    if (avgAccuracy < 95) {
      list.push({
        title: "Accuracy Improvement Focus",
        body: `Your average accuracy is ${avgAccuracy}%. Slowing down by 5% to eliminate backspaces actually raises overall WPM because error correction consumes significant time.`,
        tag: "Accuracy Coach",
      });
    } else {
      list.push({
        title: "High Precision Performance",
        body: `Outstanding accuracy (${avgAccuracy}%)! High precision reduces cognitive fatigue and builds seamless muscle memory.`,
        tag: "Precision Flow",
      });
    }

    return list;
  }, [sessions, periodStats, goal]);

  const current = insights[insightIndex % insights.length];

  return (
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-sage/30 p-7 border-border shadow-soft">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-background/80 text-xl shadow-sm">
                ✨
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    AI Progress Coach
                  </span>
                  <span className="rounded-full border border-border bg-background/70 px-2.5 py-0.5 text-[10px] font-medium text-ink-soft">
                    {current.tag}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink">
                  {current.title}
                </h3>
              </div>
            </div>

            {insights.length > 1 && (
              <button
                onClick={() => setInsightIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-ink-soft transition-all duration-200 hover:text-ink hover:bg-background active:scale-95"
              >
                <span>Next Insight</span>
                <span className="text-xs">→</span>
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={current.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
              className="mt-4 max-w-4xl text-base leading-relaxed text-ink-soft"
            >
              {current.body}
            </motion.p>
          </AnimatePresence>

          {/* Quick Stats Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border/40 text-xs">
            {periodStats.languages.map((l) => (
              <span
                key={l.language}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-ink-soft"
              >
                <span>{l.language === "indonesian" ? "🇮🇩" : "🇬🇧"}</span>
                <span className="font-medium text-ink">{l.label}:</span>
                <span className="tabular-nums">{l.avgWpm} avg WPM</span>
                <span className="text-ink-soft/40">({l.sessionCount} tests)</span>
              </span>
            ))}

            {periodStats.feelings.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-ink-soft">
                <span>{periodStats.feelings[0].emoji}</span>
                <span className="font-medium text-ink">
                  Top Mindset: {periodStats.feelings[0].label}
                </span>
                <span className="tabular-nums">({periodStats.feelings[0].avgWpm} WPM)</span>
              </span>
            )}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
