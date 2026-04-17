"use client";

import { ProductMediaHero } from "@/components/product/ProductMediaHero";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/lib/product-category-labels";
import type { ProductApiRowWithStats } from "@/types/product-api";
import { X } from "lucide-react";

interface ProductDetailModalProps {
  open: boolean;
  product: ProductApiRowWithStats | null;
  onClose: () => void;
  onEdit: (product: ProductApiRowWithStats) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailModal({
  open,
  product,
  onClose,
  onEdit,
  onDelete
}: ProductDetailModalProps) {
  if (!open || !product) {
    return null;
  }

  function handleDelete() {
    if (!window.confirm("Удалить эту новинку?")) {
      return;
    }
    const current = product;
    if (!current) {
      return;
    }
    onDelete(current.id);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label="Закрыть" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl">
        <div className="relative aspect-[4/3] w-full bg-neutral-100">
          <ProductMediaHero
            product={product}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-neutral-700 shadow-md transition hover:bg-white"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{product.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {PRODUCT_CATEGORY_LABEL_RU[product.category]} · {product.price}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-neutral-800">{product.description}</p>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <dt className="text-neutral-500">Образец</dt>
              <dd className="font-medium text-neutral-900">
                {product.isSampleAvailable ? "Да" : "Нет"}
              </dd>
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <dt className="text-neutral-500">Запросов</dt>
              <dd className="font-medium text-neutral-900">{product.inquiryCount}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="rounded-lg bg-[#F26522] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              Редактировать
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
