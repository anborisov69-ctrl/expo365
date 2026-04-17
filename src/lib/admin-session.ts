import type { SessionPayload } from "@/lib/auth-verify";
import { getSessionFromCookies } from "@/lib/session-server";
import { NextResponse } from "next/server";

export async function requireAdminSession(): Promise<
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse }
> {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Требуются права администратора" }, { status: 403 })
    };
  }
  return { ok: true, session };
}
