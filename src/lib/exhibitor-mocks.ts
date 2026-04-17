/**
 * Моки кабинета экспонента. Заменить вызовами API.
 */

export const mockCompanyName = "Кофе Плюс ООО";

export const dashboardKpi = {
  standViews: 234,
  quotationRequests: 18,
  sampleRequests: 5,
  newTenders: 3
} as const;

/** Просмотры за последние 7 дней (пн–вс) */
export const viewsLast7Days = [
  { day: "Пн", views: 22 },
  { day: "Вт", views: 28 },
  { day: "Ср", views: 19 },
  { day: "Чт", views: 31 },
  { day: "Пт", views: 26 },
  { day: "Сб", views: 34 },
  { day: "Вс", views: 29 }
];

export interface DashboardInquiryPreview {
  id: string;
  visitorCompany: string;
  dateLabel: string;
  status: "Новый" | "В обработке";
}

export const recentInquiriesPreview: DashboardInquiryPreview[] = [
  { id: "1", visitorCompany: "ООО «Гостиница Север»", dateLabel: "14.04.2026", status: "Новый" },
  { id: "2", visitorCompany: "ИП Иванов", dateLabel: "13.04.2026", status: "В обработке" },
  { id: "3", visitorCompany: "Сеть «Утро»", dateLabel: "12.04.2026", status: "Новый" }
];

export interface InquiryRow {
  id: string;
  company: string;
  contactName: string;
  dateLabel: string;
  status: "ожидает" | "обработан";
  contactHint: string;
}

export const mockQuotationInquiries: InquiryRow[] = [
  {
    id: "q1",
    company: "ООО «Гостиница Север»",
    contactName: "Анна Петрова",
    dateLabel: "14.04.2026",
    status: "ожидает",
    contactHint: "anna@gost-sever.example"
  },
  {
    id: "q2",
    company: "Кафе «Зерно»",
    contactName: "Михаил Сидоров",
    dateLabel: "11.04.2026",
    status: "обработан",
    contactHint: "m.sidorov@zerno.example"
  }
];

export const mockSampleInquiries: InquiryRow[] = [
  {
    id: "s1",
    company: "Отель «Плаза»",
    contactName: "Елена Ким",
    dateLabel: "13.04.2026",
    status: "ожидает",
    contactHint: "e.kim@plaza.example"
  },
  {
    id: "s2",
    company: "Ресторан «Вкус»",
    contactName: "Дмитрий Орлов",
    dateLabel: "10.04.2026",
    status: "обработан",
    contactHint: "d.orlov@vkus.example"
  }
];

export const analyticsViewsByDay = viewsLast7Days;

export const analyticsConversion = [
  { name: "Пн", rate: 12 },
  { name: "Вт", rate: 18 },
  { name: "Ср", rate: 15 },
  { name: "Чт", rate: 22 },
  { name: "Пт", rate: 19 }
];

export const analyticsRegions = [
  { region: "Москва", value: 42 },
  { region: "СПб", value: 28 },
  { region: "Юг", value: 15 },
  { region: "Урал", value: 10 },
  { region: "Др.", value: 5 }
];

export interface MockExhibitorProductSeed {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  sampleAvailable: boolean;
}

export const initialExhibitorProducts: MockExhibitorProductSeed[] = [
  {
    id: "ep-1",
    title: "Эспрессо-смесь «Гостиница»",
    description: "Стабильная экстракция, объёмные партии.",
    priceLabel: "от 1 890 ₽ / кг",
    sampleAvailable: true
  },
  {
    id: "ep-2",
    title: "Фильтр-кофе молотый 250 г",
    description: "Для завтраков и room service.",
    priceLabel: "от 420 ₽",
    sampleAvailable: false
  }
];
