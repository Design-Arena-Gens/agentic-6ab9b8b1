"use client";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { z } from "zod";

const FormSchema = z.object({
  className: z.string().min(1),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().int().positive(),
  minutes: z.coerce.number().int().positive().max(30),
});

export default function FacultyAttendancePage() {
  const [form, setForm] = useState({ className: "CS101", lat: 12.9716, lng: 77.5946, radius: 150, minutes: 5 });
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function generate() {
    setError(null);
    const parse = FormSchema.safeParse(form);
    if (!parse.success) {
      setError("Invalid form values");
      return;
    }
    const res = await fetch("/api/attendance/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parse.data),
    });
    if (!res.ok) {
      setError("Failed to create session");
      return;
    }
    const data = await res.json();
    setToken(data.token);
    setCode(data.code);
    setExpiresAt(data.expiresAt);
  }

  const remaining = useMemo(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => {
      // trigger rerender
      setExpiresAt((e) => (e ? e : null));
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Create Attendance Session</h1>
        <div className="rounded border bg-white p-4 shadow-sm space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <L label="Class Name"><input className="w-full rounded border px-3 py-2" value={form.className} onChange={(e) => update("className", e.target.value)} /></L>
            <L label="Radius (meters)"><input className="w-full rounded border px-3 py-2" type="number" value={form.radius} onChange={(e) => update("radius", e.target.value)} /></L>
            <L label="Latitude"><input className="w-full rounded border px-3 py-2" type="number" value={form.lat} onChange={(e) => update("lat", e.target.value)} /></L>
            <L label="Longitude"><input className="w-full rounded border px-3 py-2" type="number" value={form.lng} onChange={(e) => update("lng", e.target.value)} /></L>
            <L label="Expires In (minutes)"><input className="w-full rounded border px-3 py-2" type="number" value={form.minutes} onChange={(e) => update("minutes", e.target.value)} /></L>
          </div>
          <button onClick={generate} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Generate</button>
          {error && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        </div>

        {token && (
          <div className="rounded border bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm text-gray-600">Share this QR or code with students. Expires in <span className="font-medium">{remaining}s</span>.</div>
            <div className="flex flex-col items-center gap-3">
              <QRCodeCanvas value={token} size={220} includeMargin />
              <div className="text-lg font-mono tracking-widest">{code}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <div className="mb-1 text-gray-700">{label}</div>
      {children}
    </label>
  );
}
