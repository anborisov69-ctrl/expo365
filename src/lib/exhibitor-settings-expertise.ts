import { ProductCategory } from "@prisma/client";

/**
 * Категории в форме настроек экспонента (мультивыбор).
 * Значения — валидные ProductCategory для поля Company.expertiseCategories.
 */
export const EXHIBITOR_SETTINGS_EXPERTISE_OPTIONS: readonly {
  value: ProductCategory;
  label: string;
}[] = [
  { value: ProductCategory.COFFEE, label: "Кофе" },
  { value: ProductCategory.TEA, label: "Чай" },
  { value: ProductCategory.EQUIPMENT, label: "Оборудование" },
  { value: ProductCategory.DISHES, label: "Посуда" },
  { value: ProductCategory.SERVICE, label: "Сервис" },
  { value: ProductCategory.SYRUPS_AND_BEVERAGES, label: "Обучение" },
  { value: ProductCategory.FOOD_PRODUCTS, label: "Прочее" }
] as const;
