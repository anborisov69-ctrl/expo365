import type { SessionPayload } from "@/lib/auth-verify";
import { getSessionFromCookies } from "@/lib/session-server";
import { NextResponse } from "next/server";

export async function requireVisitorSession(): Promise<
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse }
> {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "VISITOR") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Требуется авторизация посетителя" }, { status: 401 })
    };
  }
  return { ok: true, session };
}
