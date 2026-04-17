"use client";

import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import { cabinetPathForRole, readDemoSession } from "@/lib/demo-local-auth";
import { landingNavItems } from "@/lib/landing-data";
import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function LandingTopNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cabinetHref, setCabinetHref] = useState<string | null>(null);

  useEffect(() => {
    function syncCabinetLink() {
      const { isLoggedIn, role } = readDemoSession();
      if (isLoggedIn && role) {
        setCabinetHref(cabinetPathForRole(role));
      } else {
        setCabinetHref(null);
      }
    }
    syncCabinetLink();
    window.addEventListener("storage", syncCabinetLink);
    window.addEventListener("expo365-auth-change", syncCabinetLink);
    return () => {
      window.removeEventListener("storage", syncCabinetLink);
      window.removeEventListener("expo365-auth-change", syncCabinetLink);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <SiteHeaderLogo href="/" variant="header" />

        <nav
          className="hidden flex-1 flex-wrap items-center justify-center gap-1 lg:flex lg:gap-0 xl:gap-1"
          aria-label="Основное меню"
        >
          {landingNavItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-expoBlue xl:px-3"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.id}
                href={item.href}
                className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-expoBlue xl:px-3"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 sm:flex sm:gap-3">
          {cabinetHref ? (
            <Link
              href={cabinetHref}
              className="inline-flex items-center gap-2 rounded-lg border border-expoBlue px-3 py-2 text-sm font-medium text-expoBlue transition hover:bg-slate-50 lg:px-4"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Личный кабинет
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-expoBlue px-3 py-2 text-sm font-medium text-expoBlue transition hover:bg-slate-50 lg:px-4"
            >
              <LogIn className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Войти
            </Link>
          )}
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-expoOrange px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 lg:px-4"
          >
            <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Регистрация
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          {cabinetHref ? (
            <Link
              href={cabinetHref}
              aria-label="Личный кабинет"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-expoBlue px-2 py-2 text-xs font-medium text-expoBlue transition hover:bg-slate-50 min-[400px]:px-2.5 min-[400px]:text-sm"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span>Кабинет</span>
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Войти"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-expoBlue px-2 py-2 text-xs font-medium text-expoBlue transition hover:bg-slate-50 min-[400px]:px-2.5 min-[400px]:text-sm"
            >
              <LogIn className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span>Войти</span>
            </Link>
          )}
          <Link
            href="/register"
            aria-label="Регистрация"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-expoOrange px-2 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 min-[400px]:px-2.5 min-[400px]:text-sm"
          >
            <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span>
              <span className="max-[359px]:hidden">Регистрация</span>
              <span className="hidden max-[359px]:inline">Рег.</span>
            </span>
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-expoBlue lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-landing-nav"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-landing-nav" className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Мобильное меню">
            {landingNavItems.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.id}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              )
            )}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {cabinetHref ? (
                <Link
                  href={cabinetHref}
                  className="rounded-lg border border-expoBlue py-2.5 text-center font-medium text-expoBlue"
                  onClick={() => setMenuOpen(false)}
                >
                  Личный кабинет
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg border border-expoBlue py-2.5 text-center font-medium text-expoBlue"
                  onClick={() => setMenuOpen(false)}
                >
                  Войти
                </Link>
              )}
              <Link
                href="/register"
                className="rounded-lg bg-expoOrange py-2.5 text-center font-semibold text-white"
                onClick={() => setMenuOpen(false)}
              >
                Регистрация
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
