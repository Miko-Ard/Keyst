"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { FEELINGS, type Feeling } from "@/lib/types";
import { cn } from "@/lib/utils";

const ease = [0.22, 0.61, 0.36, 1] as const;

function todayInputValue() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function DailyLog({ onSaved }: { onSaved: () => void }) {
  const [date, setDate] = useState(todayInputValue());
  const [wpm, setWpm] = useState("");
  const [rawWpm, setRawWpm] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [durationMin, setDurationMin] = useState("3");
  const [feeling, setFeeling] = useState<Feeling>("focused");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const canSave = wpm !== "" && accuracy !== "" && status !== "saving";

  async function handleSave() {
    setError(null);
    const wpmNum = Number(wpm);
    const accNum = Number(accuracy);
    if (Number.isNaN(wpmNum) || Number.isNaN(accNum)) {
      setError("Please enter a valid WPM and accuracy.");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date(`${date}T12:00:00`).toISOString(),
          wpm: wpmNum,
          rawWpm: rawWpm ? Number(rawWpm) : wpmNum,
          accuracy: accNum,
          duration: Math.round(Number(durationMin || "0") * 60),
          feeling,
          notes,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("saved");
      // reset the transient fields
      setWpm("");
      setRawWpm("");
      setAccuracy("");
      setNotes("");
      onSaved();
      setTimeout(() => setStatus("idle"), 2200);
    } catch {
      setStatus("error");
      setError("Something went wrong while saving. Please try again.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Daily log</CardTitle>
            <CardDescription>
              Record today&rsquo;s practice. A few calm numbers are enough.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Date">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <Field label="WPM">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="92"
                  value={wpm}
                  onChange={(e) => setWpm(e.target.value)}
                />
              </Field>
              <Field label="Accuracy %">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="97.5"
                  step="0.1"
                  value={accuracy}
                  onChange={(e) => setAccuracy(e.target.value)}
                />
              </Field>
              <Field label="Raw WPM">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="98"
                  value={rawWpm}
                  onChange={(e) => setRawWpm(e.target.value)}
                />
              </Field>
              <Field label="Duration (min)">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="3"
                  step="0.5"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                />
              </Field>
              <Field label="Feeling">
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {FEELINGS.map((f) => {
                    const active = f.value === feeling;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFeeling(f.value)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ease-calm",
                          active
                            ? "border-accent/25 bg-accent text-background"
                            : "border-border bg-background/60 text-ink-soft hover:text-ink hover:-translate-y-[1px]"
                        )}
                      >
                        <span aria-hidden>{f.emoji}</span>
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <Field label="Notes">
              <Textarea
                placeholder="How did this session feel? What will you focus on next?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={handleSave} disabled={!canSave} size="lg">
                {status === "saving" ? "Saving…" : "Save session"}
              </Button>

              <AnimatePresence mode="wait">
                {status === "saved" && (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                    className="inline-flex items-center gap-2 text-sm text-ink-soft"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8ba58f]" />
                    Saved. Beautifully done.
                  </motion.span>
                )}
                {error && (
                  <motion.span
                    key="error"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                    className="text-sm text-[#9a6b6b]"
                  >
                    {error}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
