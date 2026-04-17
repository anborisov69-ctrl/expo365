import type { ExhibitorCard } from "@/lib/landing-data";

interface ExhibitorsSectionProps {
  items: ExhibitorCard[];
}

export function ExhibitorsSection({ items }: ExhibitorsSectionProps) {
  return (
    <section id="exhibitors" className="scroll-mt-20 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-expoBlue sm:text-3xl">Проверенные экспоненты</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Подборка для демонстрации: название, специализация и место под логотип (данные из API позже).
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((ex) => (
            <article
              key={ex.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm transition hover:border-expoBlue/30 hover:shadow-md"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-expoBlue to-[#143d7a] text-lg font-bold text-white shadow-inner"
                aria-hidden
              >
                {ex.logoInitials}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-expoBlue">{ex.companyName}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{ex.specialization}</p>
              <p className="mt-3 text-xs text-slate-400">Логотип: заглушка · id: {ex.id}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
