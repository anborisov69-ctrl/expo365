"use client";

import { AddProductModal } from "@/components/exhibitor/AddProductModal";
import { EditProfileForm } from "@/components/exhibitor/EditProfileForm";
import { ProductDetailModal } from "@/components/exhibitor/ProductDetailModal";
import { AnalyticsViewsBars } from "@/components/exhibitor/AnalyticsCharts";
import { ProductCoverThumb } from "@/components/product/ProductCoverThumb";
import { emptyContacts } from "@/lib/company-contacts";
import { readDemoSession } from "@/lib/demo-local-auth";
import { PRODUCT_CATEGORY_HASHTAG_RU } from "@/lib/product-category-labels";
import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import type { ProductApiRow, ProductApiRowWithStats, ProductFormPayload } from "@/types/product-api";
import {
  Bell,
  ChevronLeft,
  Clapperboard,
  Cog,
  Coffee,
  Copy,
  CupSoda,
  GraduationCap,
  Grid3x3,
  Link2,
  Mail,
  MoreHorizontal,
  Package,
  Plus,
  Store,
  UserSquare,
  Utensils,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type TabId = "novinki" | "zaprosy" | "analytics";

type InquiryRow = {
  id: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  type: "CP" | "SAMPLE";
  status: string;
  createdAt: string;
};

const INQUIRY_STATUS_RU: Record<string, string> = {
  PENDING: "Новый",
  SENT: "Отправлен",
  IN_PROGRESS: "В работе",
  DONE: "Завершён",
  CANCELLED: "Отменён"
};

const CONVERSION_PIE = [
  { name: "С ответом", value: 62 },
  { name: "Без ответа", value: 38 }
];
const PIE_COLORS = ["#0095F6", "#F26522"];

function formatWebsiteUrl(raw: string | null): string | null {
  if (!raw || !raw.trim()) return null;
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function companyHandle(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28);
  return s || "exhibitor";
}

function formatFollowers(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function ExhibitorDashboardInstagram() {
  const [tab, setTab] = useState<TabId>("novinki");
  const [company, setCompany] = useState<ExhibitorProfileCompanyProps | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [products, setProducts] = useState<ProductApiRowWithStats[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductApiRow | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductApiRowWithStats | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, pRes, iRes] = await Promise.all([
        fetch("/api/exhibitor/company", { credentials: "include" }),
        fetch("/api/exhibitor/products", { credentials: "include" }),
        fetch("/api/exhibitor/inquiries", { credentials: "include" })
      ]);

      if (!cRes.ok) throw new Error("company");
      const cJson = (await cRes.json()) as { company?: ExhibitorProfileCompanyProps };
      setCompany(cJson.company ?? null);

      if (!pRes.ok) throw new Error("products");
      const pJson = (await pRes.json()) as { products?: ProductApiRowWithStats[] };
      setProducts(pJson.products ?? []);

      if (iRes.ok) {
        const iJson = (await iRes.json()) as { inquiries?: InquiryRow[] };
        setInquiries(iJson.inquiries ?? []);
      } else {
        setInquiries([]);
      }
    } catch {
      const demo = readDemoSession();
      if (demo.isLoggedIn && demo.role === "EXHIBITOR" && demo.user) {
        setError(null);
        setCompany({
          id: "demo-local",
          name: demo.user.name,
          logoUrl: "/brands/julius-meinl.png",
          description: "Легендарный венский кофе и чай для вашего бизнеса.\n• Оптовые поставки\n• Обучение бариста",
          website: null,
          contacts: emptyContacts(null),
          expertiseCategories: []
        });
        setProducts([]);
        setInquiries([]);
      } else {
        setError("Не удалось загрузить данные кабинета.");
        setCompany(null);
        setProducts([]);
        setInquiries([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const expertiseTags = useMemo(() => {
    if (!company) return [] as string[];
    return company.expertiseCategories.map((c) => PRODUCT_CATEGORY_HASHTAG_RU[c]);
  }, [company]);

  const websiteHref = company
    ? formatWebsiteUrl(company.contacts.website ?? company.website)
    : null;

  const handle = company ? companyHandle(company.name) : "";
  const postsCount = products.length;
  const followersCount = useMemo(() => {
    if (!company) return 7856;
    let h = 0;
    for (let i = 0; i < company.id.length; i++) h = (h + company.id.charCodeAt(i) * (i + 1)) % 9000;
    return 1200 + postsCount * 14 + h;
  }, [company, postsCount]);
  const followingCount = useMemo(() => Math.min(180, 2 + inquiries.length * 3), [inquiries.length]);

  const descriptionLines = useMemo(() => {
    if (!company?.description) return [] as string[];
    return company.description
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }, [company?.description]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: ProductApiRow) {
    setEditing(product);
    setModalOpen(true);
    setDetailProduct(null);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSubmit(payload: ProductFormPayload) {
    if (editing) {
      const response = await fetch(`/api/products/${editing.id}`, {
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
    await loadAll();
    closeModal();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error ?? "Не удалось удалить");
      return;
    }
    setDetailProduct(null);
    await loadAll();
  }

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.prompt("Скопируйте email:", email);
    }
  }

  return (
    <div className="min-h-screen bg-black pb-24 font-sans text-neutral-100 antialiased">
      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-500">
          Загрузка профиля…
        </div>
      ) : error || !company ? (
        <div className="mx-auto max-w-lg p-6">
          <p className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">
            {error ?? "Профиль компании не найден."}
          </p>
        </div>
      ) : (
        <>
          {/* Верхняя строка как в Instagram: назад, @ник, колокол, меню */}
          <div className="sticky top-0 z-40 border-b border-neutral-800 bg-black/90 backdrop-blur-md sm:relative sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
            <div className="mx-auto flex max-w-[935px] items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Link
                  href="/"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-neutral-900"
                  aria-label="На главную"
                >
                  <ChevronLeft className="h-6 w-6 text-neutral-100" strokeWidth={2} />
                </Link>
                <span className="truncate text-sm font-semibold text-neutral-100 sm:text-base">{handle}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="rounded-full p-2 text-neutral-100 hover:bg-neutral-900"
                  aria-label="Уведомления"
                >
                  <Bell className="h-6 w-6" strokeWidth={1.75} />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="rounded-full p-2 text-neutral-100 hover:bg-neutral-900"
                    aria-expanded={menuOpen}
                    aria-label="Меню"
                  >
                    <MoreHorizontal className="h-6 w-6" strokeWidth={1.75} />
                  </button>
                  {menuOpen ? (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default bg-transparent"
                        aria-label="Закрыть меню"
                        onClick={() => setMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-neutral-800 bg-[#262626] py-1 shadow-xl">
                        <Link
                          href="/exhibitor/settings"
                          className="block px-4 py-2.5 text-sm text-neutral-100 hover:bg-neutral-800"
                          onClick={() => setMenuOpen(false)}
                        >
                          Настройки
                        </Link>
                        <Link
                          href="/exhibitor/special-offers"
                          className="block px-4 py-2.5 text-sm text-neutral-100 hover:bg-neutral-800"
                          onClick={() => setMenuOpen(false)}
                        >
                          Спецпредложения
                        </Link>
                        <Link
                          href="/"
                          className="block px-4 py-2.5 text-sm text-neutral-100 hover:bg-neutral-800"
                          onClick={() => setMenuOpen(false)}
                        >
                          На главную
                        </Link>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <section className="mx-auto max-w-[935px] px-4 pb-6 pt-2 sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-16 md:gap-24">
              <div className="mx-auto shrink-0 sm:mx-0">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt=""
                    className="h-[77px] w-[77px] rounded-full border border-neutral-800 bg-[#262626] object-cover sm:h-[150px] sm:w-[150px]"
                  />
                ) : (
                  <div className="flex h-[77px] w-[77px] items-center justify-center rounded-full border border-neutral-800 bg-gradient-to-br from-[#262626] to-black text-2xl font-bold text-[#0095F6] sm:h-[150px] sm:w-[150px] sm:text-4xl">
                    {company.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-4 hidden flex-wrap items-center gap-3 sm:flex">
                  <h1 className="text-xl font-normal text-neutral-100">{handle}</h1>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileEditOpen(true)}
                      className="rounded-lg bg-[#262626] px-4 py-1.5 text-sm font-semibold text-neutral-100 hover:bg-[#363636]"
                    >
                      Редактировать профиль
                    </button>
                    <button
                      type="button"
                      onClick={openCreate}
                      className="rounded-lg bg-[#262626] px-4 py-1.5 text-sm font-semibold text-neutral-100 hover:bg-[#363636]"
                    >
                      Добавить новинку
                    </button>
                    <button
                      type="button"
                      onClick={openCreate}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#262626] text-neutral-100 hover:bg-[#363636]"
                      aria-label="Быстро добавить новинку"
                    >
                      <Plus className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex justify-around text-center sm:hidden">
                  <div>
                    <p className="text-base font-semibold tabular-nums text-neutral-100">
                      {formatFollowers(postsCount)}
                    </p>
                    <p className="text-xs text-neutral-500">публикации</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold tabular-nums text-neutral-100">
                      {formatFollowers(followersCount)}
                    </p>
                    <p className="text-xs text-neutral-500">подписчики</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold tabular-nums text-neutral-100">{followingCount}</p>
                    <p className="text-xs text-neutral-500">подписки</p>
                  </div>
                </div>

                <div className="mb-4 hidden gap-10 sm:flex">
                  <div className="text-center">
                    <p className="text-base font-semibold tabular-nums text-neutral-100">
                      {formatFollowers(postsCount)}
                    </p>
                    <p className="text-sm text-neutral-500">публикации</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold tabular-nums text-neutral-100">
                      {formatFollowers(followersCount)}
                    </p>
                    <p className="text-sm text-neutral-500">подписчики</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold tabular-nums text-neutral-100">{followingCount}</p>
                    <p className="text-sm text-neutral-500">подписки</p>
                  </div>
                </div>

                <div className="mb-3 sm:hidden">
                  <h1 className="text-sm font-semibold text-neutral-100">{company.name}</h1>
                  <p className="text-xs text-neutral-500">Экспонент · B2B</p>
                </div>

                <div className="mb-4 flex flex-wrap gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setProfileEditOpen(true)}
                    className="min-h-9 flex-1 rounded-lg bg-[#262626] px-3 py-2 text-center text-sm font-semibold text-neutral-100"
                  >
                    Изменить профиль
                  </button>
                  <button
                    type="button"
                    onClick={openCreate}
                    className="min-h-9 flex-1 rounded-lg bg-[#262626] px-3 py-2 text-sm font-semibold text-neutral-100"
                  >
                    Новинка
                  </button>
                  <button
                    type="button"
                    onClick={openCreate}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#262626] text-neutral-100"
                    aria-label="Добавить"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="hidden text-sm font-semibold text-neutral-100 sm:block">{company.name}</p>
                  <p className="hidden text-sm text-neutral-500 sm:block">Экспонент · B2B · Сообщество</p>
                  {descriptionLines.length > 0 ? (
                    <ul className="list-none space-y-0.5 text-sm leading-relaxed text-neutral-100">
                      {descriptionLines.map((line, i) => (
                        <li key={i} className={line.startsWith("•") ? "pl-0" : ""}>
                          {line.startsWith("•") ? line : `• ${line}`}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {expertiseTags.length > 0 ? (
                    <p className="text-sm text-[#0095F6]">
                      {expertiseTags.map((tag) => (
                        <span key={tag} className="mr-2">
                          #{tag}
                        </span>
                      ))}
                    </p>
                  ) : null}
                  {websiteHref ? (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#0095F6] hover:text-[#47a7ff]"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {company.website?.replace(/^https?:\/\//i, "") ?? "Сайт"}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Категории (круглые плашки) */}
            <div className="mt-6 border-t border-neutral-800 pt-4">
              <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(
                  [
                    { Icon: Coffee, label: "Кофе" },
                    { Icon: CupSoda, label: "Чай" },
                    { Icon: Cog, label: "Оборудование" },
                    { Icon: Utensils, label: "Посуда" },
                    { Icon: Wrench, label: "Сервис" },
                    { Icon: GraduationCap, label: "Обучение" },
                    { Icon: Package, label: "Прочее" }
                  ] as const
                ).map(({ Icon, label }) => (
                  <div key={label} className="flex shrink-0 flex-col items-center gap-1.5">
                    <div
                      className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white shadow-md transition-shadow duration-200 hover:shadow-lg sm:h-20 sm:w-20"
                      aria-hidden
                    >
                      <Icon className="h-7 w-7 text-neutral-700 sm:h-8 sm:w-8" strokeWidth={1.75} />
                    </div>
                    <span className="max-w-[88px] text-center text-[0.75rem] leading-tight text-neutral-500">
                      {label}
                    </span>
                  </div>
                ))}
                <Link
                  href="/exhibitor/showcase"
                  className="flex shrink-0 flex-col items-center gap-1.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="Витрина — предпросмотр публичной витрины"
                >
                  <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white shadow-md transition-shadow duration-200 hover:shadow-lg sm:h-20 sm:w-20">
                    <Store className="h-7 w-7 text-neutral-700 sm:h-8 sm:w-8" strokeWidth={1.75} />
                  </div>
                  <span className="max-w-[88px] text-center text-[0.75rem] leading-tight text-neutral-500">
                    Витрина
                  </span>
                </Link>
              </div>
            </div>

            {/* Рекомендации (мок) */}
            <div className="mt-6 border-t border-neutral-800 pt-4">
              <div className="mb-3 flex items-center justify-between px-0.5">
                <span className="text-sm font-semibold text-neutral-100">Рекомендации для вас</span>
                <button type="button" className="text-sm font-semibold text-[#0095F6] hover:text-[#47a7ff]">
                  Все
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { t: "Лента спроса", s: "Найдите новых клиентов" },
                  { t: "Премиум", s: "Расширенная аналитика" },
                  { t: "Ответы", s: "Быстрее на запросы" }
                ].map((card) => (
                  <div
                    key={card.t}
                    className="relative min-w-[200px] shrink-0 rounded-xl bg-[#262626] p-4 text-center"
                  >
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                      aria-label="Закрыть"
                    >
                      ×
                    </button>
                    <p className="text-sm font-semibold text-neutral-100">{card.t}</p>
                    <p className="mt-1 text-xs text-neutral-500">{card.s}</p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg bg-[#0095F6] py-1.5 text-xs font-semibold text-white hover:bg-[#1877d2]"
                    >
                      Включить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Вкладки: сетка | рилсы/запросы | метки/аналитика */}
          <div className="sticky top-0 z-30 border-t border-neutral-800 bg-black">
            <div className="mx-auto flex max-w-[935px] justify-center gap-0 border-t border-neutral-800">
                {(
                [
                  { id: "novinki" as const, Icon: Grid3x3, label: "Публикации" },
                  { id: "zaprosy" as const, Icon: Clapperboard, label: "Запросы" },
                  { id: "analytics" as const, Icon: UserSquare, label: "Аналитика" }
                ] as const
              ).map(({ id, Icon, label }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    title={label}
                    className={`flex flex-1 justify-center border-t-2 py-3 transition sm:flex-none sm:min-w-[120px] ${
                      active ? "border-white text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto max-w-[935px] px-0 py-4 sm:px-4">
            {tab === "novinki" ? (
              <div className="space-y-0">
                {products.length === 0 ? (
                  <p className="px-4 py-16 text-center text-sm text-neutral-500">
                    Пока нет публикаций. Нажмите «Добавить новинку».
                  </p>
                ) : (
                  <ul className="grid grid-cols-3 gap-[2px] sm:gap-1">
                    {products.map((p) => (
                      <li key={p.id} className="aspect-square">
                        <button
                          type="button"
                          onClick={() => setDetailProduct(p)}
                          className="group relative block h-full w-full overflow-hidden bg-[#262626]"
                        >
                          <ProductCoverThumb
                            product={p}
                            className="absolute inset-0 h-full w-full"
                            imgClassName="h-full w-full object-contain bg-slate-50 transition group-hover:opacity-90"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            {tab === "zaprosy" ? (
              <div className="space-y-3 px-4">
                {inquiries.length === 0 ? (
                  <p className="rounded-xl border border-neutral-800 bg-[#262626] py-12 text-center text-sm text-neutral-500">
                    Входящих запросов пока нет.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {inquiries.map((row) => (
                      <li
                        key={row.id}
                        className="rounded-xl border border-neutral-800 bg-[#262626] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-100">{row.productName}</p>
                            <p className="mt-1 text-sm text-neutral-400">
                              {row.customerName}
                              {" · "}
                              <span className="break-all text-[#0095F6]">{row.customerEmail}</span>
                            </p>
                            <p className="mt-2 text-xs text-neutral-500">
                              {new Date(row.createdAt).toLocaleString("ru-RU", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                              {" · "}
                              {row.type === "CP" ? "КП" : "Образец"}
                              {" · "}
                              {INQUIRY_STATUS_RU[row.status] ?? row.status}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <a
                              href={`mailto:${row.customerEmail}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-600 bg-[#363636] px-3 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-[#404040]"
                            >
                              <Mail className="h-4 w-4" />
                              Связаться
                            </a>
                            <button
                              type="button"
                              onClick={() => void copyEmail(row.customerEmail)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-transparent px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                            >
                              <Copy className="h-4 w-4" />
                              Копировать
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            {tab === "analytics" ? (
              <div className="space-y-6 px-4">
                <section className="rounded-xl border border-neutral-800 bg-[#262626] p-6">
                  <h2 className="text-lg font-semibold text-neutral-100">Просмотры новинок (демо)</h2>
                  <p className="mt-1 text-xs text-neutral-500">Данные для демонстрации интерфейса</p>
                  <div className="mt-4 [&_.recharts-cartesian-axis-tick-value]:fill-neutral-400 [&_.recharts-legend-item-text]:fill-neutral-300 [&_.recharts-text]:fill-neutral-200">
                    <AnalyticsViewsBars dark />
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-800 bg-[#262626] p-6">
                  <h2 className="text-lg font-semibold text-neutral-100">Конверсия запросов (демо)</h2>
                  <div className="mx-auto mt-4 h-64 max-w-sm [&_.recharts-legend-item-text]:fill-neutral-300">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CONVERSION_PIE}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={88}
                          paddingAngle={2}
                        >
                          {CONVERSION_PIE.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#262626",
                            border: "1px solid #404040",
                            borderRadius: 8
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </>
      )}

      {profileEditOpen && company && company.id !== "demo-local" ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Закрыть"
            onClick={() => setProfileEditOpen(false)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-800 bg-[#121212] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-neutral-100">Редактирование профиля</h2>
              <button
                type="button"
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                aria-label="Закрыть"
                onClick={() => setProfileEditOpen(false)}
              >
                ✕
              </button>
            </div>
            <EditProfileForm
              companyId={company.id}
              initial={company}
              variant="modal"
              onSaved={(next) => {
                setCompany(next);
                setProfileEditOpen(false);
              }}
              onCancel={() => setProfileEditOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {profileEditOpen && company?.id === "demo-local" ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Закрыть"
            onClick={() => setProfileEditOpen(false)}
          />
          <div className="relative z-10 max-w-sm rounded-xl border border-neutral-700 bg-[#262626] p-6 text-center text-sm text-neutral-200">
            <p>В демо-режиме профиль не сохраняется на сервер. Войдите как экспонент с аккаунтом из базы.</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-[#0095F6] px-4 py-2 font-semibold text-white"
              onClick={() => setProfileEditOpen(false)}
            >
              Понятно
            </button>
          </div>
        </div>
      ) : null}

      <AddProductModal
        open={modalOpen}
        onClose={closeModal}
        initialProduct={editing}
        onSubmit={handleSubmit}
      />

      <ProductDetailModal
        open={detailProduct !== null}
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={(p) => openEdit(p)}
        onDelete={handleDelete}
      />
    </div>
  );
}
