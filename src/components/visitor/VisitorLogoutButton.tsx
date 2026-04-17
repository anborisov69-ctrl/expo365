"use client";

import { clearDemoSession } from "@/lib/demo-local-auth";
import { useRouter } from "next/navigation";

export function VisitorLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    clearDemoSession();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
    >
      Выйти
    </button>
  );
}
