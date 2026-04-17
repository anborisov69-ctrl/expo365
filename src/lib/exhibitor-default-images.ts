/**
 * Изображения по умолчанию для кабинета экспонента (внешние стоковые URL).
 * Используются, если у компании нет logoUrl; пример для новинок в формах.
 */

/** Аватар компании, если logoUrl не задан */
export const DEFAULT_COMPANY_AVATAR_URL =
  "https://randomuser.me/api/portraits/women/68.jpg";

/**
 * Набор картинок для новинок без imageUrl — ротация по id товара,
 * чтобы соседние карточки чаще отличались.
 */
export const DEFAULT_PRODUCT_IMAGE_URLS: readonly string[] = [
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  "https://images.unsplash.com/photo-1556679343-c7306c19756b?w=800&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80"
];

/** Пример URL для поля «картинка новинки» в формах */
export const EXAMPLE_PRODUCT_IMAGE_URL = DEFAULT_PRODUCT_IMAGE_URLS[0];

/** Статическая заглушка в `public/placeholder.png`, если у новинки нет фото */
export const PRODUCT_IMAGE_PLACEHOLDER_PATH = "/placeholder.png";

export function getProductImageSrc(imageUrl: string | null | undefined): string {
  const trimmed = typeof imageUrl === "string" ? imageUrl.trim() : "";
  return trimmed !== "" ? trimmed : PRODUCT_IMAGE_PLACEHOLDER_PATH;
}
