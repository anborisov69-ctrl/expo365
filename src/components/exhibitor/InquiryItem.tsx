"use client";

import type { ExhibitorInquiryApiRow } from "@/types/exhibitor-inquiry";
import { InquiryStatus, InquiryType } from "@prisma/client";
import { CheckCircle2, Mail, MessageCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface InquiryItemProps {
  row: ExhibitorInquiryApiRow;
  onListRefresh: () => void | Promise<void>;
}

function typeLabel(type: InquiryType): string {
  if (type === InquiryType.CP) return "КП";
  if (type === InquiryType.SAMPLE) return "Образец";
  return "Услуга";
}

function statusLabel(status: InquiryStatus): string {
  switch (status) {
    case InquiryStatus.PENDING:
      return "Новая";
    case InquiryStatus.SENT:
      return "Отправлена";
    case InquiryStatus.IN_PROGRESS:
      return "В работе";
    case InquiryStatus.DONE:
      return "Завершена";
    case InquiryStatus.REJECTED:
      return "Отклонена";
    case InquiryStatus.CANCELLED:
      return "Отменена";
  }
}

function statusBadgeClass(status: InquiryStatus): string {
  switch (status) {
    case InquiryStatus.PENDING:
    case InquiryStatus.SENT:
      return "bg-expoOrange/15 text-expoOrange";
    case InquiryStatus.IN_PROGRESS:
      return "bg-sky-100 text-sky-900";
    case InquiryStatus.DONE:
      return "bg-emerald-100 text-emerald-800";
    case InquiryStatus.REJECTED:
    case InquiryStatus.CANCELLED:
      return "bg-red-100 text-red-800";
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function truncateMessage(text: string | null, max = 140): string {
  if (!text) return "—";
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function isTerminalStatus(status: InquiryStatus): boolean {
  return (
    status === InquiryStatus.DONE ||
    status === InquiryStatus.REJECTED ||
    status === InquiryStatus.CANCELLED
  );
}

export function InquiryItem({ row, onListRefresh }: InquiryItemProps) {
  const [busy, setBusy] = useState(false);

  async function handleContact() {
    const parts = [row.customerName, row.customerEmail, row.customerPhone].filter(Boolean);
    const line = parts.join("\n");
    try {
      await navigator.clipboard.writeText(line);
      window.alert("Контакты скопированы в буфер обмена");
    } catch {
      window.location.href = `mailto:${encodeURIComponent(row.customerEmail)}?subject=${encodeURIComponent(
        `Запрос по новинке: ${row.productName}`
      )}`;
    }
  }

  async function patchStatus(wireStatus: "in_progress" | "rejected" | "completed") {
    setBusy(true);
    try {
      const response = await fetch(`/api/inquiries/${row.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: wireStatus })
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error ?? "Не удалось обновить статус");
        return;
      }
      window.alert("Статус заявки обновлён");
      await onListRefresh();
    } catch {
      window.alert("Ошибка сети");
    } finally {
      setBusy(false);
    }
  }

  const terminal = isTerminalStatus(row.status);
  const showAccept = !terminal && row.status !== InquiryStatus.IN_PROGRESS;

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-bold text-neutral-900">{row.productName}</p>
        <p className="text-sm text-neutral-700">
          {row.customerName} ·{" "}
          <a href={`mailto:${row.customerEmail}`} className="text-expoBlue underline-offset-2 hover:underline">
            {row.customerEmail}
          </a>
          {row.customerPhone ? (
            <>
              {" "}
              · <span className="text-neutral-600">{row.customerPhone}</span>
            </>
          ) : null}
        </p>
        <p className="text-xs text-neutral-500">{formatDate(row.createdAt)}</p>
        <p className="text-sm text-neutral-600">{truncateMessage(row.message)}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-800">
            {typeLabel(row.type)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(row.status)}`}
          >
            {statusLabel(row.status)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:min-w-[200px]">
        {!terminal ? (
          <div className="flex flex-col gap-2">
            {showAccept ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void patchStatus("in_progress")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-expoBlue px-3 py-2 text-sm font-semibold text-white transition hover:bg-expoBlue/90 disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                Принять в работу
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void patchStatus("rejected")}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" strokeWidth={2} />
              Отклонить
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patchStatus("completed")}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
              Завершить
            </button>
          </div>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleContact()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          Связаться
        </button>
        <a
          href={`mailto:${encodeURIComponent(row.customerEmail)}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          Написать
        </a>
      </div>
    </li>
  );
}
