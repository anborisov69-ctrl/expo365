"use client";

import { getProductCoverSrc, isProductVideo } from "@/lib/product-media";
import type { ProductApiRow } from "@/types/product-api";
import { Play } from "lucide-react";

interface ProductCoverThumbProps {
  product: Pick<ProductApiRow, "imageUrl" | "mediaType">;
  /** Дополнительные классы для внешнего контейнера (aspect, rounded и т.д.) */
  className?: string;
  imgClassName?: string;
}

/**
 * Обложка карточки: изображение-превью; для видео — иконка воспроизведения поверх.
 */
export function ProductCoverThumb({
  product,
  className = "",
  imgClassName = "h-full w-full object-cover"
}: ProductCoverThumbProps) {
  const src = getProductCoverSrc(product);
  const showPlay = isProductVideo(product);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={imgClassName} />
      {showPlay ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15"
          aria-hidden
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-[2px]">
            <Play className="ml-1 h-8 w-8" fill="currentColor" strokeWidth={0} />
          </span>
        </div>
      ) : null}
    </div>
  );
}
