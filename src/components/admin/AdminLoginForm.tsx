"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = (await res.json()) as { ok?: boolean; redirect?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Ошибка входа");
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

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Вход администратора</h1>
      <p className="mt-2 text-sm text-slate-500">Техподдержка EXPO 365</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-expoBlue focus:ring-2 focus:ring-expoBlue/20"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700">
            Пароль
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-expoBlue focus:ring-2 focus:ring-expoBlue/20"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-expoOrange py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/" className="text-expoBlue hover:underline">
          На главную
        </Link>
      </p>
    </div>
  );
}
