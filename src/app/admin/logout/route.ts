import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
