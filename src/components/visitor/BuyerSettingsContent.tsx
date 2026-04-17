"use client";

import { useCallback, useEffect, useState } from "react";

export function BuyerSettingsContent() {
  const [name, setName] = useState("");
  const [visitorCompany, setVisitorCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/visitor/profile", { credentials: "include" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as {
        profile?: { name?: string; email?: string; visitorCompany?: string | null; phone?: string | null };
      };
      const p = data.profile;
      if (p) {
        setName(p.name ?? "");
        setEmail(p.email ?? "");
        setVisitorCompany(p.visitorCompany ?? "");
        setPhone(p.phone ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/visitor/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, visitorCompany, phone })
      });
      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        setMessage(err.error ?? "Ошибка сохранения");
        return;
      }
      setMessage("Изменения сохранены");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-slate-400">Загрузка…</p>;
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Настройки профиля</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="set-name" className="block text-sm font-medium text-slate-700">
            Имя
          </label>
          <input
            id="set-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="set-company" className="block text-sm font-medium text-slate-700">
            Название компании (необязательно)
          </label>
          <input
            id="set-company"
            value={visitorCompany}
            onChange={(event) => setVisitorCompany(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="set-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="set-email"
            value={email}
            readOnly
            disabled
            className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-slate-500"
          />
          <p className="mt-1 text-xs text-slate-400">Смена email — позже</p>
        </div>
        <div>
          <label htmlFor="set-phone" className="block text-sm font-medium text-slate-700">
            Телефон
          </label>
          <input
            id="set-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none ring-[#F26522]/20 focus:border-[#F26522] focus:ring-2"
          />
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-[#F26522] py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
        >
          {saving ? "Сохранение…" : "Сохранить изменения"}
        </button>
      </form>
    </div>
  );
}
