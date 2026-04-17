"use client";

import { ExhibitorDashboardInstagram } from "@/components/exhibitor/ExhibitorDashboardInstagram";
import { useEffect, useState } from "react";

/** Оболочка демо: пустые массивы-заглушки до данных с API. */
export function ExhibitorDashboardClient() {
  const [stubRows] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    void stubRows;
  }, [stubRows]);

  if (!ready) {
    return <div className="py-8 text-center text-sm text-slate-500">Подготовка кабинета…</div>;
  }

  return <ExhibitorDashboardInstagram />;
}
