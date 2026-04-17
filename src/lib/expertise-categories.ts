import { ProductCategory } from "@prisma/client";

const ALL = Object.values(ProductCategory) as string[];

/** Парсит JSON из поля Company.expertiseCategories */
export function parseExpertiseCategoriesJson(raw: string | null | undefined): ProductCategory[] {
  if (raw == null || raw === "") {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const out: ProductCategory[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") {
        continue;
      }
      const upper = item.toUpperCase();
      if (ALL.includes(upper)) {
        out.push(upper as ProductCategory);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Пустой массив — не ограничиваем категории (все подходят). */
export function companyMatchesDemandCategory(
  expertise: ProductCategory[],
  demandCategory: ProductCategory
): boolean {
  if (expertise.length === 0) {
    return true;
  }
  return expertise.includes(demandCategory);
}
