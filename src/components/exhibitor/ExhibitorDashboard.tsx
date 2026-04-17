import type { RelevantDemandSummary } from "@/lib/exhibitor-relevant-demands";
import { exhibitorH1, exhibitorMuted, exhibitorPageWrap } from "@/components/exhibitor/exhibitor-ui";
import { productCategoryLabelRu } from "@/lib/product-category-labels";
import Link from "next/link";
import { ExhibitorLogoutButton } from "@/components/exhibitor/ExhibitorLogoutButton";
import { StatCard } from "@/components/exhibitor/StatCard";
import { Eye, Inbox, MessageSquare, Percent } from "lucide-react";

function formatDate(createdAt: Date): string {
  try {
    return createdAt.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

export function ExhibitorDashboard({
  demands,
  relevantTotal
}: {
  demands: RelevantDemandSummary[];
  relevantTotal: number;
}) {
  return (
    <div className="min-h-screen bg-exhibitorBg">
      <div className={`${exhibitorPageWrap} mx-auto max-w-5xl space-y-8`}>
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">ЭКСПО 365</p>
          <h1 className={`${exhibitorH1} mt-6`}>Личный кабинет экспонента</h1>
          <p className={`${exhibitorMuted} mt-2 max-w-2xl`}>
            Обзор ключевых показателей и релевантные заявки без вашего отклика.
          </p>
        </header>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Показатели</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              title="Новые релевантные заявки"
              value={relevantTotal}
              icon={Inbox}
              delta="+12.4% к прошлому месяцу"
            />
            <StatCard title="Просмотры стенда" value={128} icon={Eye} delta="+8.2% к прошлой неделе" />
            <StatCard title="Открытые запросы КП" value={24} icon={MessageSquare} delta="+3.1% к прошлому месяцу" />
            <StatCard title="Конверсия в сделки" value="4.2%" icon={Percent} delta="+0.6 п.п. к кварталу" />
          </div>
        </section>

        <section
          className={`rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover`}
        >
          <h2 className="text-lg font-semibold text-expoBlue">Новые релевантные заявки</h2>
          <p className="mt-1 text-sm text-slate-500">Активные заявки по вашей экспертизе, без вашего отклика (до 5 в списке).</p>
          {demands.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">Сейчас нет подходящих заявок без отклика.</p>
          ) : (
            <ul className="mt-6 divide-y divide-slate-100">
              {demands.map((row) => (
                <li key={row.id} className="py-4 first:pt-0 last:pb-0">
                  <Link
                    href={`/demand/${row.id}`}
                    className="group block rounded-[10px] px-1 py-1 transition hover:bg-slate-50"
                  >
                    <span className="font-semibold text-expoBlue group-hover:underline">{row.title}</span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span>{productCategoryLabelRu[row.category]}</span>
                      <span>{formatDate(row.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/demand-feed"
            className="inline-flex items-center justify-center rounded-[8px] bg-expoOrange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Лента спроса
          </Link>
          <ExhibitorLogoutButton />
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[8px] border border-expoBlue/20 bg-white px-5 py-2.5 text-sm font-semibold text-expoBlue shadow-sm transition hover:bg-expoBlue/5"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
