import { quickActions } from "@/lib/landing-data";
import { QuickActionIcon } from "@/components/landing/icons";

export function QuickActionsRow() {
  return (
    <section id="services" className="scroll-mt-20 border-t border-slate-100 bg-slate-50 py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold text-expoBlue sm:text-xl">Сервисы платформы</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-600">
          Быстрый доступ к модулям (заглушки — маршруты подключатся позже).
        </p>
        <ul className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10">
          {quickActions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className="group flex w-[88px] flex-col items-center gap-2 text-center sm:w-[100px]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-expoBlue/20 bg-white shadow-sm transition group-hover:border-expoOrange group-hover:shadow-md">
                  <QuickActionIcon name={action.icon} />
                </span>
                <span className="text-xs font-medium text-slate-700 sm:text-sm">{action.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
