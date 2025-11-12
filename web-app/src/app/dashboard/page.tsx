import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  const role = (session as any)?.role as string | undefined;
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm text-gray-600">Role: <span className="font-medium">{role}</span></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Attendance">
            <ul className="list-disc ml-5 text-sm">
              <li><Link className="text-blue-600 hover:underline" href="/faculty/attendance">Faculty: Create session</Link></li>
              <li><Link className="text-blue-600 hover:underline" href="/checkin">Student: Check-in</Link></li>
            </ul>
          </Card>
          <Card title="Committees">
            <p className="text-sm text-gray-700">GS tools and workflows (demo placeholders).</p>
          </Card>
          <Card title="Analytics">
            <p className="text-sm text-gray-700">Role-based analytics and summaries (demo placeholders).</p>
          </Card>
          <Card title="Services">
            <p className="text-sm text-gray-700">Student services and requests (demo placeholders).</p>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-medium">{title}</div>
      {children}
    </div>
  );
}
