-- AlterTable User: профиль покупателя
ALTER TABLE "User" ADD COLUMN "buyerCompany" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- AlterTable Demand: расширение заявки (таблица остаётся Demand, модель Prisma — DemandRequest)
ALTER TABLE "Demand" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'COFFEE';
ALTER TABLE "Demand" ADD COLUMN "quantity" TEXT;
ALTER TABLE "Demand" ADD COLUMN "deadline" TEXT;
ALTER TABLE "Demand" ADD COLUMN "budget" TEXT;
