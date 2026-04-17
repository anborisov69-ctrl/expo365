"use client";

import type { ExhibitorInquiryApiRow } from "@/types/exhibitor-inquiry";
import { InquiryStatus, InquiryType } from "@prisma/client";
import { Mail, MessageCircle } from "lucide-react";

interface InquiryItemProps {
  row: ExhibitorInquiryApiRow;
}

function typeLabel(type: InquiryType): string {
  return type === InquiryType.CP ? "КП" : "Образец";
}

function statusLabel(status: InquiryStatus): "новый" | "обработан" {
  return status === InquiryStatus.PENDING ? "новый" : "обработан";
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

export function InquiryItem({ row }: InquiryItemProps) {
  async function handleContact() {
    const line = `${row.customerName}\n${row.customerEmail}\n${row.customerPhone}`;
    try {
      await navigator.clipboard.writeText(line);
      window.alert("Контакты скопированы в буфер обмена");
    } catch {
      window.location.href = `mailto:${encodeURIComponent(row.customerEmail)}?subject=${encodeURIComponent(
        `Запрос по новинке: ${row.productName}`
      )}`;
    }
  }

  const st = statusLabel(row.status);

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-bold text-neutral-900">{row.productName}</p>
        <p className="text-sm text-neutral-700">
          {row.customerName} ·{" "}
          <a href={`mailto:${row.customerEmail}`} className="text-expoBlue underline-offset-2 hover:underline">
            {row.customerEmail}
          </a>
        </p>
        <p className="text-xs text-neutral-500">{formatDate(row.createdAt)}</p>
        {row.message ? <p className="text-sm text-neutral-600">{row.message}</p> : null}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-800">
            {typeLabel(row.type)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              st === "новый" ? "bg-expoOrange/15 text-expoOrange" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {st}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
        <button
          type="button"
          onClick={() => void handleContact()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-expoBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-expoBlue/90"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          Связаться
        </button>
        <a
          href={`mailto:${encodeURIComponent(row.customerEmail)}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          Написать
        </a>
      </div>
    </li>
  );
}
