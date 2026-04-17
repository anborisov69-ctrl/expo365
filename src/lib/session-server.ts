import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { verifySessionToken, type SessionPayload } from "@/lib/auth-verify";
import { cookies } from "next/headers";

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}
