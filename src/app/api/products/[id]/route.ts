import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { prisma } from "@/lib/prisma";

interface ProductRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: ProductRouteContext) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { company: true }
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    return apiSuccess(product);
  } catch (error) {
    return apiError(`Failed to fetch product: ${(error as Error).message}`, 500);
  }
}
