import { getSessionFromCookies } from "@/lib/session-server";
import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const rows = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { name: true, logoUrl: true }
        },
        _count: {
          select: { inquiries: true }
        }
      }
    });

    const products = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      category: row.category,
      imageUrl: row.imageUrl,
      mediaType: row.mediaType === "video" ? "video" : "image",
      mediaUrl: row.mediaUrl,
      isSampleAvailable: row.isSampleAvailable,
      inquiryCount: row._count.inquiries,
      company: {
        name: row.company.name,
        logo: row.company.logoUrl
      }
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/exhibitor/products", error);
    return NextResponse.json({ error: "Не удалось загрузить новинки" }, { status: 500 });
  }
}
