"use client";

import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import { productCategoryLabelRu } from "@/lib/product-category-labels";
import { ProductCategory } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const ACCENT = "#F26522";
const CATEGORIES = Object.values(ProductCategory);

interface DemandRow {
  id: string;
  title: string;
  description: string | null;
  category: ProductCategory;
  quantity: string | null;
  deadline: string | null;
  budget: string | null;
  createdAt: string;
  visitorName: string;
  responseCount: number;
  isMine: boolean;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

type Role = "VISITOR" | "EXHIBITOR";

export function DemandFeedContent({
  role,
  initialCategory
}: {
  role: Role;
  initialCategory: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [demands, setDemands] = useState<DemandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryFromUrl = searchParams.get("category");
  const activeCategory = useMemo(() => {
    const raw = categoryFromUrl ?? initialCategory;
    if (!raw) {
      return null;
    }
    const upper = raw.toUpperCase();
    return (CATEGORIES as string[]).includes(upper) ? (upper as ProductCategory) : null;
  }, [categoryFromUrl, initialCategory]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = activeCategory ? `?category=${activeCategory}` : "";
      const response = await fetch(`/api/demand-feed${qs}`, { credentials: "include" });
      const data = (await response.json()) as { demands?: DemandRow[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Ошибка загрузки");
        setDemands([]);
        return;
      }
      setDemands(data.demands ?? []);
    } catch {
      setError("Сеть недоступна");
      setDemands([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    void load();
  }, [load]);

  function setCategory(next: ProductCategory | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("category", next);
    } else {
      params.delete("category");
    }
    const q = params.toString();
    router.push(q ? `/demand-feed?${q}` : "/demand-feed");
  }

  const cabinetHref = role === "EXHIBITOR" ? "/exhibitor/dashboard" : "/visitor/dashboard";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <SiteHeaderLogo href="/" variant="compact" className="shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                Лента спроса
              </p>
              <h1 className="text-xl font-semibold text-slate-900">Активные заявки</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Главная
            </Link>
            <Link
              href={cabinetHref}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Кабинет
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === null
                ? "text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            style={activeCategory === null ? { backgroundColor: ACCENT } : undefined}
          >
            Все
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === cat
                  ? "text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              style={activeCategory === cat ? { backgroundColor: ACCENT } : undefined}
            >
              {productCategoryLabelRu[cat]}
            </button>
          ))}
        </div>

        {role === "VISITOR" ? (
          <p className="mt-4 text-sm text-slate-500">
            Нужна новая заявка?{" "}
            <Link
              href="/demand/create"
              className="font-medium underline decoration-[#F26522]/40"
              style={{ color: ACCENT }}
            >
              Создать заявку
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Отклик доступен, если категория заявки совпадает с экспертизой вашей компании (или экспертиза не
            задана).
          </p>
        )}

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="mt-10 text-center text-sm text-slate-400">Загрузка…</p>
        ) : demands.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">Нет активных заявок по выбранному фильтру.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {demands.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/demand-feed/${row.id}`}
                  className="block rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm transition hover:border-[#F26522]/30 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-slate-900">{row.title}</h2>
                    {row.isMine ? (
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Ваша заявка
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">{productCategoryLabelRu[row.category]}</p>
                  {row.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{row.description}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Посетитель: {row.visitorName}</span>
                    <span>Откликов: {row.responseCount}</span>
                    <span>{formatDate(row.createdAt)}</span>
                  </div>
                  {(row.quantity || row.deadline || row.budget) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      {row.quantity ? <span>Объём: {row.quantity}</span> : null}
                      {row.deadline ? <span>Срок: {row.deadline}</span> : null}
                      {row.budget ? <span>Бюджет: {row.budget}</span> : null}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
