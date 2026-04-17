import {
  BidStatus,
  DemandStatus,
  PrismaClient,
  ProductCategory,
  Role
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Логотип Julius Meinl — локальный файл в `public/brands/` (надёжнее внешнего URL) */
const JULIUS_MEINL_LOGO_PNG = "/brands/julius-meinl.png";

/** Стоковые фото для демо-новинок (Unsplash) */
const SEED_PRODUCT_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  "https://images.unsplash.com/photo-1556679343-c7306c19756b?w=800&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80"
] as const;

const VISITOR_EMAILS = ["ivan.petrov@seed.expo365.local", "anna.sidorova@seed.expo365.local"] as const;
const EXHIBITOR_EMAILS = ["exhibitor.kofe-plus@seed.expo365.local", "exhibitor.chaynaya@seed.expo365.local"] as const;

/** Предыдущие email из старого сида — удаляем при повторном запуске */
const LEGACY_SEED_EMAILS = [
  "seed-buyer1@expo365.local",
  "seed-buyer2@expo365.local",
  "seed-exhibitor-dishes@expo365.local",
  "seed-exhibitor-coffee@expo365.local"
] as const;

/** Учётные записи для кнопок «Войти как демо-…» (только разработка) */
const DEMO_EXHIBITOR_EMAIL = "demo@expo365.ru";
const DEMO_VISITOR_EMAIL = "buyer@expo365.ru";
const ADMIN_EMAIL = "admin@expo365.ru";

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const demoExhibitorPasswordHash = await bcrypt.hash("demo123", 12);
  const demoVisitorPasswordHash = await bcrypt.hash("buyer123", 12);
  const adminPasswordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          ...VISITOR_EMAILS,
          ...EXHIBITOR_EMAILS,
          ...LEGACY_SEED_EMAILS,
          DEMO_EXHIBITOR_EMAIL,
          DEMO_VISITOR_EMAIL,
          ADMIN_EMAIL
        ]
      }
    }
  });

  const demoExhibitorUser = await prisma.user.create({
    data: {
      email: DEMO_EXHIBITOR_EMAIL,
      name: "123",
      password: demoExhibitorPasswordHash,
      role: Role.EXHIBITOR
    }
  });

  await prisma.company.create({
    data: {
      userId: demoExhibitorUser.id,
      name: "123",
      logoUrl: JULIUS_MEINL_LOGO_PNG,
      description:
        "Julius Meinl — легендарный венский кофе и чай для вашего бизнеса.",
      website: "https://www.meinl.com"
    }
  });

  await prisma.user.create({
    data: {
      email: DEMO_VISITOR_EMAIL,
      name: "Демо Посетитель",
      password: demoVisitorPasswordHash,
      role: Role.VISITOR
    }
  });

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: "Администратор",
      password: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  const visitorIvan = await prisma.user.create({
    data: {
      email: VISITOR_EMAILS[0],
      name: "Иван Петров",
      password: passwordHash,
      role: Role.VISITOR,
      visitorCompany: 'ООО «Сеть кофеен «Утро»»',
      phone: "+7 495 100-00-01"
    }
  });

  const visitorAnna = await prisma.user.create({
    data: {
      email: VISITOR_EMAILS[1],
      name: "Анна Сидорова",
      password: passwordHash,
      role: Role.VISITOR,
      visitorCompany: 'ИП «Чайный бутик»',
      phone: "+7 812 200-00-02"
    }
  });

  const exhibitorKofePlusUser = await prisma.user.create({
    data: {
      email: EXHIBITOR_EMAILS[0],
      name: "Кофе Плюс — представитель",
      password: passwordHash,
      role: Role.EXHIBITOR
    }
  });

  const exhibitorChaynayaUser = await prisma.user.create({
    data: {
      email: EXHIBITOR_EMAILS[1],
      name: "Чайная коллекция — представитель",
      password: passwordHash,
      role: Role.EXHIBITOR
    }
  });

  const companyKofePlus = await prisma.company.create({
    data: {
      userId: exhibitorKofePlusUser.id,
      name: "Кофе Плюс",
      logoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      description: "Обжарка, бленды и поставки кофе для HoReCa.",
      website: "https://example.com/kofe-plus",
      expertiseCategories: JSON.stringify([ProductCategory.COFFEE, ProductCategory.EQUIPMENT])
    }
  });

  const companyChaynaya = await prisma.company.create({
    data: {
      userId: exhibitorChaynayaUser.id,
      name: "Чайная коллекция",
      logoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      description: "Премиальный чай, купажи и сервировка для ресторанов.",
      website: "https://example.com/chaynaya-kollektsiya",
      expertiseCategories: JSON.stringify([ProductCategory.TEA, ProductCategory.COFFEE])
    }
  });

  await prisma.product.createMany({
    data: [
      {
        companyId: companyKofePlus.id,
        name: "Арабика Эфиопия Yirgacheffe",
        description: "Светлая обжарка, ноты цитруса и жасмина. Мешок 60 кг.",
        price: "от 1 450 ₽ / кг",
        category: ProductCategory.COFFEE,
        imageUrl: SEED_PRODUCT_IMAGE_URLS[0],
        isSampleAvailable: true
      },
      {
        companyId: companyKofePlus.id,
        name: "Чай ассам для кофеен",
        description: "Гранулированный, для высокого трафика.",
        price: "от 420 ₽ / кг",
        category: ProductCategory.TEA,
        imageUrl: SEED_PRODUCT_IMAGE_URLS[2],
        isSampleAvailable: false
      },
      {
        companyId: companyKofePlus.id,
        name: "Профессиональная кофемолка настольная",
        description: "Жернова 64 мм, для пилотной точки и обучения бариста.",
        price: "от 48 000 ₽",
        category: ProductCategory.EQUIPMENT,
        imageUrl: SEED_PRODUCT_IMAGE_URLS[4],
        isSampleAvailable: false
      },
      {
        companyId: companyChaynaya.id,
        name: "Улун «Молочный улун» премиум",
        description: "Листовой, фасовка для HoReCa, стабильное качество партий.",
        price: "от 890 ₽ / 100 г",
        category: ProductCategory.TEA,
        imageUrl: SEED_PRODUCT_IMAGE_URLS[1],
        isSampleAvailable: true
      },
      {
        companyId: companyChaynaya.id,
        name: "Эспрессо-смесь для чайной «пара»",
        description: "Мягкий бленд для гостей, заказывающих кофе в чайной.",
        price: "от 1 100 ₽ / кг",
        category: ProductCategory.COFFEE,
        imageUrl: SEED_PRODUCT_IMAGE_URLS[3],
        isSampleAvailable: true
      },
      {
        companyId: companyChaynaya.id,
        name: "Чайный сервиз и заварники",
        description: "Керамика и стекло под заварку, брендирование по запросу.",
        price: "от 2 400 ₽ / компл.",
        category: ProductCategory.EQUIPMENT,
        imageUrl: SEED_PRODUCT_IMAGE_URLS[5],
        isSampleAvailable: false
      }
    ]
  });

  const demandIvan1 = await prisma.demandRequest.create({
    data: {
      title: "Закупка зерна для сети кофеен",
      description: "Арабика и бленды, поставки еженедельно, Москва и МО.",
      category: ProductCategory.COFFEE,
      quantity: "40 кг / нед.",
      deadline: "постоянно",
      budget: "договорная",
      status: DemandStatus.ACTIVE,
      visitorId: visitorIvan.id
    }
  });

  const demandIvan2 = await prisma.demandRequest.create({
    data: {
      title: "Чай листовой для нового формата",
      description: "Нужен ассортимент чёрного и зелёного чая для 5 точек.",
      category: ProductCategory.TEA,
      quantity: "до 50 кг / мес.",
      deadline: "до 30.09.2026",
      budget: "до 400 000 ₽",
      status: DemandStatus.ACTIVE,
      visitorId: visitorIvan.id
    }
  });

  const demandAnna1 = await prisma.demandRequest.create({
    data: {
      title: "Оборудование для чайной станции",
      description: "Чайники с температурными режимами, фильтры для воды.",
      category: ProductCategory.EQUIPMENT,
      quantity: "комплект на 2 точки",
      deadline: "до 01.12.2026",
      budget: "до 250 000 ₽",
      status: DemandStatus.ACTIVE,
      visitorId: visitorAnna.id
    }
  });

  const demandAnna2 = await prisma.demandRequest.create({
    data: {
      title: "Поставка кофе под фильтр и эспрессо",
      description: "Ищем надёжного поставщика зерна для бутика с чайной и кофейной картой.",
      category: ProductCategory.COFFEE,
      quantity: "15–20 кг / мес.",
      deadline: "квартал 3–4 2026",
      budget: "от 80 000 ₽ / мес.",
      status: DemandStatus.ACTIVE,
      visitorId: visitorAnna.id
    }
  });

  await prisma.bid.create({
    data: {
      demandId: demandIvan1.id,
      companyId: companyKofePlus.id,
      proposal: "Готовы закрепить объёмы по фиксированной цене на квартал, образцы зерна — бесплатно.",
      price: "от 1 200 ₽ / кг",
      contactEmail: "opt@kofe-plus.seed",
      contactPhone: "+7 499 400-00-04",
      status: BidStatus.ACCEPTED
    }
  });

  await prisma.bid.create({
    data: {
      demandId: demandAnna1.id,
      companyId: companyChaynaya.id,
      proposal: "Поставляем чайное оборудование и обучение персонала, кейсы из HoReCa во вложении.",
      price: "от 120 000 ₽ за комплект",
      contactEmail: "b2b@chaynaya.seed",
      contactPhone: "+7 812 300-00-05",
      status: BidStatus.PENDING
    }
  });

  const productsKofePlus = await prisma.product.count({
    where: { companyId: companyKofePlus.id }
  });
  const productsChaynaya = await prisma.product.count({
    where: { companyId: companyChaynaya.id }
  });

  console.log("Seed OK:", {
    admin: ADMIN_EMAIL,
    demoAccounts: [DEMO_EXHIBITOR_EMAIL, DEMO_VISITOR_EMAIL],
    visitors: [VISITOR_EMAILS[0], VISITOR_EMAILS[1]],
    exhibitors: ["123 (Julius Meinl logo)", "Кофе Плюс", "Чайная коллекция"],
    productsByCompany: { kofePlus: productsKofePlus, chaynaya: productsChaynaya },
    demands: [demandIvan1.id, demandIvan2.id, demandAnna1.id, demandAnna2.id].length,
    bids: 2
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
