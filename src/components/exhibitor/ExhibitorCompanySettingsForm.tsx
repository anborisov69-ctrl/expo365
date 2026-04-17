"use client";

import { DEFAULT_COMPANY_AVATAR_URL } from "@/lib/exhibitor-default-images";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/lib/product-category-labels";
import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import { ProductCategory } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ALL_CATEGORIES = Object.keys(PRODUCT_CATEGORY_LABEL_RU) as ProductCategory[];

export function ExhibitorCompanySettingsForm({
  initialCompany
}: {
  initialCompany: ExhibitorProfileCompanyProps;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialCompany.name);
  const [description, setDescription] = useState(initialCompany.description ?? "");
  const [website, setWebsite] = useState(initialCompany.website ?? "");
  const [logoUrl, setLogoUrl] = useState(initialCompany.logoUrl ?? "");
  const [categories, setCategories] = useState<ProductCategory[]>(initialCompany.expertiseCategories);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggleCategory(cat: ProductCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/exhibitor/company", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description.trim() === "" ? null : description.trim(),
          website: website.trim() === "" ? null : website.trim(),
          logoUrl: logoUrl.trim() === "" ? null : logoUrl.trim(),
          expertiseCategories: categories
        })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Не удалось сохранить");
        return;
      }
      setMessage("Сохранено");
      router.refresh();
    } catch {
      setMessage("Ошибка сети");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Редактирование профиля</h1>
        <Link
          href="/exhibitor/dashboard"
          className="text-sm font-semibold text-expoBlue hover:underline"
        >
          ← В профиль
        </Link>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div>
          <label htmlFor="c-name" className="block text-sm font-medium text-neutral-700">
            Название компании
          </label>
          <input
            id="c-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
          />
        </div>
        <div>
          <label htmlFor="c-desc" className="block text-sm font-medium text-neutral-700">
            Краткое описание
          </label>
          <textarea
            id="c-desc"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
          />
        </div>
        <div>
          <label htmlFor="c-web" className="block text-sm font-medium text-neutral-700">
            Сайт
          </label>
          <input
            id="c-web"
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
          />
        </div>
        <div>
          <label htmlFor="c-logo" className="block text-sm font-medium text-neutral-700">
            URL логотипа (заглушка)
          </label>
          <input
            id="c-logo"
            type="url"
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            placeholder={DEFAULT_COMPANY_AVATAR_URL}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
          />
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-neutral-700">Категории экспертизы (хештеги в профиле)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <label
                key={cat}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  categories.includes(cat)
                    ? "border-expoBlue bg-expoBlue/10 text-expoBlue"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {PRODUCT_CATEGORY_LABEL_RU[cat]}
              </label>
            ))}
          </div>
        </fieldset>

        {message ? (
          <p className={`text-sm ${message === "Сохранено" ? "text-green-700" : "text-red-600"}`}>{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-expoBlue py-3 text-sm font-semibold text-white transition hover:bg-expoBlue/90 disabled:opacity-60"
        >
          {pending ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
