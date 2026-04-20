import { parseCategoryQueryParam } from "@/lib/product-category-map";
import { ProductCategory } from "@prisma/client";

export const PRODUCT_CATEGORY_LABEL_RU: Record<ProductCategory, string> = {
  [ProductCategory.COFFEE]: "Кофе",
  [ProductCategory.TEA]: "Чай",
  [ProductCategory.EQUIPMENT]: "Оборудование",
  [ProductCategory.DISHES]: "Посуда",
  [ProductCategory.SERVICE]: "Сервис",
  [ProductCategory.FOOD_PRODUCTS]: "Продукты питания",
  [ProductCategory.TEXTILE]: "Текстиль",
  [ProductCategory.DAIRY]: "Молочная продукция",
  [ProductCategory.SYRUPS_AND_BEVERAGES]: "Сиропы и напитки"
};

/** Совместимость с существующими импортами (покупатель, лента спроса) */
export const productCategoryLabelRu = PRODUCT_CATEGORY_LABEL_RU;

/** Парсинг категории из query (?category=кофе) */
export function parseProductCategory(raw: string | null): ProductCategory | null {
  if (raw === null || raw.trim() === "") {
    return null;
  }
  return parseCategoryQueryParam(raw);
}

/** Хештеги для профиля (нижний регистр) */
export const PRODUCT_CATEGORY_HASHTAG_RU: Record<ProductCategory, string> = {
  [ProductCategory.COFFEE]: "кофе",
  [ProductCategory.TEA]: "чай",
  [ProductCategory.EQUIPMENT]: "оборудование",
  [ProductCategory.DISHES]: "посуда",
  [ProductCategory.SERVICE]: "сервис",
  [ProductCategory.FOOD_PRODUCTS]: "продукты",
  [ProductCategory.TEXTILE]: "текстиль",
  [ProductCategory.DAIRY]: "молочка",
  [ProductCategory.SYRUPS_AND_BEVERAGES]: "сиропы"
};
