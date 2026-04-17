"use client";

import { ProductCoverThumb } from "@/components/product/ProductCoverThumb";
import { readDemoSession } from "@/lib/demo-local-auth";
import { formatProductPriceDisplay } from "@/lib/product-price-display";
import { productCategoryLabelRu } from "@/lib/product-category-labels";
import type { ProductApiRow } from "@/types/product-api";
import type { ProductCategory } from "@prisma/client";
import { BarChart3, FileText, LayoutGrid, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TabKey = "overview" | "demands" | "bids" | "novelties";

function parseTab(value: string | null): TabKey {
  if (value === "demands" || value === "bids" || value === "novelties") {
    return value;
  }
  return "overview";
}

interface BuyerStats {
  demandsTotal: number;
  demandsActive: number;
  demandsClosed: number;
  bidsOnMyDemands: number;
}

interface RequestRow {
  id: string;
  title: string;
  category: ProductCategory;
  createdAt: string;
  status: string;
  responseCount: number;
}

interface BidRow {
  id: string;
  demandTitle: string;
  companyName: string;
  proposal: string;
  price: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU");
  } catch {
    return iso;
  }
}

function demandStatusRu(status: string): string {
  if (status === "active") return "Активна";
  if (status === "closed") return "Закрыта";
  return "Истекла";
}

export function BuyerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const [name, setName] = useState("");
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [bids, setBids] = useState<BidRow[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);

  const [products, setProducts] = useState<ProductApiRow[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [closing, setClosing] = useState<string | null>(null);

  const setTab = useCallback(
    (next: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const query = params.toString();
      router.replace(query ? `/visitor/dashboard?${query}` : "/visitor/dashboard", { scroll: false });
    },
    [router, searchParams]
  );

  const loadOverview = useCallback(async () => {
    const applyVisitorDemoFallback = () => {
      const demo = readDemoSession();
      if (demo.isLoggedIn && demo.role === "VISITOR" && demo.user) {
        setName(demo.user.name);
        setStats({
          demandsTotal: 0,
          demandsActive: 0,
          demandsClosed: 0,
          bidsOnMyDemands: 0
        });
      } else {
        setStats(null);
      }
    };

    setStatsLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/visitor/profile", { credentials: "include" }),
        fetch("/api/visitor/stats", { credentials: "include" })
      ]);
      if (pRes.ok && sRes.ok) {
        const pJson = (await pRes.json()) as { profile?: { name?: string } };
        setName(pJson.profile?.name ?? "");
        const sJson = (await sRes.json()) as BuyerStats;
        setStats(sJson);
        return;
      }
      applyVisitorDemoFallback();
    } catch {
      applyVisitorDemoFallback();
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const response = await fetch("/api/visitor/requests?limit=50", { credentials: "include" });
      if (response.ok) {
        const data = (await response.json()) as { requests?: RequestRow[] };
        setRequests(data.requests ?? []);
      }
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const loadBids = useCallback(async () => {
    setBidsLoading(true);
    try {
      const response = await fetch("/api/visitor/bids?limit=50", { credentials: "include" });
      if (response.ok) {
        const data = (await response.json()) as { bids?: BidRow[] };
        setBids(data.bids ?? []);
      }
    } finally {
      setBidsLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/products", { credentials: "include" });
      if (response.ok) {
        const data = (await response.json()) as { products?: ProductApiRow[] };
        setProducts((data.products ?? []).slice(0, 24));
      }
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (activeTab === "demands") {
      void loadRequests();
    }
    if (activeTab === "bids") {
      void loadBids();
    }
    if (activeTab === "novelties") {
      void loadProducts();
    }
  }, [activeTab, loadRequests, loadBids, loadProducts]);

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
      await loadRequests();
      void loadOverview();
    } finally {
      setClosing(null);
    }
  }

  const tabs: { id: TabKey; label: string; icon: typeof LayoutGrid }[] = [
    { id: "overview", label: "Обзор", icon: BarChart3 },
    { id: "demands", label: "Мои заявки", icon: FileText },
    { id: "bids", label: "Отклики", icon: Sparkles },
    { id: "novelties", label: "Новинки", icon: LayoutGrid }
  ];

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Добро пожаловать{name ? `, ${name}` : ""}
        </h2>
        <p className="text-sm text-slate-600">
          Заявки спроса (<span className="font-mono text-xs">DemandRequest</span>), отклики экспонентов (
          <span className="font-mono text-xs">Bid</span>) и лента новинок.
        </p>
        <Link
          href="/demand/create"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#F26522] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:brightness-95 md:w-auto"
        >
          Создать новую заявку
        </Link>
      </header>

      <nav
        className="sticky top-[57px] z-30 -mx-4 flex gap-0 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm md:static md:mx-0 md:overflow-visible md:px-0"
        aria-label="Разделы кабинета"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex min-w-[7rem] flex-1 items-center justify-center gap-2 border-b-[3px] py-3 text-xs font-semibold uppercase tracking-wide transition sm:min-w-[9rem] sm:text-sm ${
                active
                  ? "border-[#F26522] text-[#F26522]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === "overview" ? (
        <div className="space-y-8">
          {statsLoading ? (
            <p className="text-center text-sm text-slate-400">Загрузка…</p>
          ) : stats ? (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Статистика
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{stats.demandsActive}</p>
                  <p className="text-xs text-slate-600">Активных заявок</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{stats.demandsTotal}</p>
                  <p className="text-xs text-slate-600">Всего заявок</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{stats.bidsOnMyDemands}</p>
                  <p className="text-xs text-slate-600">Откликов экспонентов</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{stats.demandsClosed}</p>
                  <p className="text-xs text-slate-600">Закрытых заявок</p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="flex flex-wrap gap-3">
            <Link
              href="/demand-feed"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-[#F26522]/40 hover:bg-white"
            >
              Лента спроса
            </Link>
            <Link
              href="/feed"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-[#F26522]/40 hover:bg-white"
            >
              Лента новинок
            </Link>
            <Link
              href="/visitor/requests"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-[#F26522]/40 hover:bg-white"
            >
              Все заявки (полный экран)
            </Link>
          </section>
        </div>
      ) : null}

      {activeTab === "demands" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Мои заявки</h2>
            <Link
              href="/demand/create"
              className="inline-flex items-center justify-center rounded-2xl bg-[#F26522] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              Новая заявка
            </Link>
          </div>
          {requestsLoading ? (
            <p className="text-center text-slate-400">Загрузка…</p>
          ) : requests.length === 0 ? (
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
                  {requests.map((row) => (
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
                      <td className="px-4 py-3 text-slate-700">{demandStatusRu(row.status)}</td>
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
          <p className="text-xs text-slate-400 md:hidden">На узком экране часть колонок скрыта.</p>
        </div>
      ) : null}

      {activeTab === "bids" ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Отклики экспонентов на ваши заявки</h2>
          {bidsLoading ? (
            <p className="text-center text-slate-400">Загрузка…</p>
          ) : bids.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 py-12 text-center text-slate-500">
              Откликов пока нет
            </div>
          ) : (
            <ul className="space-y-3">
              {bids.map((row) => (
                <li
                  key={row.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs text-slate-400">{row.demandTitle}</p>
                  <p className="mt-1 font-medium text-slate-900">{row.companyName}</p>
                  <p className="mt-2 text-sm text-slate-700">{row.proposal}</p>
                  <p className="mt-2 text-sm font-semibold text-[#F26522]">{row.price}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(row.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {activeTab === "novelties" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Новинки рынка</h2>
            <Link href="/feed" className="text-sm font-medium text-[#F26522] hover:underline">
              Вся лента →
            </Link>
          </div>
          {productsLoading ? (
            <p className="text-center text-slate-400">Загрузка…</p>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 py-12 text-center text-slate-500">
              Новинок пока нет
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href="/feed"
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-[#F26522]/30"
                >
                  <div className="relative aspect-square bg-slate-100">
                    <ProductCoverThumb
                      product={product}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{product.company.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[#F26522]">
                      {formatProductPriceDisplay(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
