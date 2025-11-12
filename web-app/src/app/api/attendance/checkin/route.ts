import { NextRequest, NextResponse } from "next/server";
import { verifyAttendanceSession } from "@/lib/jwt";

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3; // meters
  const phi1 = (a.lat * Math.PI) / 180;
  const phi2 = (b.lat * Math.PI) / 180;
  const dPhi = ((b.lat - a.lat) * Math.PI) / 180;
  const dLambda = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

export async function POST(req: NextRequest) {
  const { token, code, coords } = await req.json();
  const session = token ? verifyAttendanceSession(token) : null;
  if (!session) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  if (code && code !== session.code) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  const now = Date.now();
  if (now > session.expiresAt) return NextResponse.json({ error: "Session expired" }, { status: 400 });

  if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
    return NextResponse.json({ error: "Missing location" }, { status: 400 });
  }
  const dist = distanceMeters({ lat: session.location.lat, lng: session.location.lng }, coords);
  if (dist > session.location.radiusMeters) {
    return NextResponse.json({ error: "Out of range", distance: Math.round(dist) }, { status: 403 });
  }

  // Demo: we don't persist server-side; respond success
  return NextResponse.json({ ok: true, sessionId: session.sessionId, className: session.className });
}
