"use client";

import { SiteHeaderLogo } from "@/components/layout/SiteHeaderLogo";
import { productCategoryLabelRu } from "@/lib/product-category-labels";
import type { ProductCategory } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

const ACCENT = "#F26522";

interface DemandPayload {
  id: string;
  title: string;
  description: string | null;
  category: ProductCategory;
  quantity: string | null;
  deadline: string | null;
  budget: string | null;
  status: string;
  createdAt: string;
  visitorName: string;
  visitorEmail?: string;
}

interface BidPayload {
  id: string;
  companyName: string;
  proposal: string;
  price: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

interface MetaPayload {
  isOwnRequest: boolean;
  canBid: boolean;
  bidBlockedReason: string | null;
  existingBid: {
    id: string;
    proposal: string;
    price: string;
    contactEmail: string;
    contactPhone: string;
    createdAt: string;
  } | null;
  viewerRole: "VISITOR" | "EXHIBITOR";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: string): string {
  if (status === "active") {
    return "Активна";
  }
  if (status === "closed") {
    return "Закрыта";
  }
  return "Истекла";
}

type Role = "VISITOR" | "EXHIBITOR";

export function DemandFeedDetailContent({ id, role }: { id: string; role: Role }) {
  const router = useRouter();
  const [demand, setDemand] = useState<DemandPayload | null>(null);
  const [bids, setBids] = useState<BidPayload[]>([]);
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [proposal, setProposal] = useState("");
  const [price, setPrice] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/demand-feed/${id}`, { credentials: "include" });
      const data = (await response.json()) as {
        demand?: DemandPayload;
        bids?: BidPayload[];
        meta?: MetaPayload;
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Ошибка");
        setDemand(null);
        setMeta(null);
        return;
      }
      setDemand(data.demand ?? null);
      setBids(data.bids ?? []);
      setMeta(data.meta ?? null);
    } catch {
      setError("Сеть недоступна");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleBidSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/demand-feed/${id}/bid`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal, price, contactEmail, contactPhone })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSubmitError(data.error ?? "Не удалось отправить");
        return;
      }
      setProposal("");
      setPrice("");
      router.refresh();
      void load();
    } catch {
      setSubmitError("Сеть недоступна");
    } finally {
      setSubmitting(false);
    }
  }

  const cabinetHref = role === "EXHIBITOR" ? "/exhibitor/dashboard" : "/visitor/dashboard";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-400">Загрузка…</div>
    );
  }

  if (error || !demand) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-red-600">{error ?? "Не найдено"}</p>
        <Link href="/demand-feed" className="mt-4 inline-block font-medium" style={{ color: ACCENT }}>
          ← К ленте спроса
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <SiteHeaderLogo href="/" variant="compact" className="shrink-0" />
            <Link href="/demand-feed" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Лента спроса
            </Link>
          </div>
          <Link
            href={cabinetHref}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Кабинет
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
          {productCategoryLabelRu[demand.category]}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{demand.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">{statusLabel(demand.status)}</span>
          <span>{formatDate(demand.createdAt)}</span>
        </div>

        {demand.description ? (
          <p className="mt-6 whitespace-pre-wrap text-slate-700">{demand.description}</p>
        ) : null}

        <dl className="mt-6 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-sm">
          {demand.quantity ? (
            <div>
              <dt className="text-slate-400">Количество / объём</dt>
              <dd className="font-medium text-slate-900">{demand.quantity}</dd>
            </div>
          ) : null}
          {demand.deadline ? (
            <div>
              <dt className="text-slate-400">Срок</dt>
              <dd className="font-medium text-slate-900">{demand.deadline}</dd>
            </div>
          ) : null}
          {demand.budget ? (
            <div>
              <dt className="text-slate-400">Бюджет</dt>
              <dd className="font-medium text-slate-900">{demand.budget}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-slate-400">Посетитель</dt>
            <dd className="font-medium text-slate-900">{demand.visitorName}</dd>
          </div>
          {demand.visitorEmail ? (
            <div>
              <dt className="text-slate-400">Email (виден автору заявки)</dt>
              <dd className="font-medium text-slate-900">{demand.visitorEmail}</dd>
            </div>
          ) : null}
        </dl>

        {meta?.viewerRole === "EXHIBITOR" && !meta.isOwnRequest && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Отклик экспонента</h2>
            {meta.existingBid ? (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-sm">
                <p className="font-medium text-emerald-900">Ваш отклик отправлен {formatDate(meta.existingBid.createdAt)}</p>
                <p className="mt-2 text-slate-700">{meta.existingBid.proposal}</p>
                <p className="mt-2 font-semibold text-slate-900">{meta.existingBid.price}</p>
                <p className="mt-1 text-slate-600">
                  {meta.existingBid.contactEmail} · {meta.existingBid.contactPhone}
                </p>
              </div>
            ) : meta.canBid ? (
              <form onSubmit={handleBidSubmit} className="mt-4 space-y-4 rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div>
                  <label htmlFor="bid-prop" className="block text-sm font-medium text-slate-700">
                    Предложение
                  </label>
                  <textarea
                    id="bid-prop"
                    required
                    rows={4}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20"
                  />
                </div>
                <div>
                  <label htmlFor="bid-price" className="block text-sm font-medium text-slate-700">
                    Цена / условия
                  </label>
                  <input
                    id="bid-price"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bid-email" className="block text-sm font-medium text-slate-700">
                      Контактный email
                    </label>
                    <input
                      id="bid-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="bid-phone" className="block text-sm font-medium text-slate-700">
                      Телефон
                    </label>
                    <input
                      id="bid-phone"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20"
                    />
                  </div>
                </div>
                {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                  style={{ backgroundColor: ACCENT }}
                >
                  {submitting ? "Отправка…" : "Отправить отклик"}
                </button>
              </form>
            ) : (
              <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
                {meta.bidBlockedReason ?? "Отклик недоступен"}
              </p>
            )}
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Отклики экспонентов ({bids.length})
          </h2>
          {bids.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Пока нет откликов.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {bids.map((b) => (
                <li key={b.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="font-semibold text-slate-900">{b.companyName}</p>
                  <p className="mt-2 text-sm text-slate-700">{b.proposal}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{b.price}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {b.contactEmail} · {b.contactPhone}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(b.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {meta?.isOwnRequest ? (
          <div className="mt-10">
            <Link
              href={`/visitor/requests/${id}`}
              className="inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Открыть в кабинете посетителя
            </Link>
          </div>
        ) : null}
      </article>
    </div>
  );
}
