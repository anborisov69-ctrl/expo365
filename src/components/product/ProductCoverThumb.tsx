"use client";

import { PRODUCT_IMAGE_PLACEHOLDER_PATH } from "@/lib/exhibitor-default-images";
import { getProductCoverSrc, isProductVideo } from "@/lib/product-media";
import type { ProductApiRow } from "@/types/product-api";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductCoverThumbProps {
  product: Pick<ProductApiRow, "imageUrl" | "mediaType" | "name">;
  /** Дополнительные классы для внешнего контейнера (aspect, rounded и т.д.) */
  className?: string;
  imgClassName?: string;
}

/**
 * Обложка карточки: изображение-превью; для видео — иконка воспроизведения поверх.
 * При ошибке загрузки внешнего URL подставляется локальная заглушка.
 */
export function ProductCoverThumb({
  product,
  className = "",
  imgClassName = "h-full w-full object-contain bg-slate-50"
}: ProductCoverThumbProps) {
  const primarySrc = getProductCoverSrc(product);
  const [src, setSrc] = useState(primarySrc);
  const showPlay = isProductVideo(product);

  useEffect(() => {
    setSrc(getProductCoverSrc(product));
  }, [product.imageUrl, product.mediaType]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={product.name}
        className={imgClassName}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          setSrc(PRODUCT_IMAGE_PLACEHOLDER_PATH);
        }}
      />
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
