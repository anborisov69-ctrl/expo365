import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { requireAuthSession } from "@/lib/require-auth-session";
import { prisma } from "@/lib/prisma";
import { InquiryType } from "@prisma/client";
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
      productName: row.product?.name ?? "Запрос по компании",
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

function isInquiryType(value: unknown): value is InquiryType {
  return value === "CP" || value === "SAMPLE" || value === "SERVICE";
}

/** Создание заявки (КП, образец и др.): любая авторизованная роль, запись в Inquiry. */
export async function POST(request: Request) {
  const auth = await requireAuthSession();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const companyId = typeof o.companyId === "string" ? o.companyId.trim() : "";
  const productId =
    typeof o.productId === "string" && o.productId.trim() ? o.productId.trim() : null;
  const typeRaw = o.type;
  const message = typeof o.message === "string" ? o.message.trim() : "";

  if (!companyId) {
    return NextResponse.json({ error: "Укажите компанию" }, { status: 400 });
  }
  if (!isInquiryType(typeRaw)) {
    return NextResponse.json({ error: "Некорректный тип заявки" }, { status: 400 });
  }
  if (typeRaw === "SAMPLE" && !productId) {
    return NextResponse.json({ error: "Для образца укажите товар" }, { status: 400 });
  }

  try {
    const [user, company] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.session.sub } }),
      prisma.company.findUnique({ where: { id: companyId }, select: { id: true } })
    ]);

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    if (!company) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }

    if (productId) {
      const product = await prisma.product.findFirst({
        where: { id: productId, companyId, isPublished: true }
      });
      if (!product) {
        return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
      }
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        companyId,
        productId,
        visitorId: auth.session.sub,
        customerName: user.name,
        customerEmail: user.email ?? "",
        customerPhone: user.phone ?? null,
        message:
          message ||
          (typeRaw === "CP"
            ? "Запрос коммерческого предложения"
            : typeRaw === "SAMPLE"
              ? "Запрос образца"
              : "Запрос на услугу"),
        type: typeRaw
      }
    });

    return NextResponse.json({ id: inquiry.id, ok: true });
  } catch (error) {
    console.error("POST /api/visitor/inquiries", error);
    return NextResponse.json({ error: "Не удалось сохранить заявку" }, { status: 500 });
  }
}
