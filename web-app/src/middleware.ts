import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { roleAtLeast, UserRole } from "@/lib/roles";

const protectedRoutes: { pattern: RegExp; minRole: UserRole }[] = [
  { pattern: /^\/dashboard/, minRole: "student" },
  { pattern: /^\/faculty\//, minRole: "faculty" },
  { pattern: /^\/management\//, minRole: "management" },
  { pattern: /^\/principal\//, minRole: "principal" },
  { pattern: /^\/hod\//, minRole: "hod" },
  { pattern: /^\/committee\//, minRole: "committee_gs" },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const route = protectedRoutes.find((r) => r.pattern.test(pathname));
  if (!route) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL("/", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  const userRole = (token.role || "student") as UserRole;
  if (!roleAtLeast(userRole, route.minRole)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/faculty/:path*", "/management/:path*", "/principal/:path*", "/hod/:path*", "/committee/:path*"],
};
