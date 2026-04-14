import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().min(2),
  price: z.number().positive(),
  sampleAvailable: z.boolean()
});

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");
    const cursor = request.nextUrl.searchParams.get("cursor");
    const take = Number(request.nextUrl.searchParams.get("take") ?? 12);

    const where: Prisma.ProductWhereInput = category ? { category } : {};
    const products = await prisma.product.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(take, 24),
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });

    const nextCursor = products.length === Math.min(take, 24) ? products[products.length - 1]?.id : null;

    return apiSuccess({ items: products, nextCursor });
  } catch (error) {
    return apiError(`Failed to fetch products: ${(error as Error).message}`, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    if (!ensureRole(currentUser.role, "EXHIBITOR")) {
      return apiError("Only exhibitors can create products", 403);
    }

    const exhibitor = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { companyId: true }
    });

    if (!exhibitor?.companyId) {
      return apiError("Exhibitor company is not configured", 422);
    }

    const body = await request.json();
    const parsedBody = createProductSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiError(parsedBody.error.issues[0]?.message ?? "Invalid product payload", 422);
    }

    const createdProduct = await prisma.product.create({
      data: {
        ...parsedBody.data,
        imageUrl: parsedBody.data.imageUrl || null,
        companyId: exhibitor.companyId,
        price: parsedBody.data.price
      }
    });

    return apiSuccess(createdProduct, 201);
  } catch (error) {
    return apiError(`Failed to create product: ${(error as Error).message}`, 500);
  }
}
