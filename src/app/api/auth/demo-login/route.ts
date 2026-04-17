import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth-sign";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const DEMO_CREDENTIALS = {
  exhibitor: {
    email: "demo@expo365.ru",
    passwordPlain: "demo123"
  },
  visitor: {
    email: "buyer@expo365.ru",
    passwordPlain: "buyer123"
  }
} as const;

type Preset = keyof typeof DEMO_CREDENTIALS;

export async function POST(request: Request) {
  const secureCookie = process.env.NODE_ENV === "production";
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { preset?: string };
  try {
    body = (await request.json()) as { preset?: string };
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const presetKey: Preset | null =
    body.preset === "exhibitor"
      ? "exhibitor"
      : body.preset === "visitor" || body.preset === "buyer"
        ? "visitor"
        : null;
  if (!presetKey) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const cfg = DEMO_CREDENTIALS[presetKey];
  const user = await prisma.user.findUnique({ where: { email: cfg.email } });
  if (!user) {
    return NextResponse.json(
      { error: "Демо-пользователь не найден. Выполните: npx prisma db seed" },
      { status: 404 }
    );
  }

  const match = await bcrypt.compare(cfg.passwordPlain, user.password);
  if (!match) {
    return NextResponse.json({ error: "Демо-аккаунт в базе не совпадает с seed" }, { status: 500 });
  }

  if (user.role !== "EXHIBITOR" && user.role !== "VISITOR") {
    return NextResponse.json({ error: "Демо-доступ только для экспонента или посетителя" }, { status: 400 });
  }

  try {
    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role === "EXHIBITOR" ? "EXHIBITOR" : "VISITOR"
    });

    const response = NextResponse.json({
      ok: true,
      redirect: user.role === "EXHIBITOR" ? "/exhibitor/dashboard" : "/visitor/dashboard"
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("demo-login error", error);
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
