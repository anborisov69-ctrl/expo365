"use client";

import { useState } from "react";

interface ProductActionsProps {
  productId: string;
  sampleAvailable: boolean;
}

export function ProductActions({ productId, sampleAvailable }: ProductActionsProps) {
  const [message, setMessage] = useState("");

  async function requestInquiry() {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, message: "Интересует коммерческое предложение" })
    });

    setMessage(response.ok ? "Запрос КП отправлен" : "Не удалось отправить запрос КП");
  }

  async function requestSample() {
    const response = await fetch("/api/sample-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    setMessage(response.ok ? "Запрос образца отправлен" : "Не удалось отправить запрос образца");
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button onClick={requestInquiry} className="rounded bg-expoOrange px-4 py-2 text-white">
        Запросить КП
      </button>
      <button
        onClick={requestSample}
        disabled={!sampleAvailable}
        className="rounded border border-expoBlue px-4 py-2 text-expoBlue disabled:opacity-50"
      >
        Запросить образцы
      </button>
      {message && <p className="w-full text-sm text-slate-600">{message}</p>}
    </div>
  );
}
