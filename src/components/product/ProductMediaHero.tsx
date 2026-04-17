"use client";

import { getProductCoverSrc, getProductVideoSrc } from "@/lib/product-media";
import type { ProductApiRow } from "@/types/product-api";

interface ProductMediaHeroProps {
  product: ProductApiRow;
  className?: string;
}

/**
 * Блок медиа в модалке: видео с постером или изображение.
 */
export function ProductMediaHero({ product, className }: ProductMediaHeroProps) {
  const cover = getProductCoverSrc(product);
  const videoSrc = getProductVideoSrc(product);

  if (product.mediaType === "video" && videoSrc) {
    return (
      <video
        src={videoSrc}
        poster={cover}
        controls
        playsInline
        className={className ?? "h-full w-full object-cover"}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cover}
      alt=""
      className={className ?? "h-full w-full object-cover"}
    />
  );
}
