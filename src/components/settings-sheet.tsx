"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { SessionDTO } from "@/lib/types";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function SettingsSheet({
  open,
  onClose,
  onSaved,
  sessions = [],
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  sessions?: SessionDTO[];
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [customGoal, setCustomGoal] = useState<number>(100);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const savedGoal = localStorage.getItem("custom_wpm_goal");
    if (savedGoal) {
      setCustomGoal(Number(savedGoal) || 100);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleGoalChange = (newGoal: number) => {
    setCustomGoal(newGoal);
    localStorage.setItem("custom_wpm_goal", String(newGoal));
    if (onSaved) onSaved();
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyst-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const headers = [
      "ID",
      "Date",
      "WPM",
      "Raw WPM",
      "Accuracy (%)",
      "Duration (s)",
      "Language",
      "Test Duration (s)",
      "Feeling",
      "Notes",
    ];

    const rows = sessions.map((s) => [
      s.id,
      s.date,
      s.wpm,
      s.rawWpm,
      s.accuracy,
      s.duration,
      s.language,
      s.testDuration,
      s.feeling,
      `"${(s.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `keyst-sessions-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all typing sessions? This cannot be undone."
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      const res = await fetch("/api/sessions?id=all", {
        method: "DELETE",
      });
      if (res.ok) {
        if (onSaved) onSaved();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.28, ease }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background p-7 shadow-soft-lg"
            role="dialog"
            aria-label="Settings"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-tight text-ink">
                Settings
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                ✕
              </Button>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Customize your typing goals and preferences. Saved locally in your browser.
            </p>

            <div className="mt-6 space-y-4">
              {/* Theme Selector */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5">
                <span className="text-sm text-ink-soft">Appearance</span>
                <button
                  onClick={toggleTheme}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-ink transition-all hover:bg-card active:scale-95 capitalize"
                >
                  {theme} mode
                </button>
              </div>

              {/* Custom Goal Setter */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Target WPM Goal</span>
                  <span className="font-display text-lg font-semibold text-ink tnum">
                    {customGoal} WPM
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  {[60, 80, 100, 120, 140].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleGoalChange(g)}
                      className={`flex-1 rounded-lg border px-2 py-1 text-xs font-medium transition-all ${
                        customGoal === g
                          ? "border-accent bg-accent text-white"
                          : "border-border bg-background text-ink-soft hover:text-ink"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <Row label="Theme variant" value="Warm editorial" />
            </div>

            {/* Export Data */}
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <p className="font-display text-lg text-ink">Export Data</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Download your complete typing session history for personal analysis.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={sessions.length === 0}
                  className="flex-1 rounded-xl border border-border bg-background py-2 text-xs font-medium text-ink transition-all hover:bg-card active:scale-95 disabled:opacity-40"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  disabled={sessions.length === 0}
                  className="flex-1 rounded-xl border border-border bg-background py-2 text-xs font-medium text-ink transition-all hover:bg-card active:scale-95 disabled:opacity-40"
                >
                  Export JSON
                </button>
              </div>
            </div>

            {/* Clear Database (Danger Zone) */}
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <p className="font-display text-lg text-ink">Danger Zone</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Delete all recorded typing sessions and reset unlocked achievements.
              </p>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="mt-4 w-full rounded-xl bg-[#ca7070] py-2.5 text-xs font-medium text-white transition-all duration-150 hover:bg-[#b55c5c] active:scale-[0.98] disabled:opacity-50"
              >
                {clearing ? "Clearing database..." : "Clear all sessions"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface/50 p-5">
              <p className="font-display text-lg text-ink">Stay gentle</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Progress compounds quietly. A few focused minutes each day beats one frantic hour.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
