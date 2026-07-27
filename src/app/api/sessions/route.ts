import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessions, syncAchievements } from "@/lib/data";
import { computeStats } from "@/lib/stats";
import type { Feeling } from "@/lib/types";

export const dynamic = "force-dynamic";

function getDeviceIdFromReq(req: Request, body?: any): string {
  const headerId = req.headers.get("x-device-id");
  if (headerId && headerId.trim()) return headerId.trim();

  const { searchParams } = new URL(req.url);
  const paramId = searchParams.get("deviceId");
  if (paramId && paramId.trim()) return paramId.trim();

  if (body && typeof body.deviceId === "string" && body.deviceId.trim()) {
    return body.deviceId.trim();
  }

  return "default";
}

export async function GET(req: Request) {
  const deviceId = getDeviceIdFromReq(req);
  const sessions = await getSessions(deviceId);
  const achievements = await syncAchievements(sessions);
  const stats = computeStats(sessions);
  return NextResponse.json({ sessions, achievements, stats, deviceId });
}

const FEELINGS = ["calm", "focused", "tired", "frustrated", "energized"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const deviceId = getDeviceIdFromReq(req, body);

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
        deviceId,
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

    const sessions = await getSessions(deviceId);
    const achievements = await syncAchievements(sessions);
    const stats = computeStats(sessions);
    return NextResponse.json({ sessions, achievements, stats, deviceId }, { status: 201 });
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
    const deviceId = getDeviceIdFromReq(req);

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required." },
        { status: 400 }
      );
    }

    if (id === "all") {
      // Clear all sessions for this specific device
      await prisma.session.deleteMany({
        where: { deviceId },
      });
    } else {
      // Delete single session (scoped to device if provided)
      await prisma.session.deleteMany({
        where: {
          id,
          deviceId,
        },
      });
    }

    const sessions = await getSessions(deviceId);
    const achievements = await syncAchievements(sessions);
    const stats = computeStats(sessions);
    return NextResponse.json({ sessions, achievements, stats, deviceId });
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
