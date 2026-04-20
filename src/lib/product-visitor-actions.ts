import { ProductCategory } from "@prisma/client";

/** Сценарий кнопок для посетителя по категории новинки */
export type VisitorProductActionKind = "consumables" | "equipment" | "training";

/**
 * Кофе, чай, посуда, сиропы, прочее → образец + КП.
 * Оборудование → тест-драйв, видео, финансы (без образца).
 * Сервис (в т.ч. обучение в каталоге) → программа обучения / связаться.
 */
export function getVisitorProductActionKind(category: ProductCategory): VisitorProductActionKind {
  if (category === ProductCategory.EQUIPMENT) {
    return "equipment";
  }
  if (category === ProductCategory.SERVICE) {
    return "training";
  }
  return "consumables";
}

export const VISITOR_ACTION_STUB_ALERT = "Функция в разработке";
