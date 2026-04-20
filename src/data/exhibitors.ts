/**
 * Каталог экспонентов HoReCa (заглушки для демонстрации UI).
 */

export const HORECA_CATEGORY_LABELS = [
  "Кофе",
  "Чай",
  "Оборудование",
  "Посуда",
  "Сервис",
  "Продукты питания",
  "Текстиль",
  "Молочная продукция",
  "Сиропы и напитки"
] as const;

export type HorecaCategoryLabel = (typeof HORECA_CATEGORY_LABELS)[number];

export interface HorecaExhibitor {
  id: string;
  name: string;
  /** URL логотипа (плейсхолдер) */
  logo: string;
  categories: string[];
}

const HORECA_LOGO_ROTATION = [
  "/expo-365-logo.png",
  "/placeholder.png",
  "/brands/julius-meinl.png",
  "/placeholder-product.svg"
] as const;

function logoUrl(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash + label.charCodeAt(i) * (i + 1)) % 2147483647;
  }
  return HORECA_LOGO_ROTATION[hash % HORECA_LOGO_ROTATION.length];
}

export const horecaExhibitors: HorecaExhibitor[] = [
  {
    id: "coffee-plus",
    name: "Кофе Плюс",
    logo: logoUrl("Кофе+"),
    categories: ["Кофе", "Сиропы и напитки"]
  },
  {
    id: "tea-collection",
    name: "Чайная коллекция",
    logo: logoUrl("Чай"),
    categories: ["Чай"]
  },
  {
    id: "prof-equip",
    name: "ПрофОборудование",
    logo: logoUrl("Профи"),
    categories: ["Оборудование"]
  },
  {
    id: "posuda-lux",
    name: "Посуда Люкс",
    logo: logoUrl("Посуда"),
    categories: ["Посуда"]
  },
  {
    id: "resto-service",
    name: "РесторанСервис",
    logo: logoUrl("Сервис"),
    categories: ["Сервис", "Продукты питания"]
  },
  {
    id: "textile-hall",
    name: "ТекстильХолл",
    logo: logoUrl("Текстиль"),
    categories: ["Текстиль"]
  },
  {
    id: "milk-paradise",
    name: "Молочный Рай",
    logo: logoUrl("Молоко"),
    categories: ["Молочная продукция"]
  },
  {
    id: "bar-solutions",
    name: "Барные Решения",
    logo: logoUrl("Бар"),
    categories: ["Сиропы и напитки", "Оборудование"]
  }
];
