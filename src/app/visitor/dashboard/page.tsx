import { VisitorDashboardClient } from "@/components/visitor/VisitorDashboardClient";
import { Suspense } from "react";

function DashboardFallback() {
  return (
    <div className="py-16 text-center text-sm text-slate-500">Загрузка кабинета…</div>
  );
}

/** Маршрут `/visitor/dashboard` (старый `/buyer/dashboard` редиректится в `next.config`). */
export default function VisitorDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Кабинет посетителя</h1>
      <Suspense fallback={<DashboardFallback />}>
        <VisitorDashboardClient />
      </Suspense>
    </div>
  );
}