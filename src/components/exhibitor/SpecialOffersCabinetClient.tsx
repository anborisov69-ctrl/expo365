"use client";

import type { SpecialOffer } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

export function SpecialOffersCabinetClient() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exhibitor/special-offers", { credentials: "include" });
      if (!res.ok) {
        setError("Не удалось загрузить");
        return;
      }
      const j = (await res.json()) as { offers?: SpecialOffer[] };
      setOffers(j.offers ?? []);
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setIsActive(true);
  }

  function startEdit(o: SpecialOffer) {
    setEditingId(o.id);
    setTitle(o.title);
    setDescription(o.description);
    setPrice(o.price);
    setImageUrl(o.imageUrl ?? "");
    setIsActive(o.isActive);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/exhibitor/special-offers/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            price,
            imageUrl: imageUrl.trim() || null,
            isActive
          })
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          alert(j.error ?? "Ошибка сохранения");
          return;
        }
      } else {
        const res = await fetch("/api/exhibitor/special-offers", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            price,
            imageUrl: imageUrl.trim() || null,
            isActive
          })
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          alert(j.error ?? "Ошибка создания");
          return;
        }
      }
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить спецпредложение?")) return;
    const res = await fetch(`/api/exhibitor/special-offers/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) {
      alert("Не удалось удалить");
      return;
    }
    if (editingId === id) resetForm();
    await load();
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Загрузка…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-neutral-800 bg-[#262626] p-5">
        <h2 className="text-sm font-semibold text-neutral-100">
          {editingId ? "Редактирование" : "Новое спецпредложение"}
        </h2>
        <label className="block text-xs text-neutral-400">
          Название
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-neutral-100"
          />
        </label>
        <label className="block text-xs text-neutral-400">
          Описание
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-neutral-100"
          />
        </label>
        <label className="block text-xs text-neutral-400">
          Цена (текст)
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-neutral-100"
          />
        </label>
        <label className="block text-xs text-neutral-400">
          URL изображения (необязательно)
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-neutral-100"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-neutral-600"
          />
          Активно (видно партнёрам)
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0095F6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1877d2] disabled:opacity-50"
          >
            {saving ? "Сохранение…" : editingId ? "Сохранить" : "Создать"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Отмена
            </button>
          ) : null}
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-100">Список</h2>
        <ul className="space-y-3">
          {offers.length === 0 ? (
            <li className="text-sm text-neutral-500">Пока нет предложений</li>
          ) : (
            offers.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-[#262626] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-neutral-100">{o.title}</p>
                  <p className="text-xs text-neutral-500">
                    {o.isActive ? "Активно" : "Скрыто"} · {o.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(o)}
                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(o.id)}
                    className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
