"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupportModeBanner({
  userName,
  userEmail
}: {
  userName: string;
  userEmail: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStop() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stop-impersonation", {
        method: "POST",
        credentials: "include"
      });
      const data = (await res.json()) as { ok?: boolean; redirect?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      if (data.redirect) {
        router.replace(data.redirect);
        router.refresh();
      }
    } catch {
      setError("Сеть недоступна");
    } finally {
      setLoading(false);
    }
  }

  const emailPart = userEmail ? ` (${userEmail})` : "";

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[100] border-b border-amber-700 bg-[#F26522] px-4 py-3 text-sm text-white shadow-md"
      role="region"
      aria-label="Режим поддержки"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="font-medium">
          Режим поддержки: вы вошли как {userName}
          {emailPart}
        </p>
        <div className="flex items-center gap-2">
          {error ? <span className="text-xs text-amber-100">{error}</span> : null}
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleStop()}
            className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-[#F26522] shadow-sm transition hover:bg-amber-50 disabled:opacity-60"
          >
            {loading ? "…" : "Завершить"}
          </button>
        </div>
      </div>
    </div>
  );
}
