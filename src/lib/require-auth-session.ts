import type { SessionPayload } from "@/lib/auth-verify";
import { getSessionFromCookies } from "@/lib/session-server";
import { NextResponse } from "next/server";

export async function requireAuthSession(): Promise<
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse }
> {
  const session = await getSessionFromCookies();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Требуется авторизация" }, { status: 401 })
    };
  }
  return { ok: true, session };
}

export async function requireExhibitorSession(): Promise<
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse }
> {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "EXHIBITOR") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Требуется роль экспонента" }, { status: 403 })
    };
  }
  return { ok: true, session };
}
