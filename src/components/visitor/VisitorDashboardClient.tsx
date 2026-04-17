"use client";

import { BuyerDashboardContent } from "@/components/visitor/BuyerDashboardContent";
import { useEffect, useState } from "react";

/** Оболочка демо: локальные заглушки до ответа API (пустые списки). */
export function VisitorDashboardClient() {
  const [stubItems] = useState<unknown[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    void stubItems;
  }, [stubItems]);

  if (!ready) {
    return <div className="py-8 text-center text-sm text-slate-500">Подготовка кабинета…</div>;
  }

  return <BuyerDashboardContent />;
}
