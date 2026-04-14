"use client";

import { useEffect, useState } from "react";

interface InquiryItem {
  id: string;
  status: string;
  createdAt: string;
  product: { title: string };
  company: { name: string };
}

export function BuyerRequestsHistory() {
  const [items, setItems] = useState<InquiryItem[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const response = await fetch("/api/inquiries");
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as InquiryItem[];
      setItems(data);
    }

    void loadHistory();
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="font-medium">{item.product.title}</p>
          <p className="text-sm text-slate-500">{item.company.name}</p>
          <p className="mt-2 text-xs text-slate-400">
            {new Date(item.createdAt).toLocaleDateString("ru-RU")} - {item.status}
          </p>
        </article>
      ))}
      {!items.length && <p className="text-sm text-slate-500">История запросов пока пуста.</p>}
    </div>
  );
}
