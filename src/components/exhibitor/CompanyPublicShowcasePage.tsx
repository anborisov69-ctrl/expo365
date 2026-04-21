"use client";

import { AdminEditExhibitorProfileButton } from "@/components/admin/AdminEditExhibitorProfileButton";
import { ProductCoverThumb } from "@/components/product/ProductCoverThumb";
import { VisitorProductActionButtons } from "@/components/product/VisitorProductActionButtons";
import type { CompanyPublicApi } from "@/lib/company-update-shared";
import type { CompanyContactsPayload } from "@/lib/company-contacts";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/lib/product-category-labels";
import type { ProductApiRow } from "@/types/product-api";
import type { Product } from "@prisma/client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PublicCompanyPayload = {
  company: CompanyPublicApi;
  contacts: CompanyContactsPayload;
  products: Product[];
  _meta: { authenticated: boolean; isVisitor: boolean; isAdmin: boolean };
};

function formatWebsiteUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function toProductApiRow(
  p: Product,
  companyName: string,
  logo: string | null
): ProductApiRow {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    imageUrl: p.imageUrl,
    mediaType: p.mediaType === "video" ? "video" : "image",
    mediaUrl: p.mediaUrl,
    isSampleAvailable: p.isSampleAvailable,
    isPublished: p.isPublished,
    companyId: p.companyId,
    company: { name: companyName, logo }
  };
}

export function CompanyPublicShowcasePage({ companyId }: { companyId: string }) {
  const [data, setData] = useState<PublicCompanyPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoFailed, setLogoFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/public/companies/${companyId}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) {
          setLoadError("Компания не найдена.");
        } else setLoadError("Не удалось загрузить витрину");
        setData(null);
        return;
      }
      const json = (await res.json()) as PublicCompanyPayload;
      setData(json);
    } catch {
      setLoadError("Ошибка сети");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setLogoFailed(false);
  }, [companyId, data?.company.logoUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-center text-slate-500">Загрузка…</div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-center text-slate-700">
        <p>{loadError ?? "Нет данных"}</p>
        <Link href="/" className="mt-4 inline-block font-medium text-expoBlue hover:underline">
          На главную
        </Link>
      </div>
    );
  }

  const { company, contacts, products, _meta } = data;
  const websiteHref = formatWebsiteUrl(contacts.website ?? company.website);
  const email = contacts.email?.trim() || null;
  const phone = contacts.phone?.trim() || null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 lg:max-w-5xl">
          <Link href="/" className="text-sm font-semibold text-expoBlue hover:underline">
            ← Экспо 365
          </Link>
          {_meta.isAdmin ? (
            <AdminEditExhibitorProfileButton companyId={company.id} label="Редактировать профиль" />
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 lg:max-w-5xl">
        {!_meta.authenticated ? (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm text-amber-950">
            <span className="font-medium">Войдите, чтобы запросить КП или образец.</span>{" "}
            <Link href="/login" className="font-semibold text-expoBlue underline-offset-2 hover:underline">
              Войти
            </Link>
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-exhibitor sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="mx-auto shrink-0 sm:mx-0">
              {company.logoUrl && !logoFailed ? (
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 sm:h-36 sm:w-36">
                  {/* eslint-disable-next-line @next/next/no-img-element -- надёжнее next/image для внешних CDN и без обязательной оптимизации */}
                  <img
                    src={company.logoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoFailed(true)}
                  />
                </div>
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-3xl font-bold text-expoBlue sm:h-36 sm:w-36 sm:text-4xl">
                  {company.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{company.name}</h1>
              {company.description ? (
                <p className="mt-4 whitespace-pre-line text-left text-sm leading-relaxed text-slate-600">
                  {company.description}
                </p>
              ) : null}
              <ul className="mt-6 space-y-2 text-left text-sm text-slate-700">
                {email ? (
                  <li>
                    <span className="font-medium text-slate-500">Email: </span>
                    <a href={`mailto:${email}`} className="text-expoBlue hover:underline">
                      {email}
                    </a>
                  </li>
                ) : null}
                {phone ? (
                  <li>
                    <span className="font-medium text-slate-500">Телефон: </span>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-expoBlue hover:underline">
                      {phone}
                    </a>
                  </li>
                ) : null}
                {websiteHref ? (
                  <li>
                    <span className="font-medium text-slate-500">Сайт: </span>
                    <a href={websiteHref} target="_blank" rel="noreferrer" className="text-expoBlue hover:underline">
                      {contacts.website ?? company.website}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Новинки</h2>
          {products.length === 0 ? (
            <p className="mt-4 text-center text-sm text-slate-500">Пока нет опубликованных новинок</p>
          ) : (
            <div className="mt-6 flex flex-col gap-6">
              {products.map((p) => {
                const row = toProductApiRow(p, company.name, company.logoUrl ?? null);
                return (
                  <article
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-[12px] border border-slate-100/90 bg-white shadow-exhibitor md:flex-row md:items-stretch"
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 md:aspect-auto md:h-auto md:w-52 md:min-h-[160px] md:max-w-[13rem]">
                      <ProductCoverThumb
                        product={row}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-contain bg-slate-50"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-expoOrange">
                        {PRODUCT_CATEGORY_LABEL_RU[p.category]}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-expoBlue">{p.name}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{p.description}</p>
                      <p className="mt-3 text-xl font-bold text-slate-900">{p.price}</p>
                      {p.isSampleAvailable ? (
                        <p className="mt-1 text-xs font-medium text-expoOrange">Образец доступен</p>
                      ) : null}
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <VisitorProductActionButtons
                          product={{
                            id: p.id,
                            name: p.name,
                            category: p.category,
                            isSampleAvailable: p.isSampleAvailable,
                            companyId: company.id
                          }}
                          variant="feed"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
