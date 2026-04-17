"use client";

import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import { setExhibitorLoggedInFlag } from "@/lib/exhibitor-client-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginExhibitorPage() {
  const router = useRouter();

  function handleLogin() {
    setExhibitorLoggedInFlag(true);
    router.replace("/exhibitor/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex justify-center">
          <SiteHeaderLogo href="/" variant="auth" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-expoBlue">Вход для экспонента</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Демо: вход без пароля, только для макета.</p>
        <button
          type="button"
          onClick={handleLogin}
          className="mt-8 w-full rounded-xl bg-expoOrange py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-95"
        >
          Войти как экспонент
        </button>
        <Link
          href="/"
          className="mt-6 block text-center text-sm font-medium text-expoBlue underline-offset-4 hover:underline"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
