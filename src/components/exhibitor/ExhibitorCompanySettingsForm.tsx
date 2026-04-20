"use client";

import { EditProfileForm } from "@/components/exhibitor/EditProfileForm";
import { companyApiToExhibitorProps, type CompanyPublicApi } from "@/lib/company-update-shared";
import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function ExhibitorCompanySettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initial, setInitial] = useState<ExhibitorProfileCompanyProps | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/exhibitor/company", { credentials: "include" });
      const data = (await response.json()) as {
        error?: string;
        company?: CompanyPublicApi;
      };
      if (!response.ok) {
        setLoadError(data.error ?? "Не удалось загрузить профиль");
        setInitial(null);
        return;
      }
      if (!data.company) {
        setLoadError("Пустой ответ сервера");
        setInitial(null);
        return;
      }
      setInitial(companyApiToExhibitorProps(data.company));
    } catch {
      setLoadError("Ошибка сети");
      setInitial(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-slate-100/80 pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Настройки профиля</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Данные отображаются в шапке кабинета и на публичной витрине компании.
            </p>
          </div>
          <Link
            href="/exhibitor/dashboard"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
          >
            ← К дашборду
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xl shadow-neutral-900/5 sm:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-neutral-500">
              <Loader2 className="h-8 w-8 animate-spin text-expoBlue" strokeWidth={2} />
              <p className="text-sm">Загрузка данных…</p>
            </div>
          ) : loadError ? (
            <div className="space-y-4 py-8 text-center">
              <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-xl bg-expoBlue px-4 py-2 text-sm font-semibold text-white hover:bg-expoBlue/90"
              >
                Повторить
              </button>
            </div>
          ) : initial ? (
            <EditProfileForm
              companyId={initial.id}
              initial={initial}
              variant="page"
              categoryMode="exhibitor"
              onSaved={() => {
                router.refresh();
                router.push("/exhibitor/dashboard");
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
