import { prisma } from "@/lib/prisma";
import {
  DemandStatus,
  InquiryStatus,
  InquiryType,
  ProductCategory,
  Role
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

/** Пароль для тестовых учёток этого сида (один для экспонента и посетителя). */
const SEED_TEST_PASSWORD = "ApiSeedTest#2026";

const SEED_EXHIBITOR_EMAIL = "api.seed.exhibitor@test.expo365.local";
const SEED_VISITOR_EMAIL = "api.seed.visitor@test.expo365.local";

function getBearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization");
  if (!raw?.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return raw.slice(7).trim() || null;
}

/**
 * Заполнение пустой БД тестовыми пользователями, компанией, новинками и заявками.
 * Только GET. Доступ: `Authorization: Bearer <SEED_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret || secret.trim() === "") {
    return NextResponse.json(
      { success: false, message: "SEED_SECRET не задан в окружении" },
      { status: 503 }
    );
  }

  const token = getBearerToken(request);
  if (!token || token !== secret) {
    return NextResponse.json(
      { success: false, message: "Недостаточно прав или неверный токен" },
      { status: 401 }
    );
  }

  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({
        success: false,
        message:
          "База данных уже содержит пользователей. Повторное заполнение отключено, данные не изменены."
      });
    }

    const passwordHash = await bcrypt.hash(SEED_TEST_PASSWORD, 12);

    await prisma.$transaction(async (tx) => {
      const exhibitor = await tx.user.create({
        data: {
          email: SEED_EXHIBITOR_EMAIL,
          name: "Тестовый экспонент (API seed)",
          password: passwordHash,
          role: Role.EXHIBITOR
        }
      });

      const company = await tx.company.create({
        data: {
          userId: exhibitor.id,
          name: 'ООО «Тест-поставщик API»',
          description: "Тестовая компания для демонстрации кабинета экспонента.",
          website: "https://example.com/api-seed",
          logoUrl: "/expo-365-logo.png",
          contacts: {
            email: "contact@test.expo365.local",
            phone: "+7 499 000-00-11",
            website: "https://example.com/api-seed"
          },
          expertiseCategories: JSON.stringify([
            ProductCategory.COFFEE,
            ProductCategory.TEA
          ])
        }
      });

      const visitor = await tx.user.create({
        data: {
          email: SEED_VISITOR_EMAIL,
          name: "Тестовый посетитель (API seed)",
          password: passwordHash,
          role: Role.VISITOR,
          visitorCompany: 'ООО «Тест-закупка API»',
          phone: "+7 499 000-00-22"
        }
      });

      const productA = await tx.product.create({
        data: {
          companyId: company.id,
          name: "Тестовая новинка: кофейный бленд API",
          description: "Образец новинки в общей ленте и витрине компании.",
          price: "от 1 100 ₽ / кг",
          category: ProductCategory.COFFEE,
          imageUrl: "/images/products/coffee.svg",
          mediaType: "image",
          mediaUrl: null,
          isSampleAvailable: true,
          isPublished: true
        }
      });

      await tx.product.createMany({
        data: [
          {
            companyId: company.id,
            name: "Тестовая новинка: листовой чай API",
            description: "Вторая карточка для проверки каталога.",
            price: "от 520 ₽ / 250 г",
            category: ProductCategory.TEA,
            imageUrl: "/images/products/tea.svg",
            mediaType: "image",
            mediaUrl: null,
            isSampleAvailable: true,
            isPublished: true
          },
          {
            companyId: company.id,
            name: "Тестовая новинка: фильтр для воды API",
            description: "Пример категории оборудование.",
            price: "от 11 500 ₽",
            category: ProductCategory.EQUIPMENT,
            imageUrl: "/images/products/equipment.svg",
            mediaType: "image",
            mediaUrl: null,
            isSampleAvailable: false,
            isPublished: true
          }
        ]
      });

      await tx.demandRequest.createMany({
        data: [
          {
            title: "Тестовая заявка: закупка зерна API",
            description: "Заявка в ленте спроса для проверки откликов.",
            category: ProductCategory.COFFEE,
            quantity: "до 50 кг / мес.",
            deadline: "до 31.12.2026",
            budget: "договорная",
            status: DemandStatus.ACTIVE,
            visitorId: visitor.id
          },
          {
            title: "Тестовая заявка: сервис оборудования API",
            description: "Вторая заявка для списка посетителя.",
            category: ProductCategory.SERVICE,
            quantity: "5 точек",
            deadline: "2026",
            budget: "до 300 000 ₽",
            status: DemandStatus.ACTIVE,
            visitorId: visitor.id
          }
        ]
      });

      await tx.inquiry.create({
        data: {
          visitorId: visitor.id,
          companyId: company.id,
          productId: productA.id,
          customerName: visitor.name,
          customerEmail: SEED_VISITOR_EMAIL,
          customerPhone: "+7 499 000-00-22",
          message: "Тестовый запрос КП через API seed.",
          type: InquiryType.CP,
          status: InquiryStatus.PENDING
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "База данных заполнена"
    });
  } catch (e) {
    console.error("[api/seed]", e);
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка при заполнении базы данных"
      },
      { status: 500 }
    );
  }
}
