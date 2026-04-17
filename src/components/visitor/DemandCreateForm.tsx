"use client";

import { ProductCategory } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: ProductCategory.COFFEE, label: "Кофе" },
  { value: ProductCategory.TEA, label: "Чай" },
  { value: ProductCategory.EQUIPMENT, label: "Оборудование" },
  { value: ProductCategory.DISHES, label: "Посуда" }
];

export function DemandCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.COFFEE);
  const [quantity, setQuantity] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/visitor/requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          quantity,
          deadline,
          budget
        })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Не удалось создать заявку");
        return;
      }
      router.push("/visitor/requests");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="d-title" className="block text-sm font-medium text-slate-700">
          Название заявки
        </label>
        <input
          id="d-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="d-desc" className="block text-sm font-medium text-slate-700">
          Описание
        </label>
        <textarea
          id="d-desc"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="d-cat" className="block text-sm font-medium text-slate-700">
          Категория
        </label>
        <select
          id="d-cat"
          value={category}
          onChange={(event) => setCategory(event.target.value as ProductCategory)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="d-qty" className="block text-sm font-medium text-slate-700">
          Количество / объём
        </label>
        <input
          id="d-qty"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          placeholder="Например: 200 кг / нед."
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="d-deadline" className="block text-sm font-medium text-slate-700">
          Срок
        </label>
        <input
          id="d-deadline"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          placeholder="до 30.06.2026"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="d-budget" className="block text-sm font-medium text-slate-700">
          Бюджет
        </label>
        <input
          id="d-budget"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
          placeholder="до 500 000 ₽"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-2xl bg-[#F26522] py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Создание…" : "Создать заявку"}
        </button>
        <Link
          href="/visitor/dashboard"
          className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
