import { prisma } from "@/lib/prisma";
import { isEmailLike, normalizeLoginPhone } from "@/lib/phone-auth";

export async function findUserByLoginIdentifier(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  if (isEmailLike(trimmed)) {
    return prisma.user.findUnique({
      where: { email: trimmed.toLowerCase() }
    });
  }
  const phone = normalizeLoginPhone(trimmed);
  if (!phone) {
    return null;
  }
  return prisma.user.findUnique({ where: { phone } });
}
