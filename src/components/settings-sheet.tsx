"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GOAL_WPM } from "@/lib/achievements";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function SettingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[2px]"
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
              A quiet, focused space. These preferences are illustrative for this
              personal build.
            </p>

            <div className="mt-8 space-y-4">
              <Row label="Daily goal" value={`${GOAL_WPM} WPM`} />
              <Row label="Theme" value="Warm editorial" />
              <Row label="Reminder" value="9:00 AM" />
              <Row label="Week starts" value="Monday" />
            </div>

            <div className="mt-auto rounded-2xl border border-border bg-surface p-5">
              <p className="font-display text-lg text-ink">Stay gentle</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Progress compounds quietly. A few focused minutes each day beats
                one frantic hour.
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
