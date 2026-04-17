"use client";

import { PasswordField } from "@/components/auth/PasswordField";
import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import {
  type DemoRole,
  readDemoSession,
  saveDemoSessionAfterClearingServerCookie
} from "@/lib/demo-local-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<DemoRole>("VISITOR");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError("Укажите email.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Пароль не короче 4 символов.");
      return;
    }
    await saveDemoSessionAfterClearingServerCookie(role, emailTrim);
    const saved = readDemoSession();
    const effectiveRole = saved.role ?? saved.user?.role ?? role;
    router.push(
      effectiveRole === "EXHIBITOR" ? "/exhibitor/dashboard" : "/visitor/dashboard"
    );
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
        <div className="flex justify-center">
          <SiteHeaderLogo href="/" variant="auth" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-expoBlue">Регистрация</h1>
        <p className="mt-2 text-sm text-slate-500">
          Демо-режим: без базы данных, только{" "}
          <span className="font-mono text-xs">localStorage</span>.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-expoBlue/20 focus:border-expoBlue focus:ring-2"
            />
          </div>
          <PasswordField
            label="Пароль"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            minLength={4}
            required
            helperText="Не короче 4 символов (демо)"
          />
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Роль</legend>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="register-role"
                  checked={role === "VISITOR"}
                  onChange={() => setRole("VISITOR")}
                  className="text-expoOrange focus:ring-expoBlue"
                />
                <span className="text-sm text-slate-800">Посетитель</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="register-role"
                  checked={role === "EXHIBITOR"}
                  onChange={() => setRole("EXHIBITOR")}
                  className="text-expoOrange focus:ring-expoBlue"
                />
                <span className="text-sm text-slate-800">Экспонент</span>
              </label>
            </div>
          </fieldset>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-expoOrange py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Зарегистрироваться
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-expoBlue hover:underline">
            Войти
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
