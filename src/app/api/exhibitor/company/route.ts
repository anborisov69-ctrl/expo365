import { getSessionFromCookies } from "@/lib/session-server";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";
import { NextResponse } from "next/server";

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (Object.values(ProductCategory) as string[]).includes(value)
  );
}

function parseExpertiseCategories(raw: unknown): ProductCategory[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const next: ProductCategory[] = [];
  for (const item of raw) {
    if (isProductCategory(item)) {
      next.push(item);
    }
  }
  return next;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "EXHIBITOR") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        description: true,
        website: true,
        expertiseCategories: true
      }
    });
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { name: true, email: true }
    });

    if (!company || !user) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    return NextResponse.json({
      company,
      user
    });
  } catch (error) {
    console.error("GET /api/exhibitor/company", error);
    return NextResponse.json({ error: "Не удалось загрузить профиль" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
  const name = typeof record.name === "string" ? record.name.trim() : undefined;
  const logoUrl =
    typeof record.logoUrl === "string" && record.logoUrl.trim() !== ""
      ? record.logoUrl.trim()
      : record.logoUrl === null || record.logoUrl === ""
        ? null
        : undefined;
  const description =
    typeof record.description === "string"
      ? record.description.trim() === ""
        ? null
        : record.description.trim()
      : record.description === null
        ? null
        : undefined;
  const website =
    typeof record.website === "string"
      ? record.website.trim() === ""
        ? null
        : record.website.trim()
      : record.website === null
        ? null
        : undefined;

  let expertiseJson: string | undefined;
  if ("expertiseCategories" in record) {
    const parsed = parseExpertiseCategories(record.expertiseCategories);
    if (parsed === null) {
      return NextResponse.json({ error: "Некорректный список категорий" }, { status: 400 });
    }
    expertiseJson = JSON.stringify(parsed);
  }

  if (
    name === undefined &&
    logoUrl === undefined &&
    description === undefined &&
    website === undefined &&
    expertiseJson === undefined
  ) {
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
  }

  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "Укажите название компании" }, { status: 400 });
  }

  try {
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(website !== undefined ? { website } : {}),
        ...(expertiseJson !== undefined ? { expertiseCategories: expertiseJson } : {})
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        description: true,
        website: true,
        expertiseCategories: true
      }
    });

    return NextResponse.json({ company: updated });
  } catch (error) {
    console.error("PATCH /api/exhibitor/company", error);
    return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });
  }
}
