import { jwtVerify } from "jose/jwt/verify";
import { getSecretBytes } from "@/lib/auth-secret";

export type SessionPayload = {
  sub: string;
  email: string | null;
  phone: string | null;
  role: "EXHIBITOR" | "VISITOR" | "ADMIN";
  /** ID администратора, если сессия создана при имперсонации */
  impersonatedBy?: string;
};

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const key = getSecretBytes();
  if (!key) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, key);
    return payloadToSession(payload as Record<string, unknown>);
  } catch {
    return null;
  }
}

function payloadToSession(payload: Record<string, unknown>): SessionPayload | null {
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const roleRaw = payload.role;
  const role: SessionPayload["role"] | null =
    roleRaw === "EXHIBITOR"
      ? "EXHIBITOR"
      : roleRaw === "VISITOR" || roleRaw === "BUYER"
        ? "VISITOR"
        : roleRaw === "ADMIN"
          ? "ADMIN"
          : null;

  if (!sub || !role) {
    return null;
  }

  const emailRaw = payload.email;
  const phoneRaw = payload.phone;

  const email =
    typeof emailRaw === "string" && emailRaw.length > 0 ? emailRaw : null;
  const phone =
    typeof phoneRaw === "string" && phoneRaw.length > 0 ? phoneRaw : null;

  if (!email && !phone) {
    return null;
  }

  const impRaw = payload.impersonatedBy;
  const impersonatedBy =
    typeof impRaw === "string" && impRaw.length > 0 ? impRaw : undefined;

  return { sub, email, phone, role, impersonatedBy };
}
