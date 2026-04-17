import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireVisitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const rows = await prisma.inquiry.findMany({
      where: { visitorId: auth.session.sub },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
        company: { select: { name: true } }
      }
    });

    const inquiries = rows.map((row) => ({
      id: row.id,
      productName: row.product.name,
      companyName: row.company.name,
      createdAt: row.createdAt.toISOString(),
      type: row.type,
      status: row.status
    }));

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("GET /api/visitor/inquiries", error);
    return NextResponse.json({ error: "Не удалось загрузить запросы" }, { status: 500 });
  }
}
