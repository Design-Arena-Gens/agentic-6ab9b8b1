"use client";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      const redirect = searchParams.get("redirect");
      router.replace(redirect || "/dashboard");
    }
  }, [session, router, searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { username, password, redirect: false });
    if (res?.error) setError("Invalid credentials");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold mb-2">CampusSync</h1>
        <p className="text-sm text-gray-600 mb-6">Sign in with a demo role user.</p>
        {error && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring" placeholder="e.g. faculty" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring" type="password" placeholder="pass123" />
          </div>
          <button className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Sign in</button>
        </form>
        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium mb-1">Demo accounts:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>management / pass123</li>
            <li>principal / pass123</li>
            <li>hod / pass123</li>
            <li>faculty / pass123</li>
            <li>commgs / pass123</li>
            <li>jrgs / pass123</li>
            <li>chead / pass123</li>
            <li>student / pass123</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
