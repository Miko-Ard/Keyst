"use client";

import { useCallback, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { StatCards } from "@/components/stat-cards";
import { Charts } from "@/components/charts";
import { Achievements } from "@/components/achievements";
import { RecentSessions } from "@/components/recent-sessions";
import { SettingsSheet } from "@/components/settings-sheet";
import type { AchievementDTO, SessionDTO, Stats } from "@/lib/types";

interface Payload {
  sessions: SessionDTO[];
  achievements: AchievementDTO[];
  stats: Stats;
}

export function Dashboard({ initial }: { initial: Payload }) {
  const [data, setData] = useState<Payload>(initial);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as Payload;
      setData(next);
    } catch {
      /* keep existing data on failure */
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar onSettings={() => setSettingsOpen(true)} />

      <main className="pb-28">
        <Hero stats={data.stats} />
        <StatCards stats={data.stats} />
        <Charts sessions={data.sessions} />
        <Achievements items={data.achievements} />
        <RecentSessions sessions={data.sessions} onSaved={refresh} />
      </main>

      <Footer />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-10 text-sm text-ink-soft md:flex-row md:px-8">
        <span className="flex items-center gap-2">
          <span aria-hidden>⌨</span> Keyst
        </span>
        <span>Calm, focused practice — one day at a time.</span>
      </div>
    </footer>
  );
}
