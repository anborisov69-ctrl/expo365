import { getSessionFromCookies } from "@/lib/session-server";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { normalizeProductMediaType } from "@/lib/product-media";
import { parseCategoryQueryParam } from "@/lib/product-category-map";
import { prisma } from "@/lib/prisma";
import { type Prisma, ProductCategory } from "@prisma/client";
import { NextResponse } from "next/server";

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (Object.values(ProductCategory) as string[]).includes(value)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const rawCategories = searchParams.getAll("category");
  const parsedCategories = rawCategories
    .map((value) => parseCategoryQueryParam(value))
    .filter((value): value is ProductCategory => value !== null);

  const distinctCategories = [...new Set(parsedCategories)];

  const session = await getSessionFromCookies();
  const ownCompanyId = await getCompanyIdForExhibitorSession(session);
  const ownerBrowsingOwnCatalog =
    Boolean(ownCompanyId && companyId && companyId === ownCompanyId);

  const where: Prisma.ProductWhereInput = {};

  if (companyId) {
    where.companyId = companyId;
  }

  if (distinctCategories.length > 0) {
    where.category = { in: distinctCategories };
  }

  if (!ownerBrowsingOwnCatalog) {
    where.isPublished = true;
  }

  try {
    const rows = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });

    const products = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      category: row.category,
      imageUrl: row.imageUrl,
      mediaType: row.mediaType === "video" ? "video" : "image",
      mediaUrl: row.mediaUrl,
      isSampleAvailable: row.isSampleAvailable,
      isPublished: row.isPublished,
      companyId: row.companyId,
      company: {
        name: row.company.name,
        logo: row.company.logoUrl
      }
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products", error);
    return NextResponse.json({ error: "Не удалось загрузить новинки" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

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
    const created = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        imageUrl,
        mediaType,
        mediaUrl: mediaType === "image" ? mediaUrl ?? imageUrl : mediaUrl,
        isSampleAvailable,
        isPublished,
        companyId
      },
      include: {
        company: {
          select: { name: true, logoUrl: true }
        }
      }
    });

    return NextResponse.json({
      product: {
        id: created.id,
        name: created.name,
        description: created.description,
        price: created.price,
        category: created.category,
        imageUrl: created.imageUrl,
        mediaType: created.mediaType === "video" ? "video" : "image",
        mediaUrl: created.mediaUrl,
        isSampleAvailable: created.isSampleAvailable,
        isPublished: created.isPublished,
        companyId: created.companyId,
        company: {
          name: created.company.name,
          logo: created.company.logoUrl
        }
      }
    });
  } catch (error) {
    console.error("POST /api/products", error);
    return NextResponse.json({ error: "Не удалось создать новинку" }, { status: 500 });
  }
}
