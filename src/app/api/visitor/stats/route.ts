import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { prisma } from "@/lib/prisma";
import { DemandStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireVisitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  const visitorId = auth.session.sub;

  try {
    const [demandsTotal, demandsActive, demandsClosed, bidsOnMyDemands] = await Promise.all([
      prisma.demandRequest.count({ where: { visitorId } }),
      prisma.demandRequest.count({
        where: { visitorId, status: DemandStatus.ACTIVE }
      }),
      prisma.demandRequest.count({
        where: { visitorId, status: DemandStatus.CLOSED }
      }),
      prisma.bid.count({
        where: { demandRequest: { visitorId } }
      })
    ]);

    return NextResponse.json({
      demandsTotal,
      demandsActive,
      demandsClosed,
      bidsOnMyDemands
    });
  } catch (error) {
    console.error("GET /api/visitor/stats", error);
    return NextResponse.json({ error: "Не удалось загрузить статистику" }, { status: 500 });
  }
}
