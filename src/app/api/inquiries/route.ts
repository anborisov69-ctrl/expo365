import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inquirySchema = z.object({
  productId: z.string().min(1),
  message: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    if (!ensureRole(currentUser.role, "BUYER")) {
      return apiError("Only buyers can request quotations", 403);
    }

    const body = await request.json();
    const parsedBody = inquirySchema.safeParse(body);

    if (!parsedBody.success) {
      return apiError(parsedBody.error.issues[0]?.message ?? "Invalid inquiry payload", 422);
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedBody.data.productId }
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        buyerId: currentUser.userId,
        companyId: product.companyId,
        productId: product.id,
        message: parsedBody.data.message
      }
    });

    return apiSuccess(inquiry, 201);
  } catch (error) {
    return apiError(`Failed to create inquiry: ${(error as Error).message}`, 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    const inquiries =
      currentUser.role === "BUYER"
        ? await prisma.inquiry.findMany({
            where: { buyerId: currentUser.userId },
            include: { product: true, company: true },
            orderBy: { createdAt: "desc" }
          })
        : await prisma.inquiry.findMany({
            where: {
              company: {
                owner: {
                  some: {
                    id: currentUser.userId
                  }
                }
              }
            },
            include: { product: true, buyer: true },
            orderBy: { createdAt: "desc" }
          });

    return apiSuccess(inquiries);
  } catch (error) {
    return apiError(`Failed to fetch inquiries: ${(error as Error).message}`, 500);
  }
}
