import {
  companyMatchesDemandCategory,
  parseExpertiseCategoriesJson
} from "@/lib/expertise-categories";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { prisma } from "@/lib/prisma";
import { requireAuthSession } from "@/lib/require-auth-session";
import { DemandStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuthSession();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const row = await prisma.demandRequest.findUnique({
      where: { id },
      include: {
        visitor: { select: { name: true, email: true } },
        bids: {
          orderBy: { createdAt: "desc" },
          include: {
            company: { select: { name: true } }
          }
        }
      }
    });

    if (!row) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    const isOwnRequest = row.visitorId === auth.session.sub;
    let canBid = false;
    let bidBlockedReason: string | null = null;
    let existingBid: {
      id: string;
      proposal: string;
      price: string;
      contactEmail: string;
      contactPhone: string;
      createdAt: string;
    } | null = null;

    if (auth.session.role === "EXHIBITOR") {
      const companyId = await getCompanyIdForExhibitorSession(auth.session);
      if (!companyId) {
        bidBlockedReason = "Не найден профиль компании";
      } else {
        const company = await prisma.company.findUnique({
          where: { id: companyId },
          select: { expertiseCategories: true }
        });
        const expertise = parseExpertiseCategoriesJson(company?.expertiseCategories);

        const mine = row.bids.find((b) => b.companyId === companyId);
        if (mine) {
          existingBid = {
            id: mine.id,
            proposal: mine.proposal,
            price: mine.price,
            contactEmail: mine.contactEmail,
            contactPhone: mine.contactPhone,
            createdAt: mine.createdAt.toISOString()
          };
        }

        if (isOwnRequest) {
          bidBlockedReason = "Это ваша заявка";
        } else if (row.status !== DemandStatus.ACTIVE) {
          bidBlockedReason =
            row.status === DemandStatus.CLOSED ? "Заявка закрыта" : "Срок заявки истёк";
        } else if (mine) {
          bidBlockedReason = "Вы уже отправили отклик";
        } else if (!companyMatchesDemandCategory(expertise, row.category)) {
          bidBlockedReason = "Категория заявки не входит в вашу экспертизу";
        } else {
          canBid = true;
        }
      }
    }

    const demand = {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      quantity: row.quantity,
      deadline: row.deadline,
      budget: row.budget,
      status:
        row.status === DemandStatus.ACTIVE
          ? "active"
          : row.status === DemandStatus.CLOSED
            ? "closed"
            : "expired",
      createdAt: row.createdAt.toISOString(),
      visitorName: row.visitor.name,
      visitorEmail: isOwnRequest ? (row.visitor.email ?? undefined) : undefined
    };

    const bids = row.bids.map((b) => ({
      id: b.id,
      companyName: b.company.name,
      proposal: b.proposal,
      price: b.price,
      contactEmail: b.contactEmail,
      contactPhone: b.contactPhone,
      createdAt: b.createdAt.toISOString()
    }));

    return NextResponse.json({
      demand,
      bids,
      meta: {
        isOwnRequest,
        canBid,
        bidBlockedReason,
        existingBid,
        viewerRole: auth.session.role
      }
    });
  } catch (error) {
    console.error("GET /api/demand-feed/[id]", error);
    return NextResponse.json({ error: "Не удалось загрузить заявку" }, { status: 500 });
  }
}
