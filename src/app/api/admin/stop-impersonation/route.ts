import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { createSessionToken } from "@/lib/auth-sign";
import { writeAdminLog } from "@/lib/admin-log";
import { getSessionFromCookies } from "@/lib/session-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSessionFromCookies();
  if (!session?.impersonatedBy) {
    return NextResponse.json({ error: "Режим имперсонации не активен" }, { status: 400 });
  }

  const adminId = session.impersonatedBy;
  const targetUserId = session.sub;

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { id: true, role: true, email: true, phone: true }
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Сессия администратора недействительна" }, { status: 403 });
  }

  try {
    const token = await createSessionToken({
      sub: admin.id,
      email: admin.email,
      phone: admin.phone,
      role: "ADMIN"
    });

    await writeAdminLog({
      adminId,
      action: "STOP_IMPERSONATION",
      targetUserId,
      details: { resumedAdminSession: true }
    });

    const response = NextResponse.json({
      ok: true,
      redirect: "/admin/dashboard"
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("stop impersonation error", error);
    return NextResponse.json({ error: "Не удалось завершить режим поддержки" }, { status: 500 });
  }
}
