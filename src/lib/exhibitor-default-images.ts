/**
 * Изображения по умолчанию для кабинета экспонента (локальные файлы в `public/`).
 * Используются, если у компании нет logoUrl; примеры для новинок в формах.
 */

/** Аватар компании, если logoUrl не задан */
export const DEFAULT_COMPANY_AVATAR_URL = "/expo-365-logo.png";

/**
 * Набор картинок для новинок без imageUrl — ротация по id товара,
 * чтобы соседние карточки чаще отличались.
 */
export const DEFAULT_PRODUCT_IMAGE_URLS: readonly string[] = [
  "/images/products/coffee.svg",
  "/images/products/tea.svg",
  "/images/products/equipment.svg",
  "/images/products/other.svg"
];

/** Пример URL для поля «картинка новинки» в формах */
export const EXAMPLE_PRODUCT_IMAGE_URL = "/images/products/coffee.svg";

/** Статическая заглушка в `public/placeholder-product.svg`, если нет фото или сбой загрузки */
export const PRODUCT_IMAGE_PLACEHOLDER_PATH = "/placeholder-product.svg";

export function getProductImageSrc(imageUrl: string | null | undefined): string {
  const trimmed = typeof imageUrl === "string" ? imageUrl.trim() : "";
  return trimmed !== "" ? trimmed : PRODUCT_IMAGE_PLACEHOLDER_PATH;
}
