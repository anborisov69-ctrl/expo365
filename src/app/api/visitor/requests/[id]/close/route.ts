import { requireVisitorSession } from "@/lib/visitor-api-auth";
import { prisma } from "@/lib/prisma";
import { DemandStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(_request: Request, context: RouteContext) {
  const auth = await requireVisitorSession();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.demandRequest.findUnique({
      where: { id },
      select: { visitorId: true, status: true }
    });

    if (!existing || existing.visitorId !== auth.session.sub) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    if (existing.status !== DemandStatus.ACTIVE) {
      return NextResponse.json({ error: "Заявка уже закрыта или недоступна" }, { status: 400 });
    }

    await prisma.demandRequest.update({
      where: { id },
      data: { status: DemandStatus.CLOSED }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/visitor/requests/[id]/close", error);
    return NextResponse.json({ error: "Не удалось закрыть заявку" }, { status: 500 });
  }
}
