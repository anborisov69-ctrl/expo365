"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload } from "lucide-react";
import { mockCompanyName } from "@/lib/exhibitor-mocks";
import { exhibitorH1, exhibitorMuted, exhibitorPageWrap } from "@/components/exhibitor/exhibitor-ui";

export function ExhibitorStandForm() {
  const [companyName, setCompanyName] = useState(mockCompanyName);
  const [description, setDescription] = useState(
    "Поставщик кофе и оборудования для ресторанов и отелей. Демо-текст для редактирования профиля."
  );
  const [phone, setPhone] = useState("+7 (495) 000-00-00");
  const [email, setEmail] = useState("demo@coffeeplus.example");
  const [address, setAddress] = useState("Москва, демо-адрес");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    window.alert("Сохранено (демо)");
  }

  return (
    <div className="min-h-screen bg-exhibitorBg">
      <form onSubmit={handleSave} className={`${exhibitorPageWrap} mx-auto max-w-2xl space-y-6 pb-8`}>
        <div>
          <h1 className={exhibitorH1}>Управление стендом</h1>
          <p className={`${exhibitorMuted} mt-1`}>Поля ниже готовы к привязке к API сохранения профиля.</p>
        </div>

        <div
          className="rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover"
        >
          <span className="block text-sm font-semibold text-slate-700">Логотип</span>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[12px] border border-slate-200 bg-slate-50">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Превью логотипа"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400">Нет файла</span>
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-[8px] border border-dashed border-expoOrange/40 bg-white px-4 py-2.5 text-sm font-semibold text-expoOrange shadow-sm transition hover:bg-expoOrange/5">
              <Upload className="h-4 w-4" strokeWidth={2} />
              Выбрать файл
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
        </div>

        <div
          className="rounded-[12px] border border-slate-100/80 bg-white p-6 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover"
        >
          <div>
            <label htmlFor="co-name" className="block text-sm font-semibold text-slate-700">
              Название компании
            </label>
            <input
              id="co-name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 focus:border-expoBlue/40 focus:outline-none focus:ring-2 focus:ring-expoBlue/15"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="co-desc" className="block text-sm font-semibold text-slate-700">
              Описание
            </label>
            <textarea
              id="co-desc"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 focus:border-expoBlue/40 focus:outline-none focus:ring-2 focus:ring-expoBlue/15"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="co-phone" className="block text-sm font-semibold text-slate-700">
                Телефон
              </label>
              <input
                id="co-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5"
              />
            </div>
            <div>
              <label htmlFor="co-email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="co-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="co-addr" className="block text-sm font-semibold text-slate-700">
              Адрес
            </label>
            <input
              id="co-addr"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-[8px] bg-expoOrange py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 sm:w-auto sm:px-8"
        >
          Сохранить изменения
        </button>
      </form>
    </div>
  );
}
