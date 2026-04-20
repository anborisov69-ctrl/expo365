"use client";

import {
  getVisitorProductActionKind,
  VISITOR_ACTION_STUB_ALERT
} from "@/lib/product-visitor-actions";
import type { ProductApiRow } from "@/types/product-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STUB = () => alert(VISITOR_ACTION_STUB_ALERT);

type ProductActionProduct = Pick<ProductApiRow, "id" | "name" | "category" | "isSampleAvailable"> & {
  companyId: string;
};

type Variant = "feed" | "dark";

export function VisitorProductActionButtons({
  product,
  variant = "feed",
  className = ""
}: {
  product: ProductActionProduct;
  variant?: Variant;
  /** Дополнительные классы для контейнера кнопок */
  className?: string;
}) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!cancelled) setAuthenticated(res.ok);
      } catch {
        if (!cancelled) setAuthenticated(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitInquiry = useCallback(
    async (type: "CP" | "SAMPLE", message: string) => {
      try {
        const res = await fetch("/api/visitor/inquiries", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: product.companyId,
            productId: type === "SAMPLE" ? product.id : null,
            type,
            message
          })
        });
        if (res.status === 401) {
          alert("Войдите в аккаунт, чтобы отправить запрос");
          return;
        }
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          alert(j.error ?? "Не удалось отправить");
          return;
        }
        alert(type === "CP" ? "Запрос КП отправлен" : "Запрос образца отправлен");
      } catch {
        alert("Ошибка сети");
      }
    },
    [product.companyId, product.id]
  );

  const kind = getVisitorProductActionKind(product.category);

  const btnFeedPrimary =
    "w-full rounded-xl bg-expoOrange py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95";
  const btnFeedSecondary =
    "w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-expoBlue shadow-sm transition hover:bg-slate-50";
  const btnDarkPrimary =
    "w-full rounded-lg bg-sky-600 py-2 text-xs font-medium text-white hover:bg-sky-500 sm:text-sm";
  const btnDarkSecondary =
    "w-full rounded-lg bg-zinc-800 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-700 sm:text-sm";
  const btnDarkOutline =
    "w-full rounded-lg border border-zinc-700 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 sm:text-sm";

  const p = variant === "feed";
  const bp = (primary: string, dark: string) => (p ? primary : dark);

  if (kind === "consumables") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {product.isSampleAvailable ? (
          <button
            type="button"
            className={bp(btnFeedPrimary, btnDarkPrimary)}
            onClick={() => {
              if (!authenticated) {
                alert("Войдите в аккаунт, чтобы запросить образец");
                return;
              }
              void submitInquiry("SAMPLE", `Образец: ${product.name}`);
            }}
          >
            Запросить образец
          </button>
        ) : null}
        <button
          type="button"
          className={bp(btnFeedSecondary, btnDarkSecondary)}
          onClick={() => {
            if (!authenticated) {
              alert("Войдите в аккаунт, чтобы запросить коммерческое предложение");
              return;
            }
            void submitInquiry("CP", `Запрос КП по товару: ${product.name}`);
          }}
        >
          Запросить КП
        </button>
        {!authenticated ? (
          <p className={p ? "text-center text-xs text-slate-500" : "text-center text-xs text-zinc-500"}>
            <Link
              href="/login"
              className={`font-medium underline-offset-2 hover:underline ${p ? "text-expoBlue" : "text-sky-400"}`}
            >
              Войти
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  if (kind === "equipment") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <button type="button" className={bp(btnFeedPrimary, btnDarkPrimary)} onClick={STUB}>
          Запросить тест-драйв
        </button>
        <button type="button" className={bp(btnFeedSecondary, btnDarkSecondary)} onClick={STUB}>
          Запросить видеопрезентацию
        </button>
        <button type="button" className={bp(btnFeedSecondary, btnDarkOutline)} onClick={STUB}>
          Получить финансовую поддержку
        </button>
        <button
          type="button"
          className={bp(btnFeedSecondary, btnDarkSecondary)}
          onClick={() => {
            if (!authenticated) {
              alert("Войдите в аккаунт, чтобы запросить коммерческое предложение");
              return;
            }
            void submitInquiry("CP", `Запрос КП (оборудование): ${product.name}`);
          }}
        >
          Запросить КП
        </button>
        {!authenticated ? (
          <p className={p ? "text-center text-xs text-slate-500" : "text-center text-xs text-zinc-500"}>
            <Link
              href="/login"
              className={`font-medium underline-offset-2 hover:underline ${p ? "text-expoBlue" : "text-sky-400"}`}
            >
              Войти
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  /* training — категория SERVICE */
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button type="button" className={bp(btnFeedPrimary, btnDarkPrimary)} onClick={STUB}>
        Запросить программу обучения
      </button>
      <button type="button" className={bp(btnFeedSecondary, btnDarkSecondary)} onClick={STUB}>
        Связаться
      </button>
    </div>
  );
}
