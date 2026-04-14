"use client";

import { FormEvent, useState } from "react";

export function StandManager() {
  const [companyPayload, setCompanyPayload] = useState({
    logoUrl: "",
    description: "",
    contacts: ""
  });
  const [productPayload, setProductPayload] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    price: "",
    sampleAvailable: false
  });
  const [statusMessage, setStatusMessage] = useState("");

  async function updateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/companies/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyPayload)
    });
    setStatusMessage(response.ok ? "Стенд обновлён" : "Ошибка обновления стенда");
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productPayload,
        price: Number(productPayload.price)
      })
    });
    setStatusMessage(response.ok ? "Новинка добавлена" : "Ошибка добавления новинки");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={updateCompany} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-expoBlue">Виртуальный стенд</h2>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Ссылка на логотип"
          value={companyPayload.logoUrl}
          onChange={(event) => setCompanyPayload((previous) => ({ ...previous, logoUrl: event.target.value }))}
        />
        <textarea
          className="w-full rounded border px-3 py-2"
          placeholder="Описание компании"
          value={companyPayload.description}
          onChange={(event) => setCompanyPayload((previous) => ({ ...previous, description: event.target.value }))}
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Контакты"
          value={companyPayload.contacts}
          onChange={(event) => setCompanyPayload((previous) => ({ ...previous, contacts: event.target.value }))}
          required
        />
        <button className="rounded bg-expoOrange px-4 py-2 text-white">Сохранить стенд</button>
      </form>

      <form onSubmit={createProduct} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-expoBlue">Добавить новинку</h2>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Название"
          value={productPayload.title}
          onChange={(event) => setProductPayload((previous) => ({ ...previous, title: event.target.value }))}
          required
        />
        <textarea
          className="w-full rounded border px-3 py-2"
          placeholder="Описание"
          value={productPayload.description}
          onChange={(event) => setProductPayload((previous) => ({ ...previous, description: event.target.value }))}
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Категория"
          value={productPayload.category}
          onChange={(event) => setProductPayload((previous) => ({ ...previous, category: event.target.value }))}
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Цена"
          value={productPayload.price}
          onChange={(event) => setProductPayload((previous) => ({ ...previous, price: event.target.value }))}
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={productPayload.sampleAvailable}
            onChange={(event) =>
              setProductPayload((previous) => ({ ...previous, sampleAvailable: event.target.checked }))
            }
          />
          Доступен образец
        </label>
        <button className="rounded bg-expoOrange px-4 py-2 text-white">Добавить новинку</button>
      </form>
      {statusMessage && <p className="lg:col-span-2 text-sm text-slate-600">{statusMessage}</p>}
    </div>
  );
}
