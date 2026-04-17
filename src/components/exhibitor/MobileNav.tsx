"use client";

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

export function MobileNav({ relevantDemandsCount = 0 }: { relevantDemandsCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200/90 bg-white/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] backdrop-blur-md lg:hidden"
      aria-label="Мобильная навигация"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const showBadge = href === "/exhibitor/dashboard" && relevantDemandsCount > 0;
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
              active ? "text-expoOrange" : "text-slate-500"
            }`}
          >
            <span className="relative inline-flex">
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
              {showBadge ? (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-expoOrange px-0.5 text-[9px] font-bold text-white">
                  {relevantDemandsCount > 99 ? "99+" : relevantDemandsCount}
                </span>
              ) : null}
            </span>
            <span className="max-w-full truncate px-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
