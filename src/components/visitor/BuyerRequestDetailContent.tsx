"use client";

import { productCategoryLabelRu } from "@/lib/product-category-labels";
import type { ProductCategory } from "@prisma/client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface BidRow {
  id: string;
  companyName: string;
  proposal: string;
  price: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

interface RequestDetail {
  id: string;
  title: string;
  description: string | null;
  category: ProductCategory;
  quantity: string | null;
  deadline: string | null;
  budget: string | null;
  status: string;
  createdAt: string;
  canClose: boolean;
}

export function BuyerRequestDetailContent({ id }: { id: string }) {
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [bids, setBids] = useState<BidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/visitor/requests/${id}`, { credentials: "include" });
      if (!response.ok) {
        setRequest(null);
        return;
      }
      const data = (await response.json()) as {
        request?: RequestDetail;
        bids?: BidRow[];
      };
      setRequest(data.request ?? null);
      setBids(data.bids ?? []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleClose() {
    if (!window.confirm("Закрыть заявку?")) {
      return;
    }
    setClosing(true);
    try {
      const response = await fetch(`/api/visitor/requests/${id}/close`, {
        method: "PUT",
        credentials: "include"
      });
      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        window.alert(err.error ?? "Ошибка");
        return;
      }
      await load();
    } finally {
      setClosing(false);
    }
  }

  function contactAlert(email: string, phone: string) {
    window.alert(`Контакты экспонента\nEmail: ${email}\nТелефон: ${phone}`);
  }

  if (loading) {
    return <p className="text-center text-slate-400">Загрузка…</p>;
  }

  if (!request) {
    return (
      <p className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-slate-600">
        Заявка не найдена
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/visitor/requests" className="text-sm font-medium text-[#F26522] hover:underline">
          ← Все заявки
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">{request.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {new Date(request.createdAt).toLocaleString("ru-RU")} · Статус: {request.status}
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <DetailRow label="Категория" value={productCategoryLabelRu[request.category]} />
        <DetailRow label="Количество" value={request.quantity ?? "—"} />
        <DetailRow label="Срок" value={request.deadline ?? "—"} />
        <DetailRow label="Бюджет" value={request.budget ?? "—"} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Описание</p>
          <p className="mt-1 text-slate-700">{request.description ?? "—"}</p>
        </div>
      </div>

      {request.canClose ? (
        <button
          type="button"
          onClick={handleClose}
          disabled={closing}
          className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {closing ? "Закрытие…" : "Закрыть заявку"}
        </button>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Отклики экспонентов</h2>
        {bids.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
            Пока нет откликов
          </p>
        ) : (
          <ul className="space-y-4">
            {bids.map((bid) => (
              <li
                key={bid.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <p className="font-semibold text-slate-900">{bid.companyName}</p>
                <p className="mt-2 text-sm text-slate-700">{bid.proposal}</p>
                <p className="mt-3 text-lg font-bold text-[#F26522]">{bid.price}</p>
                <p className="mt-2 text-sm text-slate-600">{bid.contactEmail}</p>
                <p className="text-sm text-slate-600">{bid.contactPhone}</p>
                <button
                  type="button"
                  onClick={() => contactAlert(bid.contactEmail, bid.contactPhone)}
                  className="mt-4 rounded-2xl bg-[#F26522] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Связаться
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
