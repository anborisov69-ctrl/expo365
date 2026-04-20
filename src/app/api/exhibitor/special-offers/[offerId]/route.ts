import { getSessionFromCookies } from "@/lib/session-server";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await context.params;
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const existing = await prisma.specialOffer.findFirst({
    where: { id: offerId, companyId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }
  const o = body as Record<string, unknown>;

  const data: {
    title?: string;
    description?: string;
    price?: string;
    imageUrl?: string | null;
    isActive?: boolean;
  } = {};

  if (typeof o.title === "string") {
    const t = o.title.trim();
    if (!t) return NextResponse.json({ error: "Пустое название" }, { status: 400 });
    data.title = t;
  }
  if (typeof o.description === "string") {
    const t = o.description.trim();
    if (!t) return NextResponse.json({ error: "Пустое описание" }, { status: 400 });
    data.description = t;
  }
  if (typeof o.price === "string") {
    const t = o.price.trim();
    if (!t) return NextResponse.json({ error: "Пустая цена" }, { status: 400 });
    data.price = t;
  }
  if (o.imageUrl === null || (typeof o.imageUrl === "string" && !o.imageUrl.trim())) {
    data.imageUrl = null;
  } else if (typeof o.imageUrl === "string") {
    data.imageUrl = o.imageUrl.trim();
  }
  if (typeof o.isActive === "boolean") {
    data.isActive = o.isActive;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
  }

  try {
    const offer = await prisma.specialOffer.update({
      where: { id: offerId },
      data
    });
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("PATCH /api/exhibitor/special-offers/[offerId]", error);
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await context.params;
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const existing = await prisma.specialOffer.findFirst({
    where: { id: offerId, companyId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  try {
    await prisma.specialOffer.delete({ where: { id: offerId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/exhibitor/special-offers/[offerId]", error);
    return NextResponse.json({ error: "Не удалось удалить" }, { status: 500 });
  }
}
