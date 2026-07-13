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
import type { SessionDTO } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ease = [0.22, 0.61, 0.36, 1] as const;

type Metric = "wpm" | "accuracy";

export function Charts({ sessions }: { sessions: SessionDTO[] }) {
  const [metric, setMetric] = useState<Metric>("wpm");

  const data = useMemo(
    () =>
      sessions.map((s) => ({
        date: formatDate(s.date),
        wpm: s.wpm,
        accuracy: s.accuracy,
        rawWpm: s.rawWpm,
      })),
    [sessions]
  );

  const isWpm = metric === "wpm";

  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease }}
      >
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Progress over time</CardTitle>
              <CardDescription className="mt-1">
                {isWpm
                  ? "Words per minute across every session."
                  : "Accuracy trend across every session."}
              </CardDescription>
            </div>
            <Segmented
              value={metric}
              onChange={setMetric}
              options={[
                { value: "wpm", label: "WPM" },
                { value: "accuracy", label: "Accuracy" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {isWpm ? (
                  <AreaChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8ba58f" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#8ba58f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B6B6B", fontSize: 11 }}
                      interval="preserveStartEnd"
                      minTickGap={28}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B6B6B", fontSize: 11 }}
                      domain={["dataMin - 6", "dataMax + 6"]}
                      width={44}
                    />
                    <Tooltip content={<SoftTooltip unit="wpm" />} cursor={cursor} />
                    <Area
                      type="monotone"
                      dataKey="wpm"
                      stroke="#3B3B3B"
                      strokeWidth={2}
                      fill="url(#wpmFill)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#3B3B3B", strokeWidth: 0 }}
                    />
                  </AreaChart>
                ) : (
                  <LineChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B6B6B", fontSize: 11 }}
                      interval="preserveStartEnd"
                      minTickGap={28}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6B6B6B", fontSize: 11 }}
                      domain={[90, 100]}
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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

const cursor = { stroke: "rgba(0,0,0,0.14)", strokeWidth: 1 };

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
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ease-calm ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="segmented-pill"
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
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background/95 px-3.5 py-2.5 shadow-soft backdrop-blur">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="font-display text-lg text-ink tnum">
        {payload[0].value}
        <span className="ml-1 text-sm text-ink-soft">{unit}</span>
      </p>
    </div>
  );
}
