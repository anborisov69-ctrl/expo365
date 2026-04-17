import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { findUserByLoginIdentifier } from "@/lib/auth-user-lookup";
import { createSessionToken } from "@/lib/auth-sign";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type Body = {
  identifier?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const identifier =
    typeof body.identifier === "string"
      ? body.identifier.trim()
      : typeof body.email === "string"
        ? body.email.trim()
        : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return NextResponse.json({ error: "Укажите email или телефон и пароль" }, { status: 400 });
  }

  const user = await findUserByLoginIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json(
      { error: "Для учётной записи администратора используйте страницу /admin/login" },
      { status: 403 }
    );
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
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("login token error", error);
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
