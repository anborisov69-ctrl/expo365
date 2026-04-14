"use client";

import { useState } from "react";

interface CompanyStandTabsProps {
  company: {
    name: string;
    description: string | null;
    contacts: string | null;
  };
  products: Array<{ id: string; title: string; category: string; price: string }>;
}

export function CompanyStandTabs({ company, products }: CompanyStandTabsProps) {
  const [activeTab, setActiveTab] = useState<"about" | "products" | "contacts">("about");

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex gap-3">
        <button onClick={() => setActiveTab("about")} className="rounded border px-3 py-2">
          О компании
        </button>
        <button onClick={() => setActiveTab("products")} className="rounded border px-3 py-2">
          Новинки
        </button>
        <button onClick={() => setActiveTab("contacts")} className="rounded border px-3 py-2">
          Контакты
        </button>
      </div>
      {activeTab === "about" && <p className="text-slate-700">{company.description ?? "Описание пока не добавлено."}</p>}
      {activeTab === "products" && (
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.id} className="rounded border p-3">
              <p className="font-medium">{product.title}</p>
              <p className="text-sm text-slate-500">
                {product.category} - {product.price} ₽
              </p>
            </li>
          ))}
        </ul>
      )}
      {activeTab === "contacts" && <p>{company.contacts ?? "Контакты пока не добавлены."}</p>}
    </section>
  );
}
