import { ProductCategory } from "@prisma/client";

/** Нормализация значения из query (?category=кофе) */
export function parseCategoryQueryParam(raw: string): ProductCategory | null {
  const key = raw.trim().toLowerCase();
  const map: Record<string, ProductCategory> = {
    кофе: ProductCategory.COFFEE,
    coffee: ProductCategory.COFFEE,
    чай: ProductCategory.TEA,
    tea: ProductCategory.TEA,
    оборудование: ProductCategory.EQUIPMENT,
    equipment: ProductCategory.EQUIPMENT,
    посуда: ProductCategory.DISHES,
    dishes: ProductCategory.DISHES,
    сервис: ProductCategory.SERVICE,
    service: ProductCategory.SERVICE,
    "продукты питания": ProductCategory.FOOD_PRODUCTS,
    продукты: ProductCategory.FOOD_PRODUCTS,
    текстиль: ProductCategory.TEXTILE,
    textile: ProductCategory.TEXTILE,
    "молочная продукция": ProductCategory.DAIRY,
    молочка: ProductCategory.DAIRY,
    dairy: ProductCategory.DAIRY,
    "сиропы и напитки": ProductCategory.SYRUPS_AND_BEVERAGES,
    сиропы: ProductCategory.SYRUPS_AND_BEVERAGES
  };
  return map[key] ?? null;
}
