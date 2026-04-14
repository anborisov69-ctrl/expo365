import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/auth-constants";
import type { UserRole } from "@/types/auth";

function getJwtSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

async function getSessionRole(request: NextRequest): Promise<UserRole | null> {
  const key = getJwtSecretKey();
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  if (!key || !token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, key);
    const role = payload.role;
    if (role === "EXHIBITOR" || role === "BUYER") {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const role = await getSessionRole(request);

  if (pathname.startsWith("/exhibitor")) {
    if (!role) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (role !== "EXHIBITOR") {
      url.pathname = "/feed";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/buyer")) {
    if (!role) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (role !== "BUYER") {
      url.pathname = "/feed";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/exhibitor/:path*", "/buyer/:path*"]
};
