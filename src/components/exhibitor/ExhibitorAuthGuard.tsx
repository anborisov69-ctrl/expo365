"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getIsExhibitorLoggedIn } from "@/lib/exhibitor-auth";

export function ExhibitorAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const ok = getIsExhibitorLoggedIn();
    if (!ok) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
    setReady(true);
  }, [router]);

  if (!ready || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-expoOrange border-t-transparent" />
          <p className="text-sm text-slate-500">Проверка доступа…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
