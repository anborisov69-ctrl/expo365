"use client";

import { DEFAULT_COMPANY_AVATAR_URL } from "@/lib/exhibitor-default-images";
import { EXHIBITOR_SETTINGS_EXPERTISE_OPTIONS } from "@/lib/exhibitor-settings-expertise";
import { companyApiToExhibitorProps, type CompanyPublicApi } from "@/lib/company-update-shared";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/lib/product-category-labels";
import type { ExhibitorProfileCompanyProps } from "@/types/exhibitor-profile";
import { ProductCategory } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const ALL_CATEGORIES = Object.keys(PRODUCT_CATEGORY_LABEL_RU) as ProductCategory[];

const EXHIBITOR_OPTION_VALUES = new Set(
  EXHIBITOR_SETTINGS_EXPERTISE_OPTIONS.map((o) => o.value)
);

function isValidEmail(value: string): boolean {
  const t = value.trim();
  if (t === "") return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

async function postUpload(file: File, companyId: string | null, isAdminContext: boolean): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (companyId) {
    formData.append("companyId", companyId);
  }
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  const data = (await response.json()) as { error?: string; url?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Не удалось загрузить файл");
  }
  if (!data.url) {
    throw new Error("Некорректный ответ сервера");
  }
  return data.url;
}

export type EditProfileFormProps = {
  companyId: string;
  initial: ExhibitorProfileCompanyProps;
  variant?: "page" | "modal";
  /** Админ редактирует чужую компанию — сохранение в PUT /api/companies/[id] */
  isAdmin?: boolean;
  /** Список категорий в форме: короткий набор для кабинета или все значения Prisma */
  categoryMode?: "exhibitor" | "all";
  onSaved: (company: ExhibitorProfileCompanyProps) => void;
  onCancel?: () => void;
};

export function EditProfileForm({
  companyId,
  initial,
  variant = "page",
  isAdmin = false,
  categoryMode = isAdmin ? "all" : "exhibitor",
  onSaved,
  onCancel
}: EditProfileFormProps) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [website, setWebsite] = useState(initial.contacts.website ?? initial.website ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [phone, setPhone] = useState(initial.contacts.phone ?? "");
  const [email, setEmail] = useState(initial.contacts.email ?? "");
  const [address, setAddress] = useState(initial.contacts.address ?? "");
  const [categories, setCategories] = useState<ProductCategory[]>(initial.expertiseCategories);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isModal = variant === "modal";
  const isPage = variant === "page";

  const fieldClass = isModal
    ? "mt-1 w-full rounded-lg border border-neutral-700 bg-[#262626] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-[#0095F6] focus:outline-none focus:ring-2 focus:ring-[#0095F6]/30"
    : "mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20";
  const labelClass = isModal ? "text-sm font-medium text-neutral-300" : "text-sm font-medium text-neutral-700";

  const expertisePrimary = useMemo(
    () => (categoryMode === "exhibitor" ? EXHIBITOR_SETTINGS_EXPERTISE_OPTIONS : null),
    [categoryMode]
  );

  const extraExpertiseCategories = useMemo(() => {
    if (categoryMode !== "exhibitor") {
      return [];
    }
    return categories.filter((c) => !EXHIBITOR_OPTION_VALUES.has(c));
  }, [categories, categoryMode]);

  function toggleCategory(cat: ProductCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !file.type.startsWith("image/")) {
        setMessage("Выберите изображение (JPEG, PNG, …)");
        return;
      }
      setUploading(true);
      setMessage(null);
      try {
        const url = await postUpload(file, companyId, isAdmin);
        setLogoUrl(url);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setUploading(false);
      }
    },
    [companyId, isAdmin]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nameTrim = name.trim();
    if (!nameTrim) {
      setMessage("Укажите название компании");
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("Некорректный формат email в контактах");
      return;
    }

    setPending(true);
    setMessage(null);
    try {
      const site = website.trim() === "" ? null : website.trim();
      const body = {
        name: nameTrim,
        description: description.trim() === "" ? null : description.trim(),
        logoUrl: logoUrl.trim() === "" ? null : logoUrl.trim(),
        website: site,
        contacts: {
          phone: phone.trim() === "" ? null : phone.trim(),
          email: email.trim() === "" ? null : email.trim(),
          address: address.trim() === "" ? null : address.trim(),
          website: site
        },
        expertiseCategories: categories
      };

      const saveUrl = isAdmin ? `/api/companies/${companyId}` : "/api/exhibitor/company";
      const response = await fetch(saveUrl, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = (await response.json()) as { error?: string; company?: CompanyPublicApi };
      if (!response.ok) {
        setMessage(data.error ?? "Не удалось сохранить");
        return;
      }
      if (data.company) {
        const props = companyApiToExhibitorProps(data.company);
        if (isPage && !isAdmin) {
          window.alert("Изменения сохранены");
        }
        onSaved(props);
      }
    } catch {
      setMessage("Ошибка сети");
    } finally {
      setPending(false);
    }
  }

  const messageIsError =
    message &&
    !message.toLowerCase().includes("сохран") &&
    !message.toLowerCase().includes("успеш");

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div>
        <label htmlFor="ep-name" className={labelClass}>
          Название компании <span className="text-red-500">*</span>
        </label>
        <input
          id="ep-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="ep-desc" className={labelClass}>
          Описание компании
        </label>
        <textarea
          id="ep-desc"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Расскажите о компании для витрины и ленты"
          className={fieldClass}
        />
      </div>
      <div>
        <span className={labelClass}>Логотип</span>
        <div
          className={`mt-3 flex flex-wrap items-center gap-4 rounded-xl border p-4 ${
            isModal ? "border-neutral-700 bg-[#1a1a1a]" : "border-neutral-100 bg-neutral-50/80"
          }`}
        >
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ${
              isModal ? "border-neutral-600 bg-neutral-800" : "border-white bg-white shadow-sm"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl || DEFAULT_COMPANY_AVATAR_URL}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <label className="inline-block cursor-pointer">
              <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={uploading} />
              <span
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isModal
                    ? "bg-[#0095F6] text-white hover:bg-[#1877d2]"
                    : "bg-expoBlue text-white shadow-sm hover:bg-expoBlue/90"
                }`}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {uploading ? "Загрузка…" : "Загрузить новое изображение"}
              </span>
            </label>
            {isPage ? (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-expoBlue hover:underline">
                  Указать логотип по ссылке
                </summary>
                <input
                  id="ep-logo-url"
                  type="url"
                  value={logoUrl}
                  onChange={(event) => setLogoUrl(event.target.value)}
                  placeholder="https://…"
                  className={`${fieldClass} mt-2`}
                />
              </details>
            ) : (
              <>
                <p className={`text-xs ${isModal ? "text-neutral-500" : "text-neutral-500"}`}>Или URL:</p>
                <input
                  id="ep-logo-url"
                  type="url"
                  value={logoUrl}
                  onChange={(event) => setLogoUrl(event.target.value)}
                  placeholder={DEFAULT_COMPANY_AVATAR_URL}
                  className={fieldClass}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5">
        <h3 className={`mb-3 text-sm font-semibold ${isModal ? "text-neutral-200" : "text-neutral-900"}`}>
          Контакты
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ep-phone" className={labelClass}>
              Телефон
            </label>
            <input
              id="ep-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="ep-email" className={labelClass}>
              Email
            </label>
            <input
              id="ep-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="ep-address" className={labelClass}>
            Адрес
          </label>
          <input
            id="ep-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="ep-site" className={labelClass}>
            Сайт
          </label>
          <input
            id="ep-site"
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://"
            className={fieldClass}
          />
        </div>
      </div>

      <fieldset className="rounded-xl border border-neutral-100 bg-white p-4 sm:p-5">
        <legend className={`px-1 text-sm font-semibold ${isModal ? "text-neutral-200" : "text-neutral-900"}`}>
          Категории, с которыми работает компания
        </legend>
        <div
          className={`mt-3 grid gap-2 sm:grid-cols-2 ${
            categoryMode === "all" ? "sm:grid-cols-2 lg:grid-cols-3" : ""
          }`}
        >
          {(categoryMode === "exhibitor" ? expertisePrimary! : ALL_CATEGORIES.map((value) => ({ value, label: PRODUCT_CATEGORY_LABEL_RU[value] }))).map(
            ({ value: cat, label }) => (
              <label
                key={cat}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  categories.includes(cat)
                    ? isModal
                      ? "border-[#0095F6] bg-[#0095F6]/15 text-[#47a7ff]"
                      : "border-expoBlue/40 bg-expoBlue/5 text-expoBlue"
                    : isModal
                      ? "border-neutral-600 bg-[#262626] text-neutral-200 hover:border-neutral-500"
                      : "border-neutral-200 bg-neutral-50/80 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-expoBlue focus:ring-expoBlue"
                  checked={categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {label}
              </label>
            )
          )}
        </div>
        {extraExpertiseCategories.length > 0 ? (
          <p className="mt-3 text-xs text-neutral-500">
            Дополнительно выбраны категории:{" "}
            {extraExpertiseCategories.map((c) => PRODUCT_CATEGORY_LABEL_RU[c]).join(", ")} — снимите и заново
            отметьте при необходимости.
          </p>
        ) : null}
      </fieldset>

      {message ? (
        <p
          className={`rounded-lg px-1 text-sm ${
            messageIsError ? (isModal ? "text-red-300" : "text-red-600") : isModal ? "text-emerald-400" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className={
            isModal
              ? "rounded-lg bg-[#0095F6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1877d2] disabled:opacity-60"
              : "rounded-xl bg-expoBlue px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-expoBlue/90 disabled:opacity-60"
          }
        >
          {pending ? "Сохранение…" : "Сохранить изменения"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className={
              isModal
                ? "rounded-lg border border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-800"
                : "rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
            }
          >
            Отмена
          </button>
        ) : null}
      </div>
    </form>
  );
}
