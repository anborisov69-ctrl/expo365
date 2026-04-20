import { getSessionFromCookies } from "@/lib/session-server";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import {
  buildCompanyUpdateData,
  companyRowToJson,
  companySelectApiFields,
  isUpdateEmpty,
  parseCompanyUpdateBody
} from "@/lib/company-update-shared";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
      select: companySelectApiFields
    });
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { name: true, email: true }
    });

    if (!company || !user) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    return NextResponse.json({
      company: companyRowToJson(company),
      user
    });
  } catch (error) {
    console.error("GET /api/exhibitor/company", error);
    return NextResponse.json({ error: "Не удалось загрузить профиль" }, { status: 500 });
  }
}

async function handleExhibitorCompanyWrite(request: Request) {
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

  const parsed = parseCompanyUpdateBody(body as Record<string, unknown>);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (isUpdateEmpty(parsed)) {
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
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
    console.error("PATCH/PUT /api/exhibitor/company", error);
    return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return handleExhibitorCompanyWrite(request);
}

/** Полное обновление профиля компании экспонента (алиас PATCH). */
export async function PUT(request: Request) {
  return handleExhibitorCompanyWrite(request);
}
