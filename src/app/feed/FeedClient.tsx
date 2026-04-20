"use client";

import {
  FEED_IMAGE_PLACEHOLDER,
  PRODUCT_CATEGORIES,
  prismaCategoryToProductCategory,
  type ProductCategory
} from "@/data/products";
import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import { ProductCoverThumb } from "@/components/product/ProductCoverThumb";
import { ProductMediaHero } from "@/components/product/ProductMediaHero";
import { VisitorProductActionButtons } from "@/components/product/VisitorProductActionButtons";
import type { ProductApiRow } from "@/types/product-api";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

function initialCategoryState(): Record<ProductCategory, boolean> {
  return {
    coffee: true,
    tea: true,
    equipment: true,
    dishes: true
  };
}

export function FeedClient() {
  const [categoryEnabled, setCategoryEnabled] = useState<Record<ProductCategory, boolean>>(
    initialCategoryState
  );
  const [items, setItems] = useState<ProductApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductApiRow | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Ошибка загрузки");
      }
      const data = (await response.json()) as { products?: ProductApiRow[] };
      setItems(data.products ?? []);
    } catch {
      setLoadError("Не удалось загрузить новинки.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const anyCategoryEnabled = useMemo(
    () => Object.values(categoryEnabled).some(Boolean),
    [categoryEnabled]
  );

  const visibleProducts = useMemo(() => {
    if (!anyCategoryEnabled) {
      return [];
    }
    return items.filter((product) => {
      const ui = prismaCategoryToProductCategory(product.category);
      return categoryEnabled[ui];
    });
  }, [items, categoryEnabled, anyCategoryEnabled]);

  function showAllCategories() {
    setCategoryEnabled(initialCategoryState());
  }

  function toggleCategory(category: ProductCategory) {
    setCategoryEnabled((previous) => ({
      ...previous,
      [category]: !previous[category]
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <SiteHeaderLogo href="/" variant="compact" className="shrink-0" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-expoBlue md:text-3xl">Новинки индустрии</h1>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-expoBlue hover:underline"
          >
            На главную
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Выберите категории — отображаются только товары из включённых групп. Данные из каталога
            платформы.
          </p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Фильтр по категориям">
            <button
              type="button"
              onClick={showAllCategories}
              className="rounded-full border border-expoBlue bg-expoBlue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              Все
            </button>
            {PRODUCT_CATEGORIES.map(({ id, label }) => {
              const active = categoryEnabled[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCategory(id)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-expoOrange bg-expoOrange/15 text-expoBlue ring-1 ring-expoOrange/40"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {loadError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {loadError}
          </p>
        ) : null}

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Загрузка…
          </p>
        ) : !anyCategoryEnabled ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Включите хотя бы одну категорию или нажмите «Все».
          </p>
        ) : visibleProducts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Нет новинок в выбранных категориях.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => {
              const ui = prismaCategoryToProductCategory(product.category);
              const placeholder = FEED_IMAGE_PLACEHOLDER[ui];
              return (
                <li key={product.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-expoBlue/35 hover:shadow-md">
                    <button
                      type="button"
                      onClick={() => setViewProduct(product)}
                      className={`relative block w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-expoBlue ${placeholder}`}
                      aria-label={`Открыть: ${product.name}`}
                    >
                      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-100 to-slate-200">
                        <ProductCoverThumb
                          product={product}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-contain bg-slate-50"
                        />
                      </div>
                    </button>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="flex-1 text-lg font-semibold leading-snug text-slate-900">{product.name}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                      <p className="mt-3 text-xl font-bold text-expoBlue">{product.price}</p>
                      <p className="mt-2 text-sm text-slate-600">{product.company.name}</p>
                      {product.isSampleAvailable ? (
                        <p className="mt-1 text-xs font-medium text-expoOrange">Доступен образец</p>
                      ) : null}
                      <div className="mt-4">
                        <VisitorProductActionButtons
                          product={{
                            id: product.id,
                            name: product.name,
                            category: product.category,
                            isSampleAvailable: product.isSampleAvailable,
                            companyId: product.companyId
                          }}
                          variant="feed"
                        />
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {viewProduct ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Закрыть"
            onClick={() => setViewProduct(null)}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="relative aspect-[4/3] w-full bg-neutral-100">
              <ProductMediaHero
                product={viewProduct}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-2 text-neutral-700 shadow-md transition hover:bg-white"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <h2 className="text-xl font-bold text-neutral-900">{viewProduct.name}</h2>
              <p className="text-sm text-neutral-600">{viewProduct.company.name}</p>
              <p className="text-xl font-bold text-expoBlue">{viewProduct.price}</p>
              <p className="text-sm leading-relaxed text-neutral-800">{viewProduct.description}</p>
              <div className="mt-4">
                <VisitorProductActionButtons
                  product={{
                    id: viewProduct.id,
                    name: viewProduct.name,
                    category: viewProduct.category,
                    isSampleAvailable: viewProduct.isSampleAvailable,
                    companyId: viewProduct.companyId
                  }}
                  variant="feed"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
