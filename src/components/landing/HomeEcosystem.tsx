"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Coffee,
  HeartHandshake,
  ScanLine,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Store
} from "lucide-react";
import { useCallback, useState } from "react";

type IndustryId = "horeca" | "beauty" | "retail" | "medtech" | "realestate";

interface IndustryCardDef {
  id: IndustryId;
  titleRu: string;
  titleEn: string;
  description: string;
  icon: typeof Coffee;
  available: boolean;
}

const industries: IndustryCardDef[] = [
  {
    id: "horeca",
    titleRu: "HoReCa",
    titleEn: "Гостеприимство",
    description: "Рестораны, отели, кафе — ведущее направление платформы.",
    icon: Coffee,
    available: true
  },
  {
    id: "beauty",
    titleRu: "Beauty",
    titleEn: "Красота",
    description: "Салоны, косметика, оборудование.",
    icon: Sparkles,
    available: false
  },
  {
    id: "retail",
    titleRu: "Retail",
    titleEn: "Ритейл",
    description: "Магазины, сети, поставщики.",
    icon: ShoppingBag,
    available: false
  },
  {
    id: "medtech",
    titleRu: "MedTech",
    titleEn: "Медицина",
    description: "Оборудование, расходные материалы.",
    icon: Stethoscope,
    available: false
  },
  {
    id: "realestate",
    titleRu: "Real Estate",
    titleEn: "Недвижимость",
    description: "Коммерческая, офисы, помещения.",
    icon: Building2,
    available: false
  }
];

const MODAL_MESSAGE =
  "Это направление находится в разработке. Скоро оно будет доступно.";

export function HomeEcosystem() {
  const [modalOpen, setModalOpen] = useState(false);

  const openStub = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12 md:py-16 lg:py-20">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <div className="mb-2 flex justify-center px-2">
            <Image
              src="/expo-365-logo.png"
              alt="EXPO 365 — B2B platform"
              width={440}
              height={144}
              priority
              className="h-auto w-full max-w-[min(100%,22rem)] object-contain sm:max-w-md md:max-w-lg"
            />
          </div>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Многоотраслевая B2B-экосистема: выберите направление, чтобы перейти в ленту новинок и сервисы
            платформы.
          </p>
        </div>

        <section
          className="mt-10 w-full max-w-6xl sm:mt-12 md:mt-14"
          aria-label="Отрасли экосистемы ЭКСПО 365"
        >
          <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-expoBlue sm:text-2xl">
            Отрасли экосистемы
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {industries.map((item) => {
              const Icon = item.icon;
              const inner = (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-expoBlue/8 text-expoBlue sm:h-14 sm:w-14">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-base font-bold leading-tight text-expoBlue sm:text-lg">
                    {item.titleRu}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                    {item.titleEn}
                  </p>
                  <p className="mt-2 line-clamp-2 text-left text-xs leading-snug text-slate-600 sm:text-sm">
                    {item.description}
                  </p>
                  {item.available ? (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-expoOrange sm:text-sm">
                      <HeartHandshake className="h-4 w-4 shrink-0" aria-hidden />
                      Открыто
                    </span>
                  ) : (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-400 sm:text-sm">
                      <ScanLine className="h-4 w-4 shrink-0" aria-hidden />
                      Скоро
                    </span>
                  )}
                </>
              );

              const cardClass =
                "group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-md transition hover:bg-slate-50/80 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-expoBlue focus-visible:ring-offset-2 sm:p-5";

              if (item.available) {
                return (
                  <Link
                    key={item.id}
                    href="/horeca"
                    className={cardClass}
                  >
                    {inner}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${cardClass} cursor-pointer text-left`}
                  onClick={openStub}
                >
                  {inner}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/demand-feed"
              className="inline-flex items-center justify-center rounded-xl bg-expoOrange px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-expoOrange focus-visible:ring-offset-2"
            >
              Лента спроса
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center rounded-xl border-2 border-expoBlue bg-white px-5 py-2.5 text-sm font-semibold text-expoBlue transition hover:bg-expoBlue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-expoBlue focus-visible:ring-offset-2"
            >
              Новинки HoReCa
            </Link>
          </div>
        </section>
      </main>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ecosystem-stub-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            aria-label="Закрыть"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-expoOrange/15 text-expoOrange">
              <Store className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 id="ecosystem-stub-title" className="text-lg font-bold text-expoBlue">
              Направление в разработке
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{MODAL_MESSAGE}</p>
            <button
              type="button"
              onClick={closeModal}
              className="mt-6 w-full rounded-xl bg-expoOrange py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Понятно
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
