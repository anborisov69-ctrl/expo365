import { SignJWT } from "jose/jwt/sign";
import { requireSecretBytes } from "@/lib/auth-secret";
import type { SessionPayload } from "@/lib/auth-verify";

export async function createSessionToken(user: SessionPayload): Promise<string> {
  const claims: Record<string, string> = { role: user.role };
  if (user.email) {
    claims.email = user.email;
  }
  if (user.phone) {
    claims.phone = user.phone;
  }
  if (user.impersonatedBy) {
    claims.impersonatedBy = user.impersonatedBy;
  }
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(requireSecretBytes());
}
