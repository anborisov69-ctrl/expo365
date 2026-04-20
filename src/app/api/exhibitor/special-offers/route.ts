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
    const offers = await prisma.specialOffer.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ offers });
  } catch (error) {
    console.error("GET /api/exhibitor/special-offers", error);
    return NextResponse.json({ error: "Не удалось загрузить спецпредложения" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
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
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const description = typeof o.description === "string" ? o.description.trim() : "";
  const price = typeof o.price === "string" ? o.price.trim() : "";
  const imageUrl =
    typeof o.imageUrl === "string" && o.imageUrl.trim() ? o.imageUrl.trim() : null;
  const isActive = typeof o.isActive === "boolean" ? o.isActive : true;

  if (!title || !description || !price) {
    return NextResponse.json({ error: "Заполните название, описание и цену" }, { status: 400 });
  }

  try {
    const offer = await prisma.specialOffer.create({
      data: {
        companyId,
        title,
        description,
        price,
        imageUrl,
        isActive
      }
    });
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("POST /api/exhibitor/special-offers", error);
    return NextResponse.json({ error: "Не удалось создать предложение" }, { status: 500 });
  }
}
