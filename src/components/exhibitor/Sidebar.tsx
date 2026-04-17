"use client";

import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  Store
} from "lucide-react";

const items = [
  { href: "/exhibitor/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/exhibitor/stand", label: "Стенд", icon: Store },
  { href: "/exhibitor/products", label: "Новинки", icon: Sparkles },
  { href: "/exhibitor/inquiries", label: "Запросы", icon: Inbox },
  { href: "/exhibitor/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/exhibitor/settings", label: "Настройки", icon: Settings }
] as const;

export function Sidebar({ relevantDemandsCount = 0 }: { relevantDemandsCount?: number }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200/90 bg-white shadow-sm lg:flex">
      <div className="flex h-16 items-center border-b border-slate-100 px-4">
        <SiteHeaderLogo href="/exhibitor/dashboard" variant="sidebar" />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Кабинет экспонента">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const showBadge = href === "/exhibitor/dashboard" && relevantDemandsCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-expoBlue/10 font-semibold text-expoBlue"
                  : "text-slate-600 hover:bg-slate-50 hover:text-expoBlue"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
              <span className="flex-1">{label}</span>
              {showBadge ? (
                <span
                  className="min-w-[1.25rem] shrink-0 rounded-full bg-expoOrange px-1.5 py-0.5 text-center text-xs font-bold text-white"
                  title="Новые релевантные заявки"
                >
                  {relevantDemandsCount > 99 ? "99+" : relevantDemandsCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <Link href="/" className="text-xs font-medium text-slate-500 transition hover:text-expoBlue">
          ← На сайт
        </Link>
      </div>
    </aside>
  );
}
