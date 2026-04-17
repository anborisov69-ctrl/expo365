"use client";

import { productCategoryLabelRu } from "@/lib/product-category-labels";
import type { ProductCategory } from "@prisma/client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface RequestRow {
  id: string;
  title: string;
  category: ProductCategory;
  createdAt: string;
  status: string;
  responseCount: number;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU");
  } catch {
    return iso;
  }
}

function statusLabel(s: string): string {
  if (s === "active") return "active";
  if (s === "closed") return "closed";
  return "expired";
}

export function BuyerRequestsContent() {
  const [items, setItems] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/visitor/requests", { credentials: "include" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as { requests?: RequestRow[] };
      setItems(data.requests ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function closeRequest(id: string) {
    if (!window.confirm("Закрыть заявку?")) {
      return;
    }
    setClosing(id);
    try {
      const response = await fetch(`/api/visitor/requests/${id}/close`, {
        method: "PUT",
        credentials: "include"
      });
      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        window.alert(err.error ?? "Не удалось закрыть");
        return;
      }
      await load();
    } finally {
      setClosing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Мои заявки</h1>
        <Link
          href="/demand/create"
          className="inline-flex items-center justify-center rounded-2xl bg-[#F26522] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
        >
          Создать новую заявку
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-slate-400">Загрузка…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 py-12 text-center text-slate-500">
          Заявок пока нет
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Название</th>
                <th className="hidden px-4 py-3 sm:table-cell">Категория</th>
                <th className="hidden px-4 py-3 md:table-cell">Дата</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Отклики</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link href={`/visitor/requests/${row.id}`} className="hover:text-[#F26522]">
                      {row.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                    {productCategoryLabelRu[row.category]}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{statusLabel(row.status)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.responseCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/visitor/requests/${row.id}`}
                        className="text-[#F26522] hover:underline"
                      >
                        Открыть
                      </Link>
                      {row.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => closeRequest(row.id)}
                          disabled={closing === row.id}
                          className="text-xs text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline disabled:opacity-50"
                        >
                          {closing === row.id ? "…" : "Закрыть"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400 md:hidden">На узком экране часть колонок скрыта — поверните устройство.</p>
    </div>
  );
}
