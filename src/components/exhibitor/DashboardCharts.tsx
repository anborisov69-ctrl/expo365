"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { viewsLast7Days } from "@/lib/exhibitor-mocks";

export function DashboardViewsChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={viewsLast7Days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
            labelStyle={{ color: "#0B2B5E" }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#F26522"
            strokeWidth={2}
            dot={{ fill: "#F26522", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Просмотры"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
