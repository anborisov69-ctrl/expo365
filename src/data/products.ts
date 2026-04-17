import { ProductCategory as PrismaProductCategory } from "@prisma/client";

/** Ключи категорий в UI (совпадают с маршрутизацией стилей) */
export type ProductCategory = "coffee" | "tea" | "equipment" | "dishes";

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "coffee", label: "Кофе" },
  { id: "tea", label: "Чай" },
  { id: "equipment", label: "Оборудование" },
  { id: "dishes", label: "Посуда" }
];

/** Значение query `?category=` (русские ярлыки в нижнем регистре) */
export const UI_CATEGORY_TO_QUERY: Record<ProductCategory, string> = {
  coffee: "кофе",
  tea: "чай",
  equipment: "оборудование",
  dishes: "посуда"
};

export function prismaCategoryToProductCategory(
  category: PrismaProductCategory
): ProductCategory {
  switch (category) {
    case PrismaProductCategory.COFFEE:
      return "coffee";
    case PrismaProductCategory.TEA:
      return "tea";
    case PrismaProductCategory.EQUIPMENT:
      return "equipment";
    case PrismaProductCategory.DISHES:
      return "dishes";
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}

/** Градиенты-заглушки для карточки без imageUrl (лента) */
export const FEED_IMAGE_PLACEHOLDER: Record<ProductCategory, string> = {
  coffee: "from-expoBlue/35 via-slate-100 to-expoOrange/25",
  tea: "from-emerald-800/30 via-slate-100 to-expoBlue/25",
  equipment: "from-slate-700/40 via-slate-200 to-expoBlue/30",
  dishes: "from-slate-200 via-white to-expoOrange/20"
};
