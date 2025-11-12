"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import dynamic from "next/dynamic";
import { set, del, keys, get } from "idb-keyval";

const QRScanner = dynamic(() => import("@yudiel/react-qr-scanner").then((m) => m.Scanner), { ssr: false });

const PendingCheckin = z.object({ token: z.string(), code: z.string().optional(), coords: z.object({ lat: z.number(), lng: z.number() }) });

type PendingCheckin = z.infer<typeof PendingCheckin>;

async function flushQueue() {
  const allKeys = (await keys()) as string[];
  const checkinKeys = allKeys.filter((k) => k.startsWith("checkin:"));
  for (const key of checkinKeys) {
    const value = (await get(key as any)) as any;
    if (!value) continue;
    try {
      const res = await fetch("/api/attendance/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
      if (res.ok) await del(key);
    } catch {
      // still offline
    }
  }
}

export default function CheckinPage() {
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).idbKeyval = { set, del, keys };
    }
    const onlineHandler = () => flushQueue();
    window.addEventListener("online", onlineHandler);
    return () => window.removeEventListener("online", onlineHandler);
  }, []);

  async function getCoords() {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  async function submit(payload: PendingCheckin) {
    try {
      const res = await fetch("/api/attendance/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setStatus(`Checked in to ${data.className}`);
    } catch {
      const key = `checkin:${Date.now()}`;
      await set(key, payload);
      setStatus("Offline: saved and will sync when online");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const coords = coordsRef.current || (await getCoords());
      coordsRef.current = coords;
      const payload: PendingCheckin = { token: token || "", code: code || undefined, coords };
      await submit(payload);
    } catch (e: any) {
      setStatus(e.message || "Unable to get location");
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Student Check-in</h1>
        <div className="rounded border bg-white p-4 shadow-sm space-y-3">
          <div>
            <div className="mb-2 text-sm text-gray-700">Scan QR (offline capable)</div>
            <div className="overflow-hidden rounded">
              <QRScanner
                onScan={(codes) => {
                  const first = Array.isArray(codes) && codes.length ? codes[0] : null;
                  if (first?.rawValue) setToken(first.rawValue);
                }}
                onError={() => {}}
                constraints={{ facingMode: "environment" }}
                styles={{ container: { width: "100%" }, video: { width: "100%" } }}
              />
            </div>
            {token && <div className="mt-2 truncate text-xs text-gray-600">Token: {token.slice(0, 24)}?</div>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm">
              <span className="text-gray-700">Or enter 6-digit code</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} className="mt-1 w-full rounded border px-3 py-2" placeholder="e.g. 123456" />
            </label>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Check In</button>
          </form>
          {status && <div className="rounded bg-gray-50 p-2 text-sm text-gray-700">{status}</div>}
        </div>
      </div>
    </main>
  );
}
