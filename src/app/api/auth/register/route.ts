import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth-sign";
import { normalizeLoginPhone } from "@/lib/phone-auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const SALT_ROUNDS = 12;

/** Упрощённая проверка для тестирования: не пусто и есть «@» */
function isValidEmailLoose(value: string): boolean {
  const t = value.trim();
  return t.length >= 3 && t.includes("@");
}

type Body = {
  email?: string;
  phone?: string;
  password?: string;
  name?: string;
  role?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const roleRaw = typeof body.role === "string" ? body.role : "";
  if (roleRaw === "ADMIN") {
    return NextResponse.json({ error: "Недопустимая роль" }, { status: 400 });
  }
  const role: "EXHIBITOR" | "VISITOR" | null =
    roleRaw === "EXHIBITOR"
      ? "EXHIBITOR"
      : roleRaw === "VISITOR" || roleRaw === "BUYER"
        ? "VISITOR"
        : null;

  const normalizedPhone = phoneRaw ? normalizeLoginPhone(phoneRaw) : null;
  if (phoneRaw && !normalizedPhone) {
    return NextResponse.json({ error: "Укажите корректный номер телефона (Россия)" }, { status: 400 });
  }

  if (!password || !name || !role) {
    return NextResponse.json({ error: "Заполните имя, пароль и выберите роль" }, { status: 400 });
  }

  if (!emailRaw && !normalizedPhone) {
    return NextResponse.json({ error: "Укажите email или телефон (можно оба)" }, { status: 400 });
  }

  if (emailRaw && !isValidEmailLoose(emailRaw)) {
    return NextResponse.json(
      { error: "Укажите email: минимум 3 символа и знак @" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Пароль не короче 8 символов" }, { status: 400 });
  }

  if (emailRaw) {
    const existingEmail = await prisma.user.findUnique({ where: { email: emailRaw } });
    if (existingEmail) {
      return NextResponse.json({ error: "Пользователь с таким email уже есть" }, { status: 409 });
    }
  }

  if (normalizedPhone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (existingPhone) {
      return NextResponse.json({ error: "Пользователь с таким телефоном уже есть" }, { status: 409 });
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: emailRaw ? emailRaw : null,
          phone: normalizedPhone,
          password: passwordHash,
          name,
          role: role === "EXHIBITOR" ? "EXHIBITOR" : "VISITOR"
        }
      });

      if (role === "EXHIBITOR") {
        await tx.company.create({
          data: {
            userId: created.id,
            name: `Компания ${name} (заглушка)`
          }
        });
      }

      return created;
    });

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
    console.error("register error", error);
    return NextResponse.json({ error: "Не удалось зарегистрироваться" }, { status: 500 });
  }
}
