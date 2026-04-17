import {
  DEMO_COOKIE_EMAIL,
  DEMO_COOKIE_ROLE,
  normalizeDemoRole
} from "@/lib/demo-local-auth";
import { getSessionFromCookies } from "@/lib/session-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSessionFromCookies();
  if (session) {
    return NextResponse.json({
      authenticated: true as const,
      source: "session" as const,
      role: session.role,
      email: session.email ?? null,
      sub: session.sub
    });
  }

  const jar = await cookies();
  const rawRole = jar.get(DEMO_COOKIE_ROLE)?.value;
  const email = jar.get(DEMO_COOKIE_EMAIL)?.value ?? null;
  const role = normalizeDemoRole(rawRole ?? undefined);
  if (role) {
    return NextResponse.json({
      authenticated: true as const,
      source: "demo" as const,
      role,
      email,
      name: email ? email.split("@")[0] : null
    });
  }

  return NextResponse.json({ authenticated: false as const }, { status: 401 });
}
