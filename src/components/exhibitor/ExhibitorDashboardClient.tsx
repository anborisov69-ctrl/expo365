"use client";

import { ExhibitorProfileDashboard } from "@/components/exhibitor/ExhibitorProfileDashboard";
import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import { useCallback, useEffect, useState } from "react";

/**
 * Дашборд экспонента: шапка профиля, вкладки «Новинки» / «Запросы» / «Аналитика», сетка новинок.
 * Светлый блок внутри `ExhibitorInstagramShell` (тёмная шапка кабинета).
 */
export function ExhibitorDashboardClient() {
  const [company, setCompany] = useState<ExhibitorProfileCompanyProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exhibitor/company", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        company?: ExhibitorProfileCompanyProps;
      };
      if (!res.ok) {
        const hint =
          data.error === "Доступ запрещён"
            ? " Войдите через страницу «Вход» с email и паролем из базы (после сида), а не только демо-кнопку в браузере."
            : "";
        setError(
          (data.error ?? `Код ${res.status}`) +
            hint +
            " Если только что меняли данные — выполните: npx prisma db seed"
        );
        setCompany(null);
        return;
      }
      if (!data.company) {
        setError("Профиль компании не найден. Выполните сид базы или зарегистрируйтесь заново.");
        setCompany(null);
        return;
      }
      setCompany(data.company);
    } catch {
      setError("Ошибка сети при загрузке профиля компании.");
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-slate-50 text-sm text-slate-600">
        Загрузка кабинета…
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error ?? "Компания не найдена."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-neutral-900 antialiased">
      <ExhibitorProfileDashboard company={company} />
    </div>
  );
}
