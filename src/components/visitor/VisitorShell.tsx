"use client";

import { SupportModeBanner } from "@/components/admin/SupportModeBanner";
import { VisitorLogoutButton } from "@/components/visitor/VisitorLogoutButton";
import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FileText, Heart, Home, Settings } from "lucide-react";

const navItems = [
  { href: "/visitor/dashboard", label: "Главная", icon: Home },
  { href: "/visitor/requests", label: "Заявки", icon: FileText },
  { href: "/visitor/favorites", label: "Избранное", icon: Heart },
  { href: "/visitor/settings", label: "Профиль", icon: Settings }
] as const;

export function VisitorShell({
  children,
  supportMode
}: {
  children: ReactNode;
  supportMode?: { userName: string; userEmail: string | null } | null;
}) {
  const pathname = usePathname();
  const active = Boolean(supportMode);

  return (
    <div className={active ? "pt-14" : ""}>
      {supportMode ? (
        <SupportModeBanner userName={supportMode.userName} userEmail={supportMode.userEmail} />
      ) : null}
      <div className="min-h-screen bg-white pb-24 text-slate-900 md:pb-8">
        <header
          className={`sticky z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm ${
            active ? "top-14" : "top-0"
          }`}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 md:max-w-5xl md:px-6">
            <SiteHeaderLogo href="/" variant="compact" />
            <VisitorLogoutButton />
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 pt-4 md:max-w-5xl md:px-6 md:pt-6">{children}</div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur-md md:relative md:bottom-auto md:border-t-0 md:bg-transparent md:backdrop-blur-none"
          aria-label="Разделы кабинета"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2 md:mx-0 md:mb-6 md:max-w-none md:justify-start md:gap-2 md:px-6 lg:px-8">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/visitor/dashboard"
                  ? pathname === "/visitor/dashboard"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition md:flex-row md:gap-2 md:px-4 md:py-2.5 md:text-sm ${
                    isActive
                      ? "text-[#F26522]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-6 w-6 md:h-5 md:w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
