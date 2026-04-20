import { getSessionFromCookies } from "@/lib/session-server";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { normalizeProductMediaType } from "@/lib/product-media";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";
import { NextResponse } from "next/server";

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (Object.values(ProductCategory) as string[]).includes(value)
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 1 || keys[0] !== "isPublished") {
    return NextResponse.json(
      { error: "Разрешено только поле isPublished (boolean)" },
      { status: 400 }
    );
  }
  if (typeof record.isPublished !== "boolean") {
    return NextResponse.json({ error: "isPublished должен быть boolean" }, { status: 400 });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json({ error: "Новинка не найдена" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isPublished: record.isPublished },
      include: {
        company: {
          select: { name: true, logoUrl: true }
        }
      }
    });

    return NextResponse.json({
      product: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        price: updated.price,
        category: updated.category,
        imageUrl: updated.imageUrl,
        mediaType: updated.mediaType === "video" ? "video" : "image",
        mediaUrl: updated.mediaUrl,
        isSampleAvailable: updated.isSampleAvailable,
        isPublished: updated.isPublished,
        companyId: updated.companyId,
        company: {
          name: updated.company.name,
          logo: updated.company.logoUrl
        }
      }
    });
  } catch (error) {
    console.error("PATCH /api/products/[id]", error);
    return NextResponse.json({ error: "Не удалось обновить новинку" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";
  const price = typeof record.price === "string" ? record.price.trim() : "";
  const category = record.category;
  const imageUrl =
    typeof record.imageUrl === "string" && record.imageUrl.trim() !== ""
      ? record.imageUrl.trim()
      : null;
  const mediaUrl =
    typeof record.mediaUrl === "string" && record.mediaUrl.trim() !== ""
      ? record.mediaUrl.trim()
      : null;
  const mediaType = normalizeProductMediaType(record.mediaType);
  const isSampleAvailable = Boolean(record.isSampleAvailable);
  const isPublished =
    typeof record.isPublished === "boolean" ? record.isPublished : true;

  if (!name || !description || !price) {
    return NextResponse.json({ error: "Заполните название, описание и цену" }, { status: 400 });
  }

  if (!isProductCategory(category)) {
    return NextResponse.json({ error: "Укажите корректную категорию" }, { status: 400 });
  }

  if (mediaType === "video") {
    if (!mediaUrl || !imageUrl) {
      return NextResponse.json(
        { error: "Для видео укажите файл ролика и превью" },
        { status: 400 }
      );
    }
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json({ error: "Новинка не найдена" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        imageUrl,
        mediaType,
        mediaUrl: mediaType === "image" ? mediaUrl ?? imageUrl : mediaUrl,
        isSampleAvailable,
        isPublished
      },
      include: {
        company: {
          select: { name: true, logoUrl: true }
        }
      }
    });

    return NextResponse.json({
      product: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        price: updated.price,
        category: updated.category,
        imageUrl: updated.imageUrl,
        mediaType: updated.mediaType === "video" ? "video" : "image",
        mediaUrl: updated.mediaUrl,
        isSampleAvailable: updated.isSampleAvailable,
        isPublished: updated.isPublished,
        companyId: updated.companyId,
        company: {
          name: updated.company.name,
          logo: updated.company.logoUrl
        }
      }
    });
  } catch (error) {
    console.error("PUT /api/products/[id]", error);
    return NextResponse.json({ error: "Не удалось обновить новинку" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json({ error: "Новинка не найдена" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/products/[id]", error);
    return NextResponse.json({ error: "Не удалось удалить новинку" }, { status: 500 });
  }
}
