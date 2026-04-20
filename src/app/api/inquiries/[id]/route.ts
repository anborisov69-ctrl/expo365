import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { parseWireInquiryStatus } from "@/lib/inquiry-wire-status";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const statusRaw = (body as Record<string, unknown>).status;
  const nextStatus = parseWireInquiryStatus(statusRaw);
  if (!nextStatus) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }

  try {
    const existing = await prisma.inquiry.findFirst({
      where: { id, companyId }
    });
    if (!existing) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: nextStatus }
    });

    return NextResponse.json({
      id: inquiry.id,
      status: inquiry.status
    });
  } catch (error) {
    console.error("PATCH /api/inquiries/[id]", error);
    return NextResponse.json({ error: "Не удалось обновить заявку" }, { status: 500 });
  }
}
