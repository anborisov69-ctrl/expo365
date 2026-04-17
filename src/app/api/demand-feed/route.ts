import { parseProductCategory } from "@/lib/product-category-labels";
import { prisma } from "@/lib/prisma";
import { requireAuthSession } from "@/lib/require-auth-session";
import { DemandStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAuthSession();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const categoryFilter = parseProductCategory(searchParams.get("category"));
  const limitParam = searchParams.get("limit");
  const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam ?? "30", 10) || 30));

  try {
    const rows = await prisma.demandRequest.findMany({
      where: {
        status: DemandStatus.ACTIVE,
        ...(categoryFilter ? { category: categoryFilter } : {})
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        visitor: { select: { name: true } },
        _count: { select: { bids: true } }
      }
    });

    const demands = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      quantity: row.quantity,
      deadline: row.deadline,
      budget: row.budget,
      createdAt: row.createdAt.toISOString(),
      visitorName: row.visitor.name,
      responseCount: row._count.bids,
      isMine: row.visitorId === auth.session.sub
    }));

    return NextResponse.json({ demands });
  } catch (error) {
    console.error("GET /api/demand-feed", error);
    return NextResponse.json({ error: "Не удалось загрузить ленту спроса" }, { status: 500 });
  }
}
