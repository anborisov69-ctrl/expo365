import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import { InquiryType } from "@prisma/client";
import { NextResponse } from "next/server";

function isInquiryType(value: unknown): value is InquiryType {
  return (
    typeof value === "string" &&
    (value === "CP" || value === "SAMPLE" || value === "SERVICE")
  );
}

export async function GET(request: Request) {
  const session = await getSessionFromCookies();
  const sessionCompanyId = await getCompanyIdForExhibitorSession(session);
  if (!sessionCompanyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId")?.trim();
  if (!companyId) {
    return NextResponse.json({ error: "Укажите companyId" }, { status: 400 });
  }
  if (companyId !== sessionCompanyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const typeParam = searchParams.get("type");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const typeFilter = typeParam && isInquiryType(typeParam) ? typeParam : undefined;

  const dateFrom = fromParam ? new Date(fromParam) : null;
  const dateTo = toParam ? new Date(toParam) : null;
  const dateWhere: { gte?: Date; lte?: Date } = {};
  if (dateFrom && !Number.isNaN(dateFrom.getTime())) {
    dateWhere.gte = dateFrom;
  }
  if (dateTo && !Number.isNaN(dateTo.getTime())) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    dateWhere.lte = end;
  }

  try {
    const rows = await prisma.inquiry.findMany({
      where: {
        companyId,
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(Object.keys(dateWhere).length > 0 ? { createdAt: dateWhere } : {})
      },
      orderBy: { createdAt: "desc" },
      include: { product: true }
    });

    const inquiries = rows.map((row) => ({
      id: row.id,
      productId: row.productId,
      productName: row.product?.name ?? "Запрос по компании",
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      message: row.message,
      type: row.type,
      status: row.status,
      createdAt: row.createdAt.toISOString()
    }));

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("GET /api/inquiries", error);
    return NextResponse.json({ error: "Не удалось загрузить заявки" }, { status: 500 });
  }
}
