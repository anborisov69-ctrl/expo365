import type { SessionPayload } from "@/lib/auth-verify";
import { prisma } from "@/lib/prisma";

export async function getCompanyIdForExhibitorSession(
  session: SessionPayload | null
): Promise<string | null> {
  if (!session || session.role !== "EXHIBITOR") {
    return null;
  }
  const company = await prisma.company.findUnique({
    where: { userId: session.sub },
    select: { id: true }
  });
  return company?.id ?? null;
}
