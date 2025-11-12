"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Nav() {
  const { data: session } = useSession();
  return (
    <div className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-3">
        <Link href="/dashboard" className="font-semibold">CampusSync</Link>
        <div className="flex items-center gap-3 text-sm">
          <Link className="hover:underline" href="/dashboard">Dashboard</Link>
          <Link className="hover:underline" href="/checkin">Check-in</Link>
          <Link className="hover:underline" href="/faculty/attendance">Faculty</Link>
          {session && (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded bg-gray-100 px-2 py-1 hover:bg-gray-200">Sign out</button>
          )}
        </div>
      </div>
    </div>
  );
}
