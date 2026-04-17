"use client";

import { clearDemoSession } from "@/lib/demo-local-auth";
import { useRouter } from "next/navigation";

export function ExhibitorLogoutButton() {
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
      className="rounded-lg border border-neutral-700 bg-[#262626] px-3 py-1.5 text-xs font-semibold text-neutral-100 transition hover:bg-[#363636] sm:px-4 sm:py-2 sm:text-sm"
    >
      Выйти
    </button>
  );
}
