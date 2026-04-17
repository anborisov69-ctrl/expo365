"use client";

import { MobileNav } from "@/components/exhibitor/MobileNav";
import { Sidebar } from "@/components/exhibitor/Sidebar";

export function ExhibitorLayoutShell({
  children,
  relevantDemandsCount = 0
}: {
  children: React.ReactNode;
  relevantDemandsCount?: number;
}) {
  return (
    <div className="min-h-screen bg-exhibitorBg font-sans text-slate-900 antialiased">
      <Sidebar relevantDemandsCount={relevantDemandsCount} />
      <div className="lg:pl-60">
        <main className="min-h-screen pb-20 lg:pb-8">{children}</main>
      </div>
      <MobileNav relevantDemandsCount={relevantDemandsCount} />
    </div>
  );
}
