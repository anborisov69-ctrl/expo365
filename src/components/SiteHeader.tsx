import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/auth-constants";
import type { UserRole } from "@/types/auth";
import { LogoutButton } from "@/components/LogoutButton";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  let role: UserRole | null = null;
  if (token) {
    try {
      role = verifyToken(token).role;
    } catch {
      role = null;
    }
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-semibold text-expoBlue">
          ЭКСПО 365
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/feed" className="text-expoBlue hover:underline">
            Новинки
          </Link>
          {role === "EXHIBITOR" && (
            <Link href="/exhibitor/dashboard" className="text-expoBlue hover:underline">
              Кабинет экспонента
            </Link>
          )}
          {role === "BUYER" && (
            <Link href="/buyer/dashboard" className="text-expoBlue hover:underline">
              Кабинет посетителя
            </Link>
          )}
          {!role && (
            <>
              <Link href="/exhibitor/dashboard" className="text-slate-500 hover:text-expoBlue">
                Кабинет экспонента
              </Link>
              <Link href="/buyer/dashboard" className="text-slate-500 hover:text-expoBlue">
                Кабинет посетителя
              </Link>
            </>
          )}
          {role ? (
            <LogoutButton />
          ) : (
            <>
              <Link href="/register" className="rounded border border-expoBlue px-3 py-2 text-expoBlue">
                Регистрация
              </Link>
              <Link href="/login" className="rounded bg-expoOrange px-3 py-2 text-white">
                Войти
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
