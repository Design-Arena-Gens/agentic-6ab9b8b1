import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AttendanceSession, signAttendanceSession, generateRandomCode } from "@/lib/jwt";

const Body = z.object({ className: z.string(), lat: z.number(), lng: z.number(), radius: z.number().int().positive(), minutes: z.number().int().positive().max(60) });

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { className, lat, lng, radius, minutes } = parsed.data;
  const now = Date.now();
  const expiresAt = now + minutes * 60_000;
  const session: AttendanceSession = {
    sessionId: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    className,
    code: generateRandomCode(),
    createdAt: now,
    expiresAt,
    location: { lat, lng, radiusMeters: radius },
  };
  const token = signAttendanceSession(session);
  return NextResponse.json({ token, code: session.code, expiresAt });
}
