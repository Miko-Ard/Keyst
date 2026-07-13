"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GOAL_WPM } from "@/lib/achievements";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function SettingsSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [clearing, setClearing] = useState(false);

  // Sync theme state with html class on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-background p-7 shadow-soft-lg"
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
              Customize your typing experience. All changes are saved locally and synced automatically.
            </p>

            <div className="mt-8 space-y-4">
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

              <Row label="Daily goal" value={`${GOAL_WPM} WPM`} />
              <Row label="Theme variant" value="Warm editorial" />
              <Row label="Reminder" value="9:00 AM" />
            </div>

            {/* Clear Database (Danger Zone) */}
            <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
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

            <div className="mt-auto rounded-2xl border border-border bg-surface/50 p-5">
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
