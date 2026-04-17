/**
 * Заглушки для главной страницы. Замените на данные из API / БД при подключении бэкенда.
 */

/** Пункты верхнего меню (главная без секций-якорей — ведём на страницы разделов) */
export const landingNavItems = [
  { id: "novelties", label: "Новинки", href: "/feed" },
  { id: "exhibitors", label: "Экспоненты", href: "/horeca" },
  { id: "tenders", label: "Тендеры", href: "/demand-feed" },
  { id: "finance", label: "Финансы", href: "/demand-feed" },
  { id: "career", label: "Карьера", href: "/register" },
  { id: "education", label: "Обучение", href: "/feed" },
  { id: "analytics", label: "Аналитика", href: "/visitor/dashboard" }
] as const;

export interface VerifiedSupplierCard {
  id: string;
  title: string;
  description: string;
}

export const verifiedSuppliers: VerifiedSupplierCard[] = [
  {
    id: "vs-1",
    title: "Verified Supplier",
    description: "Крупнейший поставщик сырья и упаковки для сетей HoReCa по всей стране."
  },
  {
    id: "vs-2",
    title: "Verified Supplier",
    description: "Сертифицированность по международным стандартам качества и прослеживаемости."
  },
  {
    id: "vs-3",
    title: "Verified Supplier",
    description: "Обеспечение высокого качества поставок и стабильных сроков для вашего бизнеса."
  },
  {
    id: "vs-4",
    title: "Verified Supplier",
    description: "Проверенные контракты и прозрачная отчётность для закупок и тендеров."
  }
];

export interface ExhibitorCard {
  id: string;
  companyName: string;
  specialization: string;
  logoInitials: string;
}

export const exhibitors: ExhibitorCard[] = [
  {
    id: "ex-1",
    companyName: "Кофе Плюс",
    specialization: "Кофе, оборудование, бариста-решения",
    logoInitials: "КП"
  },
  {
    id: "ex-2",
    companyName: "HoReCa Supply",
    specialization: "Продукты, посуда, расходные материалы",
    logoInitials: "HS"
  },
  {
    id: "ex-3",
    companyName: "Fresh Line",
    specialization: "Овощи, молочка, заморозка для ресторанов",
    logoInitials: "FL"
  },
  {
    id: "ex-4",
    companyName: "TechKitchen",
    specialization: "Профессиональное оборудование и сервис",
    logoInitials: "TK"
  }
];

export interface QuickActionItem {
  id: string;
  label: string;
  /** Короткий ключ для иконки (рендер в компоненте) */
  icon: "chat" | "profile" | "production" | "leasing" | "education" | "webinar" | "map";
}

export const quickActions: QuickActionItem[] = [
  { id: "qa-1", label: "Чат", icon: "chat" },
  { id: "qa-2", label: "Профиль", icon: "profile" },
  { id: "qa-3", label: "Производство", icon: "production" },
  { id: "qa-4", label: "Лизинг", icon: "leasing" },
  { id: "qa-5", label: "Обучение", icon: "education" },
  { id: "qa-6", label: "Вебинар", icon: "webinar" },
  { id: "qa-7", label: "Карта", icon: "map" }
];
