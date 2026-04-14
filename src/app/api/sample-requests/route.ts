import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sampleRequestSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100).default(1)
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    if (!ensureRole(currentUser.role, "BUYER")) {
      return apiError("Only buyers can request samples", 403);
    }

    const body = await request.json();
    const parsedBody = sampleRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiError(parsedBody.error.issues[0]?.message ?? "Invalid sample request payload", 422);
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedBody.data.productId }
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    if (!product.sampleAvailable) {
      return apiError("Samples are not available for this product", 422);
    }

    const sampleRequest = await prisma.sampleRequest.create({
      data: {
        buyerId: currentUser.userId,
        productId: product.id,
        quantity: parsedBody.data.quantity
      }
    });

    return apiSuccess(sampleRequest, 201);
  } catch (error) {
    return apiError(`Failed to create sample request: ${(error as Error).message}`, 500);
  }
}
