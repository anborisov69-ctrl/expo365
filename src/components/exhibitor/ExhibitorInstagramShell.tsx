"use client";

import { ExhibitorLogoutButton } from "@/components/exhibitor/ExhibitorLogoutButton";
import Link from "next/link";
import { Bell } from "lucide-react";

export function ExhibitorInstagramShell({
  children,
  relevantDemandsCount = 0,
  supportBannerActive = false
}: {
  children: React.ReactNode;
  relevantDemandsCount?: number;
  supportBannerActive?: boolean;
}) {
  return (
    <div className="min-h-screen bg-black font-sans text-neutral-100 antialiased">
      <header
        className={`sticky z-50 border-b border-neutral-800 bg-black/95 backdrop-blur-md ${
          supportBannerActive ? "top-14" : "top-0"
        }`}
      >
        <div className="mx-auto flex max-w-[935px] items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <Link
            href="/exhibitor/dashboard"
            className="text-sm font-semibold tracking-tight text-white hover:text-neutral-300"
          >
            ЭКСПО <span className="font-normal text-neutral-500">365</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              className="hidden rounded-full p-2 text-neutral-100 hover:bg-neutral-900 sm:inline-flex"
              aria-label="Уведомления"
            >
              <Bell className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <Link
              href="/demand-feed"
              className="relative inline-flex items-center gap-1 rounded-lg bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-neutral-100 transition hover:bg-[#363636] sm:px-3 sm:text-sm"
            >
              Лента спроса
              {relevantDemandsCount > 0 ? (
                <span className="min-w-[1.25rem] rounded-full bg-[#0095F6] px-1.5 py-0.5 text-center text-[10px] font-bold text-white sm:text-xs">
                  {relevantDemandsCount > 99 ? "99+" : relevantDemandsCount}
                </span>
              ) : null}
            </Link>
            <ExhibitorLogoutButton />
          </nav>
        </div>
      </header>
      <main className="min-h-[calc(100vh-52px)]">{children}</main>
    </div>
  );
}
