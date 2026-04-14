import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const companySchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().min(10),
  contacts: z.string().min(5)
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { company: true }
    });

    if (!user?.company) {
      return apiError("Company not found", 404);
    }

    return apiSuccess(user.company);
  } catch (error) {
    return apiError(`Failed to fetch company: ${(error as Error).message}`, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    if (!ensureRole(currentUser.role, "EXHIBITOR")) {
      return apiError("Only exhibitors can edit company profile", 403);
    }

    const body = await request.json();
    const parsedBody = companySchema.safeParse(body);

    if (!parsedBody.success) {
      return apiError(parsedBody.error.issues[0]?.message ?? "Invalid company payload", 422);
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.userId } });

    if (!user?.companyId) {
      return apiError("Company not found", 404);
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        logoUrl: parsedBody.data.logoUrl || null,
        description: parsedBody.data.description,
        contacts: parsedBody.data.contacts
      }
    });

    return apiSuccess(updatedCompany);
  } catch (error) {
    return apiError(`Failed to update company: ${(error as Error).message}`, 500);
  }
}
