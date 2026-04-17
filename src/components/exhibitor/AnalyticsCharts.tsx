"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyticsConversion, analyticsRegions, analyticsViewsByDay } from "@/lib/exhibitor-mocks";

export function AnalyticsViewsBars({ dark = false }: { dark?: boolean }) {
  const grid = dark ? "#404040" : "#e2e8f0";
  const tick = dark ? "#a3a3a3" : "#64748b";
  const bar = dark ? "#0095F6" : "#0B2B5E";
  const tooltip = dark
    ? { borderRadius: "12px" as const, background: "#262626", border: "1px solid #404040", color: "#e5e5e5" }
    : { borderRadius: "12px" as const };

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={analyticsViewsByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: tick }} stroke={tick} />
          <YAxis tick={{ fontSize: 12, fill: tick }} stroke={tick} allowDecimals={false} />
          <Tooltip contentStyle={tooltip} />
          <Bar dataKey="views" fill={bar} radius={[6, 6, 0, 0]} name="Просмотры" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AnalyticsConversionChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={analyticsConversion} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" unit="%" />
          <Tooltip
            contentStyle={{ borderRadius: "12px" }}
            formatter={(value) => [`${typeof value === "number" ? value : 0}%`, "Конверсия"]}
          />
          <Bar dataKey="rate" fill="#F26522" radius={[6, 6, 0, 0]} name="Конверсия" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AnalyticsRegionsBars() {
  const max = Math.max(...analyticsRegions.map((r) => r.value), 1);
  return (
    <div className="space-y-3">
      {analyticsRegions.map((row) => (
        <div key={row.region}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-expoBlue">{row.region}</span>
            <span className="tabular-nums text-slate-600">{row.value}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-expoOrange transition-all"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
