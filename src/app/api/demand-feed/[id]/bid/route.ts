import {
  companyMatchesDemandCategory,
  parseExpertiseCategoriesJson
} from "@/lib/expertise-categories";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { prisma } from "@/lib/prisma";
import { requireExhibitorSession } from "@/lib/require-auth-session";
import { DemandStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireExhibitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: demandId } = await context.params;
  const companyId = await getCompanyIdForExhibitorSession(auth.session);
  if (!companyId) {
    return NextResponse.json({ error: "Не найден профиль компании" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const proposal = typeof record.proposal === "string" ? record.proposal.trim() : "";
  const price = typeof record.price === "string" ? record.price.trim() : "";
  const contactEmail = typeof record.contactEmail === "string" ? record.contactEmail.trim() : "";
  const contactPhone = typeof record.contactPhone === "string" ? record.contactPhone.trim() : "";

  if (!proposal || !price || !contactEmail || !contactPhone) {
    return NextResponse.json(
      { error: "Заполните предложение, цену, email и телефон" },
      { status: 400 }
    );
  }

  try {
    const demand = await prisma.demandRequest.findUnique({
      where: { id: demandId },
      select: {
        id: true,
        visitorId: true,
        status: true,
        category: true
      }
    });

    if (!demand) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    if (demand.visitorId === auth.session.sub) {
      return NextResponse.json({ error: "Нельзя откликаться на собственную заявку" }, { status: 403 });
    }

    if (demand.status !== DemandStatus.ACTIVE) {
      return NextResponse.json({ error: "Заявка не принимает отклики" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { expertiseCategories: true }
    });
    const expertise = parseExpertiseCategoriesJson(company?.expertiseCategories);
    if (!companyMatchesDemandCategory(expertise, demand.category)) {
      return NextResponse.json(
        { error: "Категория заявки не входит в вашу экспертизу" },
        { status: 403 }
      );
    }

    const created = await prisma.bid.create({
      data: {
        demandId: demand.id,
        companyId,
        proposal,
        price,
        contactEmail,
        contactPhone
      }
    });

    return NextResponse.json({
      bid: {
        id: created.id,
        createdAt: created.createdAt.toISOString()
      }
    });
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "Отклик от вашей компании уже есть" }, { status: 409 });
    }
    console.error("POST /api/demand-feed/[id]/bid", error);
    return NextResponse.json({ error: "Не удалось отправить отклик" }, { status: 500 });
  }
}
