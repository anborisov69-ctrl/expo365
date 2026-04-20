"use client";

import { EditProfileForm } from "@/components/exhibitor/EditProfileForm";
import { companyApiToExhibitorProps, type CompanyPublicApi } from "@/lib/company-update-shared";
import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

export function AdminEditExhibitorProfileButton({
  companyId,
  label = "Редактировать профиль"
}: {
  companyId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<ExhibitorProfileCompanyProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const openModal = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companyId}`, { credentials: "include" });
      const data = (await res.json()) as { error?: string; company?: CompanyPublicApi };
      if (!res.ok) {
        setFetchError(data.error ?? "Не удалось загрузить компанию");
        return;
      }
      if (!data.company) {
        setFetchError("Пустой ответ");
        return;
      }
      setInitial(companyApiToExhibitorProps(data.company));
      setOpen(true);
    } catch {
      setFetchError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return (
    <>
      <button
        type="button"
        onClick={() => void openModal()}
        disabled={loading}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> : null}{" "}
        {label}
      </button>
      {fetchError ? <span className="ml-2 text-xs text-red-600">{fetchError}</span> : null}

      {open && initial ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            aria-label="Закрыть"
            onClick={() => {
              setOpen(false);
              setInitial(null);
            }}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Профиль экспонента</h2>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
                onClick={() => {
                  setOpen(false);
                  setInitial(null);
                }}
              >
                ✕
              </button>
            </div>
            <EditProfileForm
              companyId={companyId}
              initial={initial}
              variant="modal"
              isAdmin
              categoryMode="all"
              onSaved={() => {
                setOpen(false);
                setInitial(null);
              }}
              onCancel={() => {
                setOpen(false);
                setInitial(null);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
