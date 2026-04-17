import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { createSessionToken } from "@/lib/auth-sign";
import { writeAdminLog } from "@/lib/admin-log";
import { requireAdminSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

type Body = {
  userId?: string;
  role?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth.response;
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const roleRaw = typeof body.role === "string" ? body.role.trim() : "";
  const role =
    roleRaw === "EXHIBITOR" || roleRaw === "VISITOR"
      ? (roleRaw as "EXHIBITOR" | "VISITOR")
      : null;

  if (!userId || !role) {
    return NextResponse.json({ error: "Укажите userId и role (EXHIBITOR или VISITOR)" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, phone: true }
  });

  if (!target) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  if (target.role === Role.ADMIN) {
    return NextResponse.json({ error: "Нельзя войти под другим администратором" }, { status: 403 });
  }

  if (target.role !== role) {
    return NextResponse.json({ error: "Роль не совпадает с учётной записью" }, { status: 400 });
  }

  try {
    const token = await createSessionToken({
      sub: target.id,
      email: target.email,
      phone: target.phone,
      role,
      impersonatedBy: auth.session.sub
    });

    await writeAdminLog({
      adminId: auth.session.sub,
      action: "IMPERSONATE",
      targetUserId: target.id,
      details: { from: auth.session.sub }
    });

    const redirect =
      role === "EXHIBITOR" ? "/exhibitor/dashboard" : "/visitor/dashboard";

    const response = NextResponse.json({ ok: true, redirect });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("impersonate error", error);
    return NextResponse.json({ error: "Не удалось выполнить вход" }, { status: 500 });
  }
}
