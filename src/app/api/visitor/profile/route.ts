import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { normalizeLoginPhone } from "@/lib/phone-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireVisitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.session.sub },
      select: {
        name: true,
        email: true,
        visitorCompany: true,
        phone: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        visitorCompany: user.visitorCompany,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("GET /api/visitor/profile", error);
    return NextResponse.json({ error: "Не удалось загрузить профиль" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const visitorCompanyRaw = record.visitorCompany ?? record.buyerCompany;
  const visitorCompany =
    typeof visitorCompanyRaw === "string" ? visitorCompanyRaw.trim() : "";
  const phoneRaw = typeof record.phone === "string" ? record.phone.trim() : "";
  const normalizedPhone = phoneRaw ? normalizeLoginPhone(phoneRaw) : null;
  if (phoneRaw && !normalizedPhone) {
    return NextResponse.json({ error: "Укажите корректный номер телефона" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  }

  try {
    if (normalizedPhone) {
      const taken = await prisma.user.findFirst({
        where: {
          phone: normalizedPhone,
          NOT: { id: auth.session.sub }
        },
        select: { id: true }
      });
      if (taken) {
        return NextResponse.json({ error: "Этот телефон уже привязан к другому аккаунту" }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: auth.session.sub },
      data: {
        name,
        visitorCompany: visitorCompany === "" ? null : visitorCompany,
        phone: normalizedPhone
      },
      select: {
        name: true,
        email: true,
        visitorCompany: true,
        phone: true
      }
    });

    return NextResponse.json({
      profile: {
        name: updated.name,
        email: updated.email,
        visitorCompany: updated.visitorCompany,
        phone: updated.phone
      }
    });
  } catch (error) {
    console.error("PUT /api/visitor/profile", error);
    return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });
  }
}
