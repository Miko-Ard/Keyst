"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { PeriodFilter, SessionDTO } from "@/lib/types";
import { formatDate, formatTotalTime } from "@/lib/utils";
import { computePeriodStats, isSessionInPeriod } from "@/lib/stats";

const ease = [0.22, 0.61, 0.36, 1] as const;

type Metric = "wpm" | "accuracy";

export function Charts({
  sessions,
  period,
  onPeriodChange,
}: {
  sessions: SessionDTO[];
  period?: PeriodFilter;
  onPeriodChange?: (period: PeriodFilter) => void;
}) {
  const [metric, setMetric] = useState<Metric>("wpm");
  const [internalPeriod, setInternalPeriod] = useState<PeriodFilter>("all");

  const currentPeriod = period || internalPeriod;
  const setPeriod = onPeriodChange || setInternalPeriod;

  // Filter sessions based on period
  const filteredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((s) => isSessionInPeriod(new Date(s.date), currentPeriod, now));
  }, [sessions, currentPeriod]);

  const periodStats = useMemo(() => {
    return computePeriodStats(sessions, currentPeriod);
  }, [sessions, currentPeriod]);

  const data = useMemo(
    () =>
      filteredSessions.map((s) => ({
        date: formatDate(s.date),
        wpm: s.wpm,
        accuracy: s.accuracy,
        rawWpm: s.rawWpm,
        language: s.language,
      })),
    [filteredSessions]
  );

  const isWpm = metric === "wpm";

  return (
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease }}
      >
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Progress over time</CardTitle>
              <CardDescription className="mt-1">
                {isWpm
                  ? `WPM speed curve (${filteredSessions.length} sessions in ${currentPeriod} view)`
                  : `Accuracy precision curve in ${currentPeriod} view`}
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Period Filter Toggle */}
              <Segmented
                value={currentPeriod}
                onChange={setPeriod}
                options={[
                  { value: "daily", label: "24h" },
                  { value: "weekly", label: "7 Days" },
                  { value: "monthly", label: "30 Days" },
                  { value: "all", label: "All Time" },
                ]}
              />

              {/* Metric Toggle */}
              <Segmented
                value={metric}
                onChange={setMetric}
                options={[
                  { value: "wpm", label: "WPM" },
                  { value: "accuracy", label: "Accuracy" },
                ]}
              />
            </div>
          </CardHeader>

          <CardContent>
            {/* Period Quick Aggregation Summary Bar */}
            <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface/60 p-4 sm:grid-cols-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-ink-soft">
                  Period Average
                </span>
                <p className="font-display text-2xl font-semibold text-ink tnum">
                  {periodStats.avgWpm} <span className="text-xs text-ink-soft">WPM</span>
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-ink-soft">
                  Best in Period
                </span>
                <p className="font-display text-2xl font-semibold text-ink tnum">
                  {periodStats.bestWpm} <span className="text-xs text-ink-soft">WPM</span>
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-ink-soft">
                  Practice Time
                </span>
                <p className="font-display text-2xl font-semibold text-ink tnum">
                  {formatTotalTime(periodStats.totalDurationSec)}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-ink-soft">
                  Period Accuracy
                </span>
                <p className="font-display text-2xl font-semibold text-ink tnum">
                  {periodStats.avgAccuracy}%
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[320px] w-full">
              {filteredSessions.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-ink-soft">
                  No typing sessions recorded in this time period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {isWpm ? (
                    <AreaChart
                      data={data}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8ba58f" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8ba58f" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--ink-soft)", fontSize: 11 }}
                        interval="preserveStartEnd"
                        minTickGap={28}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--ink-soft)", fontSize: 11 }}
                        domain={["dataMin - 5", "dataMax + 5"]}
                        width={44}
                      />
                      <Tooltip content={<SoftTooltip unit="wpm" />} cursor={cursor} />
                      <Area
                        type="monotone"
                        dataKey="wpm"
                        stroke="var(--ink)"
                        strokeWidth={2}
                        fill="url(#wpmFill)"
                        dot={false}
                        activeDot={{ r: 4, fill: "var(--ink)", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart
                      data={data}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--ink-soft)", fontSize: 11 }}
                        interval="preserveStartEnd"
                        minTickGap={28}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--ink-soft)", fontSize: 11 }}
                        domain={[80, 100]}
                        width={44}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip content={<SoftTooltip unit="%" />} cursor={cursor} />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#8b86ab"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#8b86ab", strokeWidth: 0 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

const cursor = { stroke: "var(--border)", strokeWidth: 1 };

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-background/60 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full px-3.5 py-1 text-xs font-medium transition-colors duration-200 ease-calm ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${options[0].value}`}
                className="absolute inset-0 rounded-full bg-surface shadow-soft"
                transition={{ duration: 0.25, ease }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SoftTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; payload?: { language?: string } }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const lang = payload[0].payload?.language;
  return (
    <div className="rounded-xl border border-border bg-background/95 px-3.5 py-2.5 shadow-soft backdrop-blur">
      <p className="text-xs text-ink-soft flex items-center gap-1">
        <span>{label}</span>
        {lang && (
          <span className="capitalize font-medium text-ink">
            · {lang}
          </span>
        )}
      </p>
      <p className="font-display text-lg text-ink tnum">
        {payload[0].value}
        <span className="ml-1 text-sm text-ink-soft">{unit}</span>
      </p>
    </div>
  );
}
