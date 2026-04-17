"use client";

import { AnalyticsConversionChart, AnalyticsRegionsBars, AnalyticsViewsBars } from "@/components/exhibitor/AnalyticsCharts";
import { exhibitorH1, exhibitorMuted, exhibitorPageWrap } from "@/components/exhibitor/exhibitor-ui";

export function ExhibitorAnalyticsPage() {
  return (
    <div className="min-h-screen bg-exhibitorBg">
      <div className={`${exhibitorPageWrap} space-y-8`}>
        <div>
          <h1 className={exhibitorH1}>Аналитика</h1>
          <p className={`${exhibitorMuted} mt-1`}>Графики на мок-данных (Recharts + заглушки).</p>
        </div>

        <section
          className="rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover"
        >
          <h2 className="text-lg font-semibold text-expoBlue">Просмотры стенда по дням</h2>
          <div className="mt-4">
            <AnalyticsViewsBars />
          </div>
        </section>

        <section
          className="rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover"
        >
          <h2 className="text-lg font-semibold text-expoBlue">Конверсия запросов в сделки (%)</h2>
          <div className="mt-4">
            <AnalyticsConversionChart />
          </div>
        </section>

        <section
          className="rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover"
        >
          <h2 className="text-lg font-semibold text-expoBlue">Регионы просмотров</h2>
          <div className="mt-6 max-w-xl">
            <AnalyticsRegionsBars />
          </div>
        </section>
      </div>
    </div>
  );
}
