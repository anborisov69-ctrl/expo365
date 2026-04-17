import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import { DemandStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const rows = await prisma.bid.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        demandRequest: {
          select: {
            id: true,
            title: true,
            status: true,
            category: true
          }
        }
      }
    });

    const bids = rows.map((row) => ({
      id: row.id,
      demandId: row.demandRequest.id,
      demandTitle: row.demandRequest.title,
      demandStatus:
        row.demandRequest.status === DemandStatus.ACTIVE
          ? "active"
          : row.demandRequest.status === DemandStatus.CLOSED
            ? "closed"
            : "expired",
      proposal: row.proposal,
      price: row.price,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      bidStatus: row.status,
      createdAt: row.createdAt.toISOString()
    }));

    return NextResponse.json({ bids });
  } catch (error) {
    console.error("GET /api/exhibitor/bids", error);
    return NextResponse.json({ error: "Не удалось загрузить отклики" }, { status: 500 });
  }
}
