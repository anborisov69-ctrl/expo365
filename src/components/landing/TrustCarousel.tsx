"use client";

import { useRef } from "react";
import type { VerifiedSupplierCard } from "@/lib/landing-data";
import { VerifiedBadgeIcon } from "@/components/landing/icons";

interface TrustCarouselProps {
  items: VerifiedSupplierCard[];
}

export function TrustCarousel({ items }: TrustCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDirection(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const card = el.querySelector<HTMLElement>("[data-trust-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
  }

  return (
    <section
      id="trust"
      className="scroll-mt-20 border-y border-slate-100 bg-slate-50/80 py-12 sm:py-14"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="trust-heading" className="text-center text-xl font-bold text-expoBlue sm:text-2xl">
          Поставщики с проверкой
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
          Карточки Verified Supplier — демо-данные для презентации структуры платформы
        </p>

        <div className="relative mt-8">
          <button
            type="button"
            onClick={() => scrollByDirection("left")}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 text-expoBlue shadow-md transition hover:bg-slate-50 lg:flex"
            aria-label="Прокрутить влево"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection("right")}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 text-expoBlue shadow-md transition hover:bg-slate-50 lg:flex"
            aria-label="Прокрутить вправо"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:scroll-pl-4 lg:scroll-pr-4 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => (
              <article
                key={item.id}
                data-trust-card
                className="min-w-[min(100%,320px)] shrink-0 snap-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:min-w-[280px] lg:min-w-[calc(33.333%-11px)]"
              >
                <div className="flex items-start gap-4">
                  <VerifiedBadgeIcon />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-expoBlue">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 lg:hidden">Свайпните карточки влево-вправо</p>
      </div>
    </section>
  );
}
