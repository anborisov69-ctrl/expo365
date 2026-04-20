"use client";

import { ProductCoverThumb } from "@/components/product/ProductCoverThumb";
import type { ProductApiRow } from "@/types/product-api";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/lib/product-category-labels";
import { Pencil, Trash2 } from "lucide-react";

/** Карточка новинки в кабинете экспонента: редактирование и удаление. Действия посетителя по категории — см. `VisitorProductActionButtons`. */
interface ProductCardProps {
  product: ProductApiRow;
  onEdit: (product: ProductApiRow) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[12px] border border-slate-100/90 bg-white shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover md:flex-row md:items-stretch`}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100 md:aspect-auto md:h-auto md:w-52 md:min-h-[160px] md:max-w-[13rem]">
        <ProductCoverThumb product={product} className="h-full w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-expoOrange">{PRODUCT_CATEGORY_LABEL_RU[product.category]}</p>
        <h3 className="mt-1 text-lg font-semibold text-expoBlue">{product.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{product.description}</p>
        <p className="mt-3 text-xl font-bold text-slate-900">{product.price}</p>
        {product.isSampleAvailable ? (
          <p className="mt-1 text-xs font-medium text-expoOrange">Образец доступен</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-expoBlue/25 bg-white px-3 py-2 text-sm font-semibold text-expoBlue transition hover:bg-expoBlue/5 md:flex-none md:px-4"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Редактировать
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Удалить новинку?")) {
                onDelete(product.id);
              }
            }}
            className="inline-flex items-center justify-center rounded-[8px] border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            aria-label="Удалить"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
