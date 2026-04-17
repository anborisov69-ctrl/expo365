import { ProductCategory } from "@prisma/client";

export function parseCompanyExpertiseCategories(json: string): ProductCategory[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const values = Object.values(ProductCategory) as string[];
    return parsed.filter((item): item is ProductCategory =>
      typeof item === "string" && values.includes(item)
    );
  } catch {
    return [];
  }
}
