"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label: string;
  caption: string;
}

export function ProgressRing({
  value,
  size = 168,
  stroke = 12,
  label,
  caption,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  const offset = circumference * (1 - clamped);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3B3B3B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-3xl tracking-tight text-ink tnum">
          {label}
        </span>
        <span className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          {caption}
        </span>
      </div>
    </div>
  );
}
