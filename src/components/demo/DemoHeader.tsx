import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <SiteHeaderLogo href="/" variant="header" />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-expoBlue px-4 py-2 text-sm font-medium text-expoBlue transition hover:bg-slate-50"
          >
            <LogIn className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Войти
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-expoOrange px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}
