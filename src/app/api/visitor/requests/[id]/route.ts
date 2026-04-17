import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { prisma } from "@/lib/prisma";
import { DemandStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireVisitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const row = await prisma.demandRequest.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { createdAt: "desc" },
          include: {
            company: { select: { name: true } }
          }
        }
      }
    });

    if (!row || row.visitorId !== auth.session.sub) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    const statusLabel =
      row.status === DemandStatus.ACTIVE
        ? "active"
        : row.status === DemandStatus.CLOSED
          ? "closed"
          : "expired";

    return NextResponse.json({
      request: {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        quantity: row.quantity,
        deadline: row.deadline,
        budget: row.budget,
        status: statusLabel,
        createdAt: row.createdAt.toISOString(),
        canClose: row.status === DemandStatus.ACTIVE
      },
      bids: row.bids.map((bid) => ({
        id: bid.id,
        companyName: bid.company.name,
        proposal: bid.proposal,
        price: bid.price,
        contactEmail: bid.contactEmail,
        contactPhone: bid.contactPhone,
        createdAt: bid.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error("GET /api/visitor/requests/[id]", error);
    return NextResponse.json({ error: "Не удалось загрузить заявку" }, { status: 500 });
  }
}
