"use client";

import { useState } from "react";

export function AdminImpersonateButton({
  userId,
  role,
  children
}: {
  userId: string;
  role: "EXHIBITOR" | "VISITOR";
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, role })
      });
      const data = (await res.json()) as { redirect?: string; error?: string };
      if (!res.ok) {
        alert(data.error ?? "Ошибка");
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void handleClick()}
      className="rounded-lg bg-[#F26522] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
    >
      {loading ? "…" : children}
    </button>
  );
}
