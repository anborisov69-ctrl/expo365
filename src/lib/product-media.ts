import { getProductImageSrc } from "@/lib/exhibitor-default-images";
import type { ProductApiRow, ProductMediaType } from "@/types/product-api";

export function isProductVideo(product: Pick<ProductApiRow, "mediaType">): boolean {
  return product.mediaType === "video";
}

/** URL обложки карточки (превью или изображение). */
export function getProductCoverSrc(product: Pick<ProductApiRow, "imageUrl">): string {
  return getProductImageSrc(product.imageUrl);
}

/** URL для воспроизведения видео (только для mediaType === video). */
export function getProductVideoSrc(product: ProductApiRow): string | null {
  if (product.mediaType !== "video") {
    return null;
  }
  const url = typeof product.mediaUrl === "string" ? product.mediaUrl.trim() : "";
  return url !== "" ? url : null;
}

export function normalizeProductMediaType(value: unknown): ProductMediaType {
  return value === "video" ? "video" : "image";
}
