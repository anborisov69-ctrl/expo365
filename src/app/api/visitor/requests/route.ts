import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { parseProductCategory } from "@/lib/product-category-labels";
import { prisma } from "@/lib/prisma";
import { DemandStatus, ProductCategory } from "@prisma/client";
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
    const rows = await prisma.demandRequest.findMany({
      where: { visitorId: auth.session.sub },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        _count: { select: { bids: true } }
      }
    });

    const requests = rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      createdAt: row.createdAt.toISOString(),
      status: row.status === DemandStatus.ACTIVE ? "active" : row.status === DemandStatus.CLOSED ? "closed" : "expired",
      responseCount: row._count.bids
    }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("GET /api/visitor/requests", error);
    return NextResponse.json({ error: "Не удалось загрузить заявки" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireVisitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";
  const quantity = typeof record.quantity === "string" ? record.quantity.trim() : "";
  const deadline = typeof record.deadline === "string" ? record.deadline.trim() : "";
  const budget = typeof record.budget === "string" ? record.budget.trim() : "";
  const categoryRaw =
    parseProductCategory(typeof record.category === "string" ? record.category : null) ??
    ProductCategory.COFFEE;

  if (!title) {
    return NextResponse.json({ error: "Укажите название заявки" }, { status: 400 });
  }

  try {
    const created = await prisma.demandRequest.create({
      data: {
        title,
        description: description === "" ? null : description,
        category: categoryRaw,
        quantity: quantity === "" ? null : quantity,
        deadline: deadline === "" ? null : deadline,
        budget: budget === "" ? null : budget,
        visitorId: auth.session.sub
      }
    });

    return NextResponse.json({
      request: {
        id: created.id,
        title: created.title
      }
    });
  } catch (error) {
    console.error("POST /api/visitor/requests", error);
    return NextResponse.json({ error: "Не удалось создать заявку" }, { status: 500 });
  }
}
