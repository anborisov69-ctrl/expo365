import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const [productsTotal, inquiriesTotal, bidsSubmitted, productsLastWeek] = await Promise.all([
      prisma.product.count({ where: { companyId } }),
      prisma.inquiry.count({ where: { companyId } }),
      prisma.bid.count({ where: { companyId } }),
      prisma.product.findMany({
        where: {
          companyId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: { createdAt: true }
      })
    ]);

    const countByDay = new Map<string, number>();
    for (const row of productsLastWeek) {
      const key = row.createdAt.toISOString().slice(0, 10);
      countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
    }

    const chartSeries: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      chartSeries.push({
        label: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        count: countByDay.get(key) ?? 0
      });
    }

    return NextResponse.json({
      productsTotal,
      inquiriesTotal,
      bidsSubmitted,
      chartSeries
    });
  } catch (error) {
    console.error("GET /api/exhibitor/stats", error);
    return NextResponse.json({ error: "Не удалось загрузить статистику" }, { status: 500 });
  }
}
