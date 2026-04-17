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
    dishes: ProductCategory.DISHES
  };
  return map[key] ?? null;
}
