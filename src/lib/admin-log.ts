import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAdminLog(params: {
  adminId: string;
  action: string;
  targetUserId?: string | null;
  details?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.adminLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetUserId: params.targetUserId ?? null,
      ...(params.details !== undefined ? { details: params.details } : {})
    }
  });
}
