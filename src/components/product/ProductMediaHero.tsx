"use client";

import { PRODUCT_IMAGE_PLACEHOLDER_PATH } from "@/lib/exhibitor-default-images";
import { getProductCoverSrc, getProductVideoSrc } from "@/lib/product-media";
import type { ProductApiRow } from "@/types/product-api";
import { useEffect, useState } from "react";

interface ProductMediaHeroProps {
  product: ProductApiRow;
  className?: string;
}

/**
 * Блок медиа в модалке: видео с постером или изображение.
 */
export function ProductMediaHero({ product, className }: ProductMediaHeroProps) {
  const cover = getProductCoverSrc(product);
  const [posterSrc, setPosterSrc] = useState(cover);
  const videoSrc = getProductVideoSrc(product);

  useEffect(() => {
    setPosterSrc(cover);
  }, [cover, product.imageUrl, product.mediaUrl, product.mediaType]);

  if (product.mediaType === "video" && videoSrc) {
    return (
      <video
        src={videoSrc}
        poster={posterSrc}
        controls
        playsInline
        className={className ?? "h-full w-full object-cover"}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={posterSrc}
      alt={product.name}
      className={className ?? "h-full w-full object-contain bg-slate-50"}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setPosterSrc(PRODUCT_IMAGE_PLACEHOLDER_PATH)}
    />
  );
}
