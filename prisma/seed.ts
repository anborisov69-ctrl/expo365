/**
 * Seed ЭКСПО 365: экспоненты, товары по категориям (превью — `public/images/products/*.svg`),
 * заявки ленты спроса и отклики.
 * Демо-вход администратора для инвесторов: demo@expo365.ru / demo123 (см. seed).
 *
 * Запуск: npx prisma db seed
 */

import {
  BidStatus,
  DemandStatus,
  PrismaClient,
  ProductCategory,
  Role
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Пароль для посетителей, экспонентов и демо-администратора */
const SEED_USER_PASSWORD = "demo123";

const PUBLIC_COMPANY_LOGOS = [
  "/expo-365-logo.png",
  "/placeholder.png",
  "/brands/julius-meinl.png",
  "/placeholder-product.svg"
] as const;

/** Превью новинки по категории Prisma (`public/images/products/`). */
function productImageUrlForCategory(
  category: ProductCategory,
  serviceKind?: "repair" | "training"
): string {
  switch (category) {
    case ProductCategory.COFFEE:
      return "/images/products/coffee.svg";
    case ProductCategory.TEA:
      return "/images/products/tea.svg";
    case ProductCategory.EQUIPMENT:
      return "/images/products/equipment.svg";
    case ProductCategory.DISHES:
      return "/images/products/tableware.svg";
    case ProductCategory.SERVICE:
      return serviceKind === "training"
        ? "/images/products/training.svg"
        : "/images/products/service.svg";
    case ProductCategory.FOOD_PRODUCTS:
    case ProductCategory.TEXTILE:
    case ProductCategory.DAIRY:
    case ProductCategory.SYRUPS_AND_BEVERAGES:
    default:
      return "/images/products/other.svg";
  }
}

function companyLogoUrl(companyIndex: number): string {
  return PUBLIC_COMPANY_LOGOS[companyIndex % PUBLIC_COMPANY_LOGOS.length];
}

async function clearDatabase() {
  /** Порядок важен из-за внешних ключей */
  await prisma.bid.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.demandRequest.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.specialOffer.deleteMany();
  await prisma.company.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const hashDemo = await bcrypt.hash(SEED_USER_PASSWORD, 12);

  await clearDatabase();

  // --- Единый демо-администратор (вход для презентации инвесторам) ---
  await prisma.user.create({
    data: {
      email: "demo@expo365.ru",
      name: "Администратор (демо)",
      password: hashDemo,
      role: Role.ADMIN
    }
  });

  // --- Посетители (для ленты спроса) ---
  const visitor1 = await prisma.user.create({
    data: {
      email: "buyer.ivan@seed.expo365.local",
      name: "Иван Петров",
      password: hashDemo,
      role: Role.VISITOR,
      visitorCompany: 'ООО «Кофейная сеть»',
      phone: "+7 495 100-00-01"
    }
  });

  const visitor2 = await prisma.user.create({
    data: {
      email: "buyer.anna@seed.expo365.local",
      name: "Анна Сидорова",
      password: hashDemo,
      role: Role.VISITOR,
      visitorCompany: 'ИП «Чайный дом»',
      phone: "+7 812 200-00-02"
    }
  });

  // --- Экспоненты и компании (6) ---
  type CompanySeed = {
    slug: string;
    name: string;
    logoShort: string;
    description: string;
    email: string;
    phone: string;
    website: string;
    expertise: ProductCategory[];
  };

  const companiesMeta: CompanySeed[] = [
    {
      slug: "kofe-plus",
      name: "Кофе Плюс",
      logoShort: "KP",
      description:
        "Оптовые поставки кофе, обжарка под заказ и консультации по меню для HoReCa в Москве и регионах.",
      email: "opt@kofe-plus.seed",
      phone: "+7 499 400-00-01",
      website: "https://example.com/kofe-plus",
      expertise: [ProductCategory.COFFEE, ProductCategory.SYRUPS_AND_BEVERAGES]
    },
    {
      slug: "chaynaya",
      name: "Чайная коллекция",
      logoShort: "CC",
      description:
        "Премиальный листовой чай, купажи и сервировка для ресторанов и отелей.",
      email: "b2b@chaynaya.seed",
      phone: "+7 812 300-00-02",
      website: "https://example.com/chaynaya",
      expertise: [ProductCategory.TEA, ProductCategory.DISHES]
    },
    {
      slug: "prof-oborud",
      name: "ПрофОборудование",
      logoShort: "PO",
      description:
        "Профессиональные кофемашины, молочные системы и сервисное сопровождение оборудования.",
      email: "sales@prof-oborud.seed",
      phone: "+7 495 200-00-03",
      website: "https://example.com/prof-oborud",
      expertise: [ProductCategory.EQUIPMENT]
    },
    {
      slug: "posuda-lux",
      name: "Посуда Люкс",
      logoShort: "PL",
      description:
        "Посуда и сервировка для кофеен и ресторанов: фарфор, стекло, индивидуальный дизайн.",
      email: "order@posuda-lux.seed",
      phone: "+7 812 400-00-04",
      website: "https://example.com/posuda-lux",
      expertise: [ProductCategory.DISHES, ProductCategory.TEXTILE]
    },
    {
      slug: "servis-pro",
      name: "СервисПро",
      logoShort: "SP",
      description:
        "Ремонт и обслуживание кофемашин, установка, настройка воды и гарантийный сервис.",
      email: "service@servis-pro.seed",
      phone: "+7 499 500-00-05",
      website: "https://example.com/servis-pro",
      expertise: [ProductCategory.SERVICE]
    },
    {
      slug: "obuchenie-barista",
      name: "Обучение Бариста",
      logoShort: "OB",
      description:
        "Курсы бариста, калибровка оборудования и онлайн-тренинги для персонала HoReCa.",
      email: "school@barista-school.seed",
      phone: "+7 495 600-00-06",
      website: "https://example.com/obuchenie-barista",
      expertise: [ProductCategory.SERVICE]
    }
  ];

  const exhibitorUsers: { id: string; companyId: string }[] = [];

  for (let companyIndex = 0; companyIndex < companiesMeta.length; companyIndex++) {
    const meta = companiesMeta[companyIndex];
    const user = await prisma.user.create({
      data: {
        email: `exhibitor.${meta.slug}@seed.expo365.local`,
        name: `${meta.name} — представитель`,
        password: hashDemo,
        role: Role.EXHIBITOR
      }
    });

    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: meta.name,
        logoUrl: companyLogoUrl(companyIndex),
        description: meta.description,
        website: meta.website,
        contacts: {
          email: meta.email,
          phone: meta.phone,
          website: meta.website
        },
        expertiseCategories: JSON.stringify(meta.expertise)
      }
    });

    exhibitorUsers.push({ id: user.id, companyId: company.id });
  }

  /**
   * Демо-экспонент (dev quick login в `demo-login`): stand@expo365.ru / demo123.
   * Администратор для презентации: demo@expo365.ru / demo123 — только роль ADMIN.
   */
  const hashBuyerDemo = await bcrypt.hash("buyer123", 12);
  const demoExhibitorUser = await prisma.user.create({
    data: {
      email: "stand@expo365.ru",
      name: "Демо экспонент",
      password: hashDemo,
      role: Role.EXHIBITOR
    }
  });
  const demoCompany = await prisma.company.create({
    data: {
      userId: demoExhibitorUser.id,
      name: "Демо-стенд ЭКСПО 365",
      logoUrl: companyLogoUrl(companiesMeta.length),
      description:
        "Демонстрационный профиль для быстрого входа. Ниже — примеры новинок; полный каталог также у компаний из сида (например «Кофе Плюс»).",
      website: "https://example.com/expo365-demo",
      contacts: {
        email: "stand@expo365.ru",
        phone: "+7 499 000-00-00",
        website: "https://example.com/expo365-demo"
      },
      expertiseCategories: JSON.stringify([ProductCategory.COFFEE, ProductCategory.EQUIPMENT])
    }
  });

  await prisma.product.createMany({
    data: [
      {
        companyId: demoCompany.id,
        name: "Демо: бленд Espresso Premium 1 кг",
        description: "Сбалансированный вкус для демо-витрины и тестовых запросов КП.",
        price: "от 1 050 ₽ / кг",
        category: ProductCategory.COFFEE,
        imageUrl: productImageUrlForCategory(ProductCategory.COFFEE),
        isSampleAvailable: true,
        mediaType: "image",
        mediaUrl: null
      },
      {
        companyId: demoCompany.id,
        name: "Демо: фильтр-кофе Colombia 500 г",
        description: "Светлая обжарка для фильтра — для проверки запроса образца.",
        price: "от 480 ₽",
        category: ProductCategory.COFFEE,
        imageUrl: productImageUrlForCategory(ProductCategory.COFFEE),
        isSampleAvailable: true,
        mediaType: "image",
        mediaUrl: null
      },
      {
        companyId: demoCompany.id,
        name: "Демо: капучинатор ручной",
        description: "Пример карточки оборудования на демо-стенде.",
        price: "от 2 400 ₽",
        category: ProductCategory.EQUIPMENT,
        imageUrl: productImageUrlForCategory(ProductCategory.EQUIPMENT),
        isSampleAvailable: false,
        mediaType: "image",
        mediaUrl: null
      }
    ]
  });

  await prisma.user.create({
    data: {
      email: "buyer@expo365.ru",
      name: "Демо посетитель",
      password: hashBuyerDemo,
      role: Role.VISITOR,
      visitorCompany: 'ООО «Демо-покупатель»',
      phone: "+7 499 000-00-07"
    }
  });

  const byName = (n: string) => exhibitorUsers[companiesMeta.findIndex((c) => c.name === n)];

  const cKofe = byName("Кофе Плюс");
  const cChay = byName("Чайная коллекция");
  const cProf = byName("ПрофОборудование");
  const cPosuda = byName("Посуда Люкс");
  const cServis = byName("СервисПро");
  const cObuch = byName("Обучение Бариста");

  type ProdIn = {
    name: string;
    description: string;
    price: string;
    category: ProductCategory;
    isSampleAvailable?: boolean;
  };

  function pushProducts(
    companyId: string,
    items: ProdIn[],
    serviceKind?: "repair" | "training"
  ) {
    return items.map((p) => ({
      companyId,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      imageUrl: productImageUrlForCategory(p.category, serviceKind),
      isSampleAvailable: p.isSampleAvailable ?? false,
      mediaType: "image",
      mediaUrl: null as string | null
    }));
  }

  const coffeeItems: ProdIn[] = [
    { name: "Кофе Арабика Эфиопия 1 кг", description: "Светлая обжарка, ноты цитруса.", price: "от 1 450 ₽ / кг", category: ProductCategory.COFFEE, isSampleAvailable: true },
    { name: "Кофе Робуста Вьетнам 1 кг", description: "Плотное тело, для смесей и капучино.", price: "от 980 ₽ / кг", category: ProductCategory.COFFEE },
    { name: "Зерновой бленд Espresso 1 кг", description: "Сбалансированный вкус для суперавтоматов.", price: "от 1 200 ₽ / кг", category: ProductCategory.COFFEE, isSampleAvailable: true },
    { name: "Молотый кофе Filter 250 г", description: "Помол под фильтр и кемекс.", price: "от 320 ₽", category: ProductCategory.COFFEE },
    { name: "Капсулы для кофемашин 50 шт", description: "Совместимость уточняйте у менеджера.", price: "от 890 ₽", category: ProductCategory.COFFEE },
    { name: "Кофе без кофеина 500 г", description: "Швейцарская обработка, мягкий вкус.", price: "от 650 ₽", category: ProductCategory.COFFEE },
    { name: "Органик Перу 1 кг", description: "Сертификация органик, мешок 60 кг опт.", price: "от 1 600 ₽ / кг", category: ProductCategory.COFFEE, isSampleAvailable: true },
    { name: "Колумбия Супремо 1 кг", description: "Классика для эспрессо-баров.", price: "от 1 380 ₽ / кг", category: ProductCategory.COFFEE },
    { name: "Холодный кофе концентрат 1 л", description: "Готовая база для напитков.", price: "от 420 ₽ / л", category: ProductCategory.COFFEE },
    { name: "Смесь для капучино 1 кг", description: "Карамельные ноты, стабильная экстракция.", price: "от 1 100 ₽ / кг", category: ProductCategory.COFFEE }
  ];

  const teaItems: ProdIn[] = [
    { name: "Чай пакетированный чёрный 100 пак.", description: "Для высокого трафика.", price: "от 280 ₽", category: ProductCategory.TEA },
    { name: "Листовой ассам 500 г", description: "Крепкий настой, HoReCa.", price: "от 520 ₽", category: ProductCategory.TEA, isSampleAvailable: true },
    { name: "Улун молочный 250 г", description: "Популярный вкус для чайной карты.", price: "от 480 ₽", category: ProductCategory.TEA },
    { name: "Матча церемониальная 100 г", description: "Для латте и десертов.", price: "от 1 200 ₽", category: ProductCategory.TEA, isSampleAvailable: true },
    { name: "Чай зелёный сенча 250 г", description: "Японский стиль.", price: "от 590 ₽", category: ProductCategory.TEA },
    { name: "Травяной сбор «Цитрус» 100 г", description: "Без кофеина.", price: "от 340 ₽", category: ProductCategory.TEA },
    { name: "Пуэр прессованный 357 г", description: "Выдержка 3 года.", price: "от 1 800 ₽", category: ProductCategory.TEA },
    { name: "Ройбос гранулированный 1 кг", description: "Для чайных станций.", price: "от 410 ₽ / кг", category: ProductCategory.TEA },
    { name: "Холодный чай концентрат 2 л", description: "Линейка персик / лимон.", price: "от 380 ₽", category: ProductCategory.TEA },
    { name: "Чайные пирамидки ассорти 60 шт", description: "Премиум-сегмент.", price: "от 720 ₽", category: ProductCategory.TEA }
  ];

  const equipItems: ProdIn[] = [
    { name: "Кофемашина Jura E8", description: "Автомат, капучино одной кнопкой.", price: "от 189 000 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Кофемашина DeLonghi ECAM", description: "Компактная для офиса.", price: "от 52 000 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Кофемолка Mazzer Mini", description: "Жернова 64 мм.", price: "от 48 000 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Фильтр для воды Brita Purity", description: "Снижение жёсткости.", price: "от 12 000 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Водонагреватель проточный 8 л", description: "Для чайной станции.", price: "от 35 000 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Кофемашина суперавтомат Franke", description: "Для высокой проходимости.", price: "от 890 000 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Помпа для молока 4 л", description: "Холодильная установка.", price: "от 8 500 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Кофемолка Fiorenzato F64", description: "Для спешелти.", price: "от 62 000 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Фильтр-кувшин для кофейни", description: "Комплект картриджей на год.", price: "от 4 200 ₽", category: ProductCategory.EQUIPMENT },
    { name: "Темпер и подставка 58 мм", description: "Профессиональный бариста-набор.", price: "от 3 800 ₽", category: ProductCategory.EQUIPMENT }
  ];

  const dishesItems: ProdIn[] = [
    { name: "Стакан для латте 300 мл", description: "Закалённое стекло, 24 шт.", price: "от 4 200 ₽ / уп.", category: ProductCategory.DISHES },
    { name: "Чашка и блюдце эспрессо 90 мл", description: "Фарфор белый.", price: "от 2 800 ₽ / компл.", category: ProductCategory.DISHES },
    { name: "Чайник заварочный 600 мл", description: "Керамика, несколько цветов.", price: "от 1 900 ₽", category: ProductCategory.DISHES },
    { name: "Блюдца для капучино 145 мм", description: "Импорт, 12 шт.", price: "от 3 100 ₽", category: ProductCategory.DISHES },
    { name: "Питчер для молока 600 мл", description: "Нержавеющая сталь.", price: "от 1 200 ₽", category: ProductCategory.DISHES },
    { name: "Стакан двойной стенки 350 мл", description: "Для фильтр-кофе.", price: "от 890 ₽", category: ProductCategory.DISHES },
    { name: "Поднос деревянный 40×30", description: "Для подачи.", price: "от 2 400 ₽", category: ProductCategory.DISHES },
    { name: "Сахарница с крышкой", description: "Фарфор.", price: "от 650 ₽", category: ProductCategory.DISHES },
    { name: "Набор чайный 6 персон", description: "Подарочная упаковка.", price: "от 8 900 ₽", category: ProductCategory.DISHES },
    { name: "Колба для холодного кофе 1 л", description: "Стекло.", price: "от 1 450 ₽", category: ProductCategory.DISHES }
  ];

  const serviceRepairItems: ProdIn[] = [
    { name: "Диагностика кофемашины", description: "Выезд в пределах МКАД.", price: "от 2 500 ₽", category: ProductCategory.SERVICE },
    { name: "Ремонт гидросистемы", description: "Запчасти по согласованию.", price: "от 8 000 ₽", category: ProductCategory.SERVICE },
    { name: "Доставка и установка оборудования", description: "Подключение к воде.", price: "от 5 000 ₽", category: ProductCategory.SERVICE },
    { name: "Плановое ТО раз в квартал", description: "Договор на сеть.", price: "от 12 000 ₽ / точка", category: ProductCategory.SERVICE },
    { name: "Замена жерновов", description: "Работы + материалы.", price: "от 6 500 ₽", category: ProductCategory.SERVICE },
    { name: "Чистка от накипи и калибровка", description: "Полный цикл.", price: "от 3 200 ₽", category: ProductCategory.SERVICE },
    { name: "Настройка помола под меню", description: "Выезд бариста-техника.", price: "от 4 500 ₽", category: ProductCategory.SERVICE },
    { name: "Ремонт электроники платы", description: "Срок 3–5 дней.", price: "от 9 000 ₽", category: ProductCategory.SERVICE },
    { name: "Модернизация молочной системы", description: "Совместимость с моделями Jura.", price: "от 15 000 ₽", category: ProductCategory.SERVICE },
    { name: "Гарантийный ремонт по договору", description: "SLA 48 часов.", price: "по договору", category: ProductCategory.SERVICE }
  ];

  const serviceTrainingItems: ProdIn[] = [
    { name: "Курс бариста «База» 3 дня", description: "Эспрессо, молочная графика.", price: "24 000 ₽ / чел.", category: ProductCategory.SERVICE },
    { name: "Онлайн-тренинг по фильтру", description: "2 часа, запись.", price: "3 500 ₽", category: ProductCategory.SERVICE },
    { name: "Калибровка кофемолок на точке", description: "До 3 устройств.", price: "от 8 000 ₽", category: ProductCategory.SERVICE },
    { name: "Обучение персонала сети 2 дня", description: "Выезд по РФ.", price: "от 80 000 ₽", category: ProductCategory.SERVICE },
    { name: "Сертификация SCA Introduction", description: "Подготовка к экзамену.", price: "18 000 ₽", category: ProductCategory.SERVICE },
    { name: "Латте-арт интенсив 1 день", description: "Малые группы.", price: "12 000 ₽", category: ProductCategory.SERVICE },
    { name: "Курс «Чайная карта»", description: "Заваривание и подача.", price: "9 000 ₽", category: ProductCategory.SERVICE },
    { name: "Вебинар по обслуживанию кофемашин", description: "Для управляющих.", price: "бесплатно", category: ProductCategory.SERVICE },
    { name: "Стажировка на обжарке", description: "1 день, Москва.", price: "15 000 ₽", category: ProductCategory.SERVICE },
    { name: "Аудит качества напитков", description: "Чек-лист и отчёт.", price: "от 25 000 ₽", category: ProductCategory.SERVICE }
  ];

  /** Прочее: смешанные категории Prisma */
  const miscItems: ProdIn[] = [
    { name: "Сироп карамель 1 л", description: "Для коктейлей и кофе.", price: "от 420 ₽", category: ProductCategory.SYRUPS_AND_BEVERAGES, isSampleAvailable: true },
    { name: "Тоник премиум 1 л", description: "Для барной линейки.", price: "от 380 ₽", category: ProductCategory.SYRUPS_AND_BEVERAGES },
    { name: "Фруктовый монин 0,7 л", description: "Ассорти вкусов.", price: "от 290 ₽", category: ProductCategory.SYRUPS_AND_BEVERAGES },
    { name: "Сахарные стики 5 г × 1000", description: "Для самообслуживания.", price: "от 1 100 ₽", category: ProductCategory.FOOD_PRODUCTS },
    { name: "Мед порционный 20 г × 200", description: "К чаю и латте.", price: "от 2 400 ₽", category: ProductCategory.FOOD_PRODUCTS },
    { name: "Печенье для кофейни 2 кг", description: "Коробка опт.", price: "от 1 800 ₽", category: ProductCategory.FOOD_PRODUCTS },
    { name: "Салфетки бумажные белые 500 шт", description: "Барные.", price: "от 420 ₽", category: ProductCategory.TEXTILE },
    { name: "Фартук бариста с логотипом", description: "Индивидуальный пошив от 50 шт.", price: "от 890 ₽ / шт", category: ProductCategory.TEXTILE },
    { name: "Молоко ультрапастеризованное 1 л × 12", description: "Для капучино.", price: "от 720 ₽ / уп.", category: ProductCategory.DAIRY },
    { name: "Сливки барные 10% 1 л", description: "Устойчивые к взбиванию.", price: "от 650 ₽", category: ProductCategory.DAIRY }
  ];

  const allProductRows = [
    ...pushProducts(cKofe.companyId, coffeeItems),
    ...pushProducts(cChay.companyId, teaItems),
    ...pushProducts(cProf.companyId, equipItems),
    ...pushProducts(cPosuda.companyId, dishesItems),
    ...pushProducts(cServis.companyId, serviceRepairItems, "repair"),
    ...pushProducts(cObuch.companyId, serviceTrainingItems, "training"),
    ...pushProducts(cKofe.companyId, miscItems.slice(0, 5)),
    ...pushProducts(cPosuda.companyId, miscItems.slice(5))
  ];

  await prisma.product.createMany({ data: allProductRows });

  // Одно спецпредложение для демонстрации партнёрской витрины
  await prisma.specialOffer.create({
    data: {
      companyId: cKofe.companyId,
      title: "Скидка 5% на первый опт",
      description: "Для новых клиентов HoReCa при заказе от 100 кг.",
      price: "по запросу",
      imageUrl: "/images/products/coffee.svg",
      isActive: true
    }
  });

  // --- Лента спроса: 8 активных заявок ---
  const demands = await Promise.all([
    prisma.demandRequest.create({
      data: {
        title: "Закупка зерна для сети кофеен",
        description: "Арабика и бленды, поставки еженедельно, Москва и МО.",
        category: ProductCategory.COFFEE,
        quantity: "40 кг / нед.",
        deadline: "постоянно",
        budget: "договорная",
        status: DemandStatus.ACTIVE,
        visitorId: visitor1.id
      }
    }),
    prisma.demandRequest.create({
      data: {
        title: "Чай листовой для пяти точек",
        description: "Чёрный и зелёный, стабильное качество партий.",
        category: ProductCategory.TEA,
        quantity: "до 50 кг / мес.",
        deadline: "до 30.09.2026",
        budget: "до 400 000 ₽",
        status: DemandStatus.ACTIVE,
        visitorId: visitor1.id
      }
    }),
    prisma.demandRequest.create({
      data: {
        title: "Оборудование для чайной станции",
        description: "Чайники с температурными режимами, фильтры.",
        category: ProductCategory.EQUIPMENT,
        quantity: "комплект на 2 точки",
        deadline: "до 01.12.2026",
        budget: "до 250 000 ₽",
        status: DemandStatus.ACTIVE,
        visitorId: visitor2.id
      }
    }),
    prisma.demandRequest.create({
      data: {
        title: "Посуда и сервировка под новый бренд",
        description: "Фарфор и стекло, брендирование логотипа.",
        category: ProductCategory.DISHES,
        quantity: "партия от 200 комплектов",
        deadline: "квартал 4 2026",
        budget: "до 600 000 ₽",
        status: DemandStatus.ACTIVE,
        visitorId: visitor2.id
      }
    }),
    prisma.demandRequest.create({
      data: {
        title: "Сервисное обслуживание парка машин",
        description: "15 кофемашин в Москве, график ТО.",
        category: ProductCategory.SERVICE,
        quantity: "ежеквартально",
        budget: "до 150 000 ₽ / квартал",
        status: DemandStatus.ACTIVE,
        visitorId: visitor1.id
      }
    }),
    prisma.demandRequest.create({
      data: {
        title: "Обучение персонала сети (40 человек)",
        description: "Бариста база + работа с молоком.",
        category: ProductCategory.SERVICE,
        quantity: "2 волны по 20 чел.",
        deadline: "август 2026",
        budget: "до 900 000 ₽",
        status: DemandStatus.ACTIVE,
        visitorId: visitor2.id
      }
    }),
    prisma.demandRequest.create({
      data: {
        title: "Сиропы и топпинги для барной стойки",
        description: "Ассортимент не менее 15 вкусов.",
        category: ProductCategory.SYRUPS_AND_BEVERAGES,
        quantity: "опт от 50 л / мес.",
        budget: "до 200 000 ₽ / мес.",
        status: DemandStatus.ACTIVE,
        visitorId: visitor1.id
      }
    }),
    prisma.demandRequest.create({
      data: {
        title: "Расходники и текстиль для кофеен",
        description: "Салфетки, сахар, молочные продукты — единый поставщик.",
        category: ProductCategory.FOOD_PRODUCTS,
        quantity: "ежемесячно",
        deadline: "долгосрочно",
        budget: "договорная",
        status: DemandStatus.ACTIVE,
        visitorId: visitor2.id
      }
    })
  ]);

  // --- Отклики экспонентов (5) на разные заявки ---
  await prisma.bid.createMany({
    data: [
      {
        demandId: demands[0].id,
        companyId: cKofe.companyId,
        proposal:
          "Готовы закрепить объёмы по фиксированной цене на квартал, образцы зерна — бесплатно при отгрузке.",
        price: "от 1 200 ₽ / кг",
        contactEmail: "opt@kofe-plus.seed",
        contactPhone: "+7 499 400-00-01",
        status: BidStatus.ACCEPTED
      },
      {
        demandId: demands[2].id,
        companyId: cProf.companyId,
        proposal: "Комплект чайников с PID и фильтрами Brita, монтаж и обучение персонала включены.",
        price: "от 175 000 ₽ за комплект на точку",
        contactEmail: "sales@prof-oborud.seed",
        contactPhone: "+7 495 200-00-03",
        status: BidStatus.PENDING
      },
      {
        demandId: demands[3].id,
        companyId: cPosuda.companyId,
        proposal: "Фарфор и стекло под ваш бренд, образцы и макеты до подписания контракта.",
        price: "от 520 ₽ / комплект",
        contactEmail: "order@posuda-lux.seed",
        contactPhone: "+7 812 400-00-04",
        status: BidStatus.PENDING
      },
      {
        demandId: demands[4].id,
        companyId: cServis.companyId,
        proposal: "Договор ТО на парк из 15 машин, SLA 24 ч по Москве, резервные кофемашины по запросу.",
        price: "от 135 000 ₽ / квартал",
        contactEmail: "service@servis-pro.seed",
        contactPhone: "+7 499 500-00-05",
        status: BidStatus.PENDING
      },
      {
        demandId: demands[5].id,
        companyId: cObuch.companyId,
        proposal: "Две волны по 20 человек, выезд тренеров в регионы, материалы и сертификаты.",
        price: "от 780 000 ₽",
        contactEmail: "school@barista-school.seed",
        contactPhone: "+7 495 600-00-06",
        status: BidStatus.DECLINED
      }
    ]
  });

  const productCount = await prisma.product.count();
  const demandCount = await prisma.demandRequest.count({ where: { status: DemandStatus.ACTIVE } });
  const bidCount = await prisma.bid.count();

  console.log("Seed ЭКСПО 365 OK:", {
    passwordUsers: SEED_USER_PASSWORD,
    adminDemoForInvestors: { email: "demo@expo365.ru", password: "demo123", role: "ADMIN" },
    demoLoginDev: {
      exhibitor: { email: "stand@expo365.ru", password: "demo123" },
      visitor: { email: "buyer@expo365.ru", password: "buyer123" }
    },
    visitors: [visitor1.email, visitor2.email, "buyer@expo365.ru"],
    exhibitors: companiesMeta.map((c) => c.name),
    productsTotal: productCount,
    demandsActive: demandCount,
    bids: bidCount,
    publicShowcaseExamples: {
      kofePlus: `/company/${cKofe.companyId}`,
      chaynaya: `/company/${cChay.companyId}`,
      demoStand: `/company/${demoCompany.id}`
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
