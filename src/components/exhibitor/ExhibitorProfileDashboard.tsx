"use client";

import { AddProductModal } from "@/components/exhibitor/AddProductModal";
import { ExhibitorAnalyticsTab } from "@/components/exhibitor/ExhibitorAnalyticsTab";
import { InquiryItem } from "@/components/exhibitor/InquiryItem";
import { ProductDetailModal } from "@/components/exhibitor/ProductDetailModal";
import { ProductCoverThumb } from "@/components/product/ProductCoverThumb";
import { DEFAULT_COMPANY_AVATAR_URL } from "@/lib/exhibitor-default-images";
import { formatProductPriceDisplay } from "@/lib/product-price-display";
import { PRODUCT_CATEGORY_HASHTAG_RU } from "@/lib/product-category-labels";
import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import type { ExhibitorInquiryApiRow } from "@/types/exhibitor-inquiry";
import type { ProductApiRow, ProductApiRowWithStats, ProductFormPayload } from "@/types/product-api";
import { BidStatus, InquiryType } from "@prisma/client";
import { BarChart3, ClipboardList, Grid3x3, MessageCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const FOLLOWERS_PLACEHOLDER = 123;
const FOLLOWING_PLACEHOLDER = 45;

type TabKey = "posts" | "requests" | "analytics";

interface ExhibitorDemandBidRow {
  id: string;
  demandId: string;
  demandTitle: string;
  demandStatus: string;
  proposal: string;
  price: string;
  contactEmail: string;
  contactPhone: string;
  bidStatus: BidStatus;
  createdAt: string;
}

function bidStatusLabel(status: BidStatus): string {
  if (status === BidStatus.PENDING) return "На рассмотрении";
  if (status === BidStatus.ACCEPTED) return "Принят";
  return "Отклонён";
}

function parseTab(value: string | null): TabKey {
  if (value === "requests" || value === "analytics") {
    return value;
  }
  return "posts";
}

function toProductApiRow(product: ProductApiRowWithStats): ProductApiRow {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    mediaType: product.mediaType,
    mediaUrl: product.mediaUrl,
    isSampleAvailable: product.isSampleAvailable,
    isPublished: product.isPublished,
    companyId: product.companyId,
    company: product.company
  };
}

export function ExhibitorProfileDashboard({ company }: { company: ExhibitorProfileCompanyProps }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const [products, setProducts] = useState<ProductApiRowWithStats[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [inquiries, setInquiries] = useState<ExhibitorInquiryApiRow[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesError, setInquiriesError] = useState<string | null>(null);
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<"all" | InquiryType>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [demandBids, setDemandBids] = useState<ExhibitorDemandBidRow[]>([]);
  const [demandBidsLoading, setDemandBidsLoading] = useState(false);
  const [demandBidsError, setDemandBidsError] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductApiRow | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductApiRowWithStats | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const setTab = useCallback(
    (next: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "posts") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const query = params.toString();
      router.replace(query ? `/exhibitor/dashboard?${query}` : "/exhibitor/dashboard", {
        scroll: false
      });
    },
    [router, searchParams]
  );

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const response = await fetch("/api/exhibitor/products", { credentials: "include" });
      if (!response.ok) {
        throw new Error("load");
      }
      const data = (await response.json()) as { products?: ProductApiRowWithStats[] };
      setProducts(data.products ?? []);
    } catch {
      setProductsError("Не удалось загрузить новинки.");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    setInquiriesError(null);
    try {
      const params = new URLSearchParams();
      params.set("companyId", company.id);
      if (inquiryTypeFilter !== "all") {
        params.set("type", inquiryTypeFilter);
      }
      if (dateFrom) {
        params.set("from", dateFrom);
      }
      if (dateTo) {
        params.set("to", dateTo);
      }
      const response = await fetch(`/api/inquiries?${params.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("load");
      }
      const data = (await response.json()) as { inquiries?: ExhibitorInquiryApiRow[] };
      setInquiries(data.inquiries ?? []);
    } catch {
      setInquiriesError("Не удалось загрузить запросы.");
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  }, [company.id, inquiryTypeFilter, dateFrom, dateTo]);

  const loadDemandBids = useCallback(async () => {
    setDemandBidsLoading(true);
    setDemandBidsError(null);
    try {
      const response = await fetch("/api/exhibitor/bids", { credentials: "include" });
      if (!response.ok) {
        throw new Error("load");
      }
      const data = (await response.json()) as { bids?: ExhibitorDemandBidRow[] };
      setDemandBids(data.bids ?? []);
    } catch {
      setDemandBidsError("Не удалось загрузить отклики на заявки спроса.");
      setDemandBids([]);
    } finally {
      setDemandBidsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (activeTab === "requests") {
      void loadInquiries();
      void loadDemandBids();
    }
  }, [activeTab, loadInquiries, loadDemandBids]);

  const publicationCount = useMemo(
    () => products.filter((p) => p.isPublished).length,
    [products]
  );

  const hashtags = useMemo(() => {
    return company.expertiseCategories.map((c) => `#${PRODUCT_CATEGORY_HASHTAG_RU[c]}`);
  }, [company.expertiseCategories]);

  function openCreateProduct() {
    setEditingProduct(null);
    setAddModalOpen(true);
  }

  function openEditFromDetail(product: ProductApiRowWithStats) {
    setDetailOpen(false);
    setDetailProduct(null);
    setEditingProduct(toProductApiRow(product));
    setAddModalOpen(true);
  }

  function closeAddModal() {
    setAddModalOpen(false);
    setEditingProduct(null);
  }

  async function handleSubmitProduct(payload: ProductFormPayload) {
    if (editingProduct) {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Не удалось сохранить");
        return;
      }
    } else {
      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Не удалось добавить");
        return;
      }
    }
    await loadProducts();
  }

  async function handleDeleteProduct(id: string) {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error ?? "Не удалось удалить");
      return;
    }
    setDetailOpen(false);
    setDetailProduct(null);
    await loadProducts();
  }

  async function handlePublishedChange(product: ProductApiRowWithStats, next: boolean) {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: next })
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Не удалось обновить статус публикации");
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isPublished: next } : p))
      );
      setDetailProduct((cur) =>
        cur && cur.id === product.id ? { ...cur, isPublished: next } : cur
      );
    } catch {
      window.alert("Ошибка сети");
    }
  }

  async function handleDeleteProductFromGrid(id: string) {
    if (!window.confirm("Удалить эту новинку? Действие необратимо.")) {
      return;
    }
    await handleDeleteProduct(id);
  }

  const tabs: { id: TabKey; label: string; icon: typeof Grid3x3 }[] = [
    { id: "posts", label: "Новинки", icon: Grid3x3 },
    { id: "requests", label: "Запросы", icon: MessageCircle },
    { id: "analytics", label: "Аналитика", icon: BarChart3 }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <section className="flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-start sm:gap-10">
        <div className="flex shrink-0 justify-center sm:justify-start">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.logoUrl ?? DEFAULT_COMPANY_AVATAR_URL}
              alt=""
              className="h-full w-full object-contain bg-white"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <h1 className="text-center text-xl font-bold text-neutral-900 sm:text-left">{company.name}</h1>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link
                href="/exhibitor/settings"
                className="rounded-lg border border-neutral-300 bg-white px-4 py-1.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Редактировать профиль
              </Link>
              <button
                type="button"
                onClick={openCreateProduct}
                className="rounded-lg bg-expoBlue px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-expoBlue/90"
              >
                Добавить новинку
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-8 sm:justify-start sm:gap-10">
            <div className="text-center">
              <p className="text-base font-bold text-neutral-900">{publicationCount}</p>
              <p className="text-xs text-neutral-600 sm:text-sm">новинок в ленте</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-neutral-900">{FOLLOWERS_PLACEHOLDER}</p>
              <p className="text-xs text-neutral-600 sm:text-sm">подписчиков</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-neutral-900">{FOLLOWING_PLACEHOLDER}</p>
              <p className="text-xs text-neutral-600 sm:text-sm">подписок</p>
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            {company.description ? (
              <p className="text-sm font-normal leading-relaxed text-neutral-900">{company.description}</p>
            ) : (
              <p className="text-sm text-neutral-500">Добавьте описание компании в настройках профиля.</p>
            )}
            {company.website ? (
              <p>
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-expoBlue underline-offset-2 hover:underline"
                >
                  {company.website}
                </a>
              </p>
            ) : null}
            {hashtags.length > 0 ? (
              <p className="text-sm text-expoOrange">
                {hashtags.map((tag) => (
                  <span key={tag} className="mr-2 inline-block">
                    {tag}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <nav
        className="sticky top-0 z-30 -mx-4 flex justify-center gap-0 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6"
        aria-label="Разделы кабинета"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 border-t-[3px] py-3 text-xs font-semibold uppercase tracking-wide transition sm:flex-none sm:min-w-[120px] sm:text-sm ${
                active
                  ? "border-expoBlue text-expoBlue"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        {activeTab === "posts" ? (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={openCreateProduct}
                className="inline-flex items-center gap-2 rounded-lg bg-expoBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-expoBlue/90"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Добавить новинку
              </button>
            </div>

            {productsError ? (
              <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{productsError}</p>
            ) : null}

            {productsLoading ? (
              <p className="py-12 text-center text-sm text-neutral-500">Загрузка…</p>
            ) : products.length === 0 && !productsError ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center">
                <p className="text-neutral-600">Пока нет новинок</p>
                <button
                  type="button"
                  onClick={openCreateProduct}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-expoBlue px-4 py-2 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Добавить
                </button>
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`group relative rounded-lg shadow-md transition-all duration-200 hover:shadow-xl ${
                      product.isPublished ? "" : "opacity-[0.72] ring-1 ring-amber-200/90"
                    }`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className="block w-full cursor-pointer rounded-lg border-0 bg-transparent p-0 text-left focus:outline-none focus:ring-2 focus:ring-expoBlue focus:ring-offset-2"
                      onClick={() => {
                        setDetailProduct(product);
                        setDetailOpen(true);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setDetailProduct(product);
                          setDetailOpen(true);
                        }
                      }}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                        {!product.isPublished ? (
                          <span className="absolute left-2 top-2 z-20 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Скрыто
                          </span>
                        ) : null}
                        <div className="absolute inset-0">
                          <ProductCoverThumb
                            product={product}
                            className="h-full w-full"
                            imgClassName="h-full w-full object-contain bg-slate-50"
                          />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-3 pt-12">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                            {formatProductPriceDisplay(product.price)}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                            {product.company.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 z-30 flex flex-col items-end gap-2">
                      <label
                        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-neutral-800 shadow-sm ring-1 ring-neutral-200/90"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <span className="max-w-[4.5rem] leading-tight sm:max-w-none">В ленте</span>
                        <input
                          type="checkbox"
                          checked={product.isPublished}
                          onChange={(event) => {
                            event.stopPropagation();
                            void handlePublishedChange(product, event.target.checked);
                          }}
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4 shrink-0 rounded border-neutral-300 text-expoBlue focus:ring-expoBlue"
                          aria-label="Опубликовано в общей ленте"
                        />
                      </label>
                      <button
                        type="button"
                        className="rounded-full bg-white/95 p-2 text-red-600 shadow-sm ring-1 ring-neutral-200/90 transition hover:bg-red-50"
                        aria-label="Удалить новинку"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteProductFromGrid(product.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "requests" ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
              <div>
                <label htmlFor="inq-type" className="block text-xs font-medium text-neutral-600">
                  Тип запроса
                </label>
                <select
                  id="inq-type"
                  value={inquiryTypeFilter}
                  onChange={(event) =>
                    setInquiryTypeFilter(event.target.value as "all" | InquiryType)
                  }
                  className="mt-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
                >
                  <option value="all">Все</option>
                  <option value="CP">КП</option>
                  <option value="SAMPLE">Образец</option>
                  <option value="SERVICE">Услуга</option>
                </select>
              </div>
              <div>
                <label htmlFor="inq-from" className="block text-xs font-medium text-neutral-600">
                  С даты
                </label>
                <input
                  id="inq-from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="mt-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
                />
              </div>
              <div>
                <label htmlFor="inq-to" className="block text-xs font-medium text-neutral-600">
                  По дату
                </label>
                <input
                  id="inq-to"
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="mt-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
                />
              </div>
              <button
                type="button"
                onClick={() => void loadInquiries()}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 sm:mb-0.5"
              >
                Применить
              </button>
            </div>

            {inquiriesError ? (
              <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{inquiriesError}</p>
            ) : null}

            {inquiriesLoading ? (
              <p className="py-12 text-center text-sm text-neutral-500">Загрузка…</p>
            ) : inquiries.length === 0 && !inquiriesError ? (
              <p className="rounded-xl border border-neutral-200 bg-neutral-50 py-12 text-center text-sm text-neutral-600">
                Нет заявок
              </p>
            ) : (
              <ul className="space-y-3">
                {inquiries.map((row) => (
                  <InquiryItem key={row.id} row={row} onListRefresh={loadInquiries} />
                ))}
              </ul>
            )}

            <div className="border-t border-neutral-200 pt-8">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-expoBlue" strokeWidth={2} />
                <h3 className="text-base font-semibold text-neutral-900">Отклики на заявки спроса</h3>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Ваши предложения по заявкам из ленты спроса (модель{" "}
                <span className="font-mono text-xs">Bid</span> →{" "}
                <span className="font-mono text-xs">DemandRequest</span>).
              </p>

              {demandBidsError ? (
                <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  {demandBidsError}
                </p>
              ) : null}

              {demandBidsLoading ? (
                <p className="py-8 text-center text-sm text-neutral-500">Загрузка откликов…</p>
              ) : demandBids.length === 0 && !demandBidsError ? (
                <p className="rounded-xl border border-neutral-200 bg-neutral-50 py-10 text-center text-sm text-neutral-600">
                  Откликов на заявки спроса пока нет. Откройте{" "}
                  <Link href="/demand-feed" className="font-medium text-expoBlue underline-offset-2 hover:underline">
                    ленту спроса
                  </Link>
                  , чтобы откликнуться на заявку покупателя.
                </p>
              ) : (
                <ul className="space-y-3">
                  {demandBids.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/demand-feed/${row.demandId}`}
                            className="font-medium text-expoBlue underline-offset-2 hover:underline"
                          >
                            {row.demandTitle}
                          </Link>
                          <p className="mt-1 text-xs text-neutral-500">
                            Заявка:{" "}
                            {row.demandStatus === "active"
                              ? "активна"
                              : row.demandStatus === "closed"
                                ? "закрыта"
                                : "истекла"}{" "}
                            · {new Date(row.createdAt).toLocaleString("ru-RU")}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.bidStatus === BidStatus.ACCEPTED
                              ? "bg-emerald-100 text-emerald-800"
                              : row.bidStatus === BidStatus.DECLINED
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {bidStatusLabel(row.bidStatus)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-neutral-800">{row.proposal}</p>
                      <p className="mt-2 text-sm font-semibold text-expoOrange">{row.price}</p>
                      <p className="mt-2 text-xs text-neutral-500">
                        {row.contactEmail} · {row.contactPhone}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "analytics" ? <ExhibitorAnalyticsTab /> : null}
      </div>

      <AddProductModal
        open={addModalOpen}
        onClose={closeAddModal}
        initialProduct={editingProduct}
        onSubmit={handleSubmitProduct}
      />

      <ProductDetailModal
        open={detailOpen}
        product={detailProduct}
        onClose={() => {
          setDetailOpen(false);
          setDetailProduct(null);
        }}
        onEdit={openEditFromDetail}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}
