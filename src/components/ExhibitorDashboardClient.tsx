"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  companyName: string;
  standViews: number;
  inquiryCount: number;
  productsCount: number;
}

export function ExhibitorDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const response = await fetch("/api/dashboard/exhibitor");
      if (!response.ok) {
        return;
      }
      const dashboardData = (await response.json()) as DashboardData;
      setData(dashboardData);
    }

    void loadDashboard();
  }, []);

  if (!data) {
    return <p>Загрузка дашборда...</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Компания</p>
        <p className="mt-2 text-xl font-semibold text-expoBlue">{data.companyName}</p>
      </article>
      <article className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Просмотры стенда</p>
        <p className="mt-2 text-xl font-semibold">{data.standViews}</p>
      </article>
      <article className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Запросы КП</p>
        <p className="mt-2 text-xl font-semibold">{data.inquiryCount}</p>
      </article>
    </div>
  );
}
