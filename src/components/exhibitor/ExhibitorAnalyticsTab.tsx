"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useCallback, useEffect, useState } from "react";

interface StatsPayload {
  productsTotal: number;
  inquiriesTotal: number;
  bidsSubmitted: number;
  chartSeries: { label: string; count: number }[];
}

export function ExhibitorAnalyticsTab() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/exhibitor/stats", { credentials: "include" });
      if (!response.ok) {
        throw new Error("load");
      }
      const data = (await response.json()) as StatsPayload;
      setStats(data);
    } catch {
      setError("Не удалось загрузить статистику.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const chartData =
    stats?.chartSeries && stats.chartSeries.length > 0
      ? stats.chartSeries.map((row) => ({ day: row.label, views: row.count }))
      : [
          { day: "—", views: 0 },
          { day: "—", views: 0 },
          { day: "—", views: 0 }
        ];

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-500">Загрузка статистики…</p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-neutral-900">{stats.productsTotal}</p>
              <p className="text-xs font-medium text-neutral-600">Новинок в каталоге</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-neutral-900">{stats.inquiriesTotal}</p>
              <p className="text-xs font-medium text-neutral-600">Входящих запросов (КП / образцы)</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-neutral-900">{stats.bidsSubmitted}</p>
              <p className="text-xs font-medium text-neutral-600">Откликов на заявки спроса</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-center text-sm font-semibold text-neutral-800">
              Новинки за последние 7 дней (по дням публикации)
            </h3>
            <div className="h-64 w-full rounded-xl border border-neutral-200 bg-white p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B2B5E" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0B2B5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#525252" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#525252" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e5e5",
                      fontSize: "13px"
                    }}
                    labelStyle={{ fontWeight: 600 }}
                    formatter={(value) => [`${value ?? 0}`, "Новинок"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Новинок"
                    stroke="#0B2B5E"
                    strokeWidth={2}
                    fill="url(#fillViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-xs text-neutral-400">
              Данные из вашей базы: число опубликованных карточек по дням.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
