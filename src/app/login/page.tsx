"use client";

import { PasswordField } from "@/components/auth/PasswordField";
import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import { clearDemoSession } from "@/lib/demo-local-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError("Введите email или телефон");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: emailTrim, password })
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        redirect?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Не удалось войти");
        return;
      }
      clearDemoSession();
      router.push(data.redirect ?? "/");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
        <div className="flex justify-center">
          <SiteHeaderLogo href="/" variant="auth" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-expoBlue">Вход</h1>
        <p className="mt-2 text-sm text-slate-500">
          Вход по учётной записи в базе. Демо после сида:{" "}
          <span className="font-mono text-xs">stand@expo365.ru</span> /{" "}
          <span className="font-mono text-xs">demo123</span> (экспонент), посетитель — см. вывод{" "}
          <span className="font-mono text-[11px]">npx prisma db seed</span>.
        </p>
        <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
              Email или телефон
            </label>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-expoBlue/20 focus:border-expoBlue focus:ring-2"
            />
          </div>
          <PasswordField
            label="Пароль"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-expoOrange py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
          >
            {pending ? "Вход…" : "Войти"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-expoBlue hover:underline">
            Регистрация
          </Link>
        </p>
        <Link
          href="/"
          className="mt-4 block text-center text-sm font-medium text-slate-500 hover:text-expoBlue"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
