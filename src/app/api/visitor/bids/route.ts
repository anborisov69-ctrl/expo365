import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireVisitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit =
    limitParam !== null ? Math.min(100, Math.max(1, Number.parseInt(limitParam, 10) || 50)) : undefined;

  try {
    const rows = await prisma.bid.findMany({
      where: {
        demandRequest: { visitorId: auth.session.sub }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        demandRequest: { select: { title: true } },
        company: { select: { name: true } }
      }
    });

    const bids = rows.map((row) => ({
      id: row.id,
      demandTitle: row.demandRequest.title,
      companyName: row.company.name,
      proposal: row.proposal,
      price: row.price,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      createdAt: row.createdAt.toISOString()
    }));

    return NextResponse.json({ bids });
  } catch (error) {
    console.error("GET /api/visitor/bids", error);
    return NextResponse.json({ error: "Не удалось загрузить отклики" }, { status: 500 });
  }
}
