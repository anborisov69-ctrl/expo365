import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    if (!ensureRole(currentUser.role, "EXHIBITOR")) {
      return apiError("Only exhibitors can access dashboard", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { company: true }
    });

    if (!user?.companyId) {
      return apiError("Company not found", 404);
    }

    const [inquiryCount, productsCount] = await Promise.all([
      prisma.inquiry.count({ where: { companyId: user.companyId } }),
      prisma.product.count({ where: { companyId: user.companyId } })
    ]);

    return apiSuccess({
      companyName: user.company?.name,
      standViews: user.company?.viewsCount ?? 0,
      inquiryCount,
      productsCount
    });
  } catch (error) {
    return apiError(`Failed to load exhibitor dashboard: ${(error as Error).message}`, 500);
  }
}
