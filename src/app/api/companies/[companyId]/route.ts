import {
  buildCompanyUpdateData,
  companyRowToJson,
  companySelectApiFields,
  isUpdateEmpty,
  parseCompanyUpdateBody
} from "@/lib/company-update-shared";
import { getPublicCompanyPayload } from "@/lib/public-company-data";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Алиас: те же данные, что и GET /api/public/companies/[companyId] */
export async function GET(
  _request: Request,
  context: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await context.params;
  if (!companyId) {
    return NextResponse.json({ error: "Не указан идентификатор" }, { status: 400 });
  }

  try {
    const payload = await getPublicCompanyPayload(companyId);
    if (!payload) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/companies/[companyId]", error);
    return NextResponse.json({ error: "Не удалось загрузить данные" }, { status: 500 });
  }
}

/** Обновление профиля компании администратором (модалка в админке). */
export async function PUT(
  request: Request,
  context: { params: Promise<{ companyId: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { companyId } = await context.params;
  if (!companyId?.trim()) {
    return NextResponse.json({ error: "Не указан идентификатор" }, { status: 400 });
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

  const parsed = parseCompanyUpdateBody(body as Record<string, unknown>);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (isUpdateEmpty(parsed)) {
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
  }

  const exists = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true }
  });
  if (!exists) {
    return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  }

  const built = await buildCompanyUpdateData(companyId, parsed);
  if (built.error) {
    return NextResponse.json({ error: built.error }, { status: built.error === "Компания не найдена" ? 404 : 400 });
  }

  if (!built.data || Object.keys(built.data).length === 0) {
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
  }

  try {
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: built.data,
      select: companySelectApiFields
    });

    return NextResponse.json({ company: companyRowToJson(updated) });
  } catch (error) {
    console.error("PUT /api/companies/[companyId]", error);
    return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });
  }
}
