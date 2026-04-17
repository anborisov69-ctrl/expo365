"use client";

import {
  HORECA_CATEGORY_LABELS,
  type HorecaExhibitor,
  horecaExhibitors
} from "@/data/exhibitors";
import { useMemo, useState } from "react";

const ALL_KEY = "all" as const;

export function HorecaCatalogClient() {
  const [selectedCategory, setSelectedCategory] = useState<string | typeof ALL_KEY>(ALL_KEY);

  const filterKeys = useMemo(
    () => [ALL_KEY, ...HORECA_CATEGORY_LABELS] as const,
    []
  );

  const visible = useMemo(() => {
    if (selectedCategory === ALL_KEY) {
      return horecaExhibitors;
    }
    return horecaExhibitors.filter((ex) => ex.categories.includes(selectedCategory));
  }, [selectedCategory]);

  function handleCardClick(exhibitor: HorecaExhibitor) {
    window.alert("Страница компании в разработке");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-expoBlue md:text-4xl">
          Экспоненты HoReCa
        </h1>
        <p className="mt-3 text-base text-slate-600 md:text-lg">
          Выберите категорию, чтобы найти нужного поставщика
        </p>
      </header>

      <div className="mt-8 md:mt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Категории
        </p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {filterKeys.map((key) => {
            const label = key === ALL_KEY ? "Все" : key;
            const active = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-expoBlue text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-expoBlue/40 hover:text-expoBlue"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-600">
          В этой категории пока нет экспонентов
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((exhibitor) => (
            <li key={exhibitor.id}>
              <button
                type="button"
                onClick={() => handleCardClick(exhibitor)}
                className="flex w-full flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-md transition hover:border-expoBlue/25 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-expoBlue focus-visible:ring-offset-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exhibitor.logo}
                  alt=""
                  className="h-24 w-24 rounded-2xl object-cover ring-1 ring-slate-100"
                />
                <span className="mt-4 text-lg font-bold text-expoBlue">{exhibitor.name}</span>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {exhibitor.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
