"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { StatCards } from "@/components/stat-cards";
import { AICoach } from "@/components/ai-coach";
import { Charts } from "@/components/charts";
import { CalendarView } from "@/components/calendar-view";
import { Achievements } from "@/components/achievements";
import { RecentSessions } from "@/components/recent-sessions";
import { SettingsSheet } from "@/components/settings-sheet";
import type { AchievementDTO, PeriodFilter, SessionDTO, Stats } from "@/lib/types";
import { computePeriodStats, computeStats } from "@/lib/stats";

interface Payload {
  sessions: SessionDTO[];
  achievements: AchievementDTO[];
  stats: Stats;
}

export function Dashboard({ initial }: { initial: Payload }) {
  const [data, setData] = useState<Payload>(initial);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [customGoal, setCustomGoal] = useState<number>(100);

  useEffect(() => {
    const savedGoal = localStorage.getItem("custom_wpm_goal");
    if (savedGoal) {
      setCustomGoal(Number(savedGoal) || 100);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as Payload;
      const savedGoal = localStorage.getItem("custom_wpm_goal");
      const currentGoal = savedGoal ? Number(savedGoal) || 100 : 100;
      setCustomGoal(currentGoal);
      setData({
        ...next,
        stats: computeStats(next.sessions, currentGoal),
      });
    } catch {
      /* keep existing data on failure */
    }
  }, []);

  const statsWithGoal = useMemo(() => {
    return computeStats(data.sessions, customGoal);
  }, [data.sessions, customGoal]);

  const periodStats = useMemo(() => {
    return computePeriodStats(data.sessions, period);
  }, [data.sessions, period]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSettings={() => setSettingsOpen(true)} />

      {/* Main Container Layout */}
      <main className="mx-auto max-w-[1600px] px-5 pt-4 pb-28 md:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          {/* Kotak Merah: Left Main Content Column */}
          <div className="flex-1 min-w-0 space-y-12">
            <Hero stats={statsWithGoal} />
            <StatCards stats={statsWithGoal} periodStats={periodStats} />
            <AICoach
              sessions={data.sessions}
              periodStats={periodStats}
              goal={statsWithGoal.goal}
            />
            <Charts
              sessions={data.sessions}
              period={period}
              onPeriodChange={setPeriod}
            />
            <Achievements items={data.achievements} />
            <RecentSessions sessions={data.sessions} onSaved={refresh} />
          </div>

          {/* Kotak Biru: Right Sticky Calendar Sidebar */}
          <aside className="w-full lg:w-[380px] xl:w-[400px] shrink-0 lg:sticky lg:top-24 pt-6 md:pt-10">
            <CalendarView
              sessions={data.sessions}
              achievements={data.achievements}
            />
          </aside>
        </div>
      </main>

      <Footer />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={refresh}
        sessions={data.sessions}
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-5 py-10 text-sm text-ink-soft md:flex-row md:px-8">
        <span className="flex items-center gap-2">
          <span aria-hidden>⌨</span> Keyst
        </span>
        <span>Calm, focused practice — one day at a time.</span>
      </div>
    </footer>
  );
}
