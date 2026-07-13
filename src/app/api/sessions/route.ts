import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessions, syncAchievements } from "@/lib/data";
import { computeStats } from "@/lib/stats";
import type { Feeling } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await getSessions();
  const achievements = await syncAchievements(sessions);
  const stats = computeStats(sessions);
  return NextResponse.json({ sessions, achievements, stats });
}

const FEELINGS = ["calm", "focused", "tired", "frustrated", "energized"];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const wpm = clampInt(body.wpm, 0, 400);
    const rawWpm = clampInt(body.rawWpm ?? body.wpm, 0, 500);
    const accuracy = clampFloat(body.accuracy, 0, 100);
    const duration = clampInt(body.duration, 1, 60 * 60);
    const language =
      typeof body.language === "string" ? body.language.slice(0, 50) : "english";
    const testDuration = clampInt(body.testDuration ?? 30, 5, 300);
    const feeling: Feeling = FEELINGS.includes(body.feeling)
      ? body.feeling
      : "focused";
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 500) : "";
    const date = body.date ? new Date(body.date) : new Date();

    if (Number.isNaN(wpm) || Number.isNaN(accuracy)) {
      return NextResponse.json(
        { error: "WPM and accuracy are required." },
        { status: 400 }
      );
    }

    await prisma.session.create({
      data: {
        wpm,
        rawWpm: rawWpm < wpm ? wpm : rawWpm,
        accuracy,
        duration,
        language,
        testDuration,
        feeling,
        notes,
        date: Number.isNaN(date.getTime()) ? new Date() : date,
      },
    });

    const sessions = await getSessions();
    const achievements = await syncAchievements(sessions);
    const stats = computeStats(sessions);
    return NextResponse.json({ sessions, achievements, stats }, { status: 201 });
  } catch (e) {
    console.error("POST /api/sessions error:", e);
    return NextResponse.json(
      { error: "Could not save session." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required." },
        { status: 400 }
      );
    }

    if (id === "all") {
      // Clear all sessions and lock achievements
      await prisma.session.deleteMany();
      await prisma.achievement.updateMany({
        data: { unlocked: false, unlockedAt: null },
      });
    } else {
      // Delete single session
      await prisma.session.delete({
        where: { id },
      });
    }

    const sessions = await getSessions();
    const achievements = await syncAchievements(sessions);
    const stats = computeStats(sessions);
    return NextResponse.json({ sessions, achievements, stats });
  } catch (e) {
    console.error("DELETE /api/sessions error:", e);
    return NextResponse.json(
      { error: "Could not delete session." },
      { status: 500 }
    );
  }
}

function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return NaN;
  return Math.min(max, Math.max(min, n));
}

function clampFloat(v: unknown, min: number, max: number): number {
  const n = Math.round(Number(v) * 10) / 10;
  if (Number.isNaN(n)) return NaN;
  return Math.min(max, Math.max(min, n));
}
