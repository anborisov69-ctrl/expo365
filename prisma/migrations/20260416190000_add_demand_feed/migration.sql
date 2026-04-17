-- AlterTable: экспертиза компании для отборов в ленте спроса
ALTER TABLE "Company" ADD COLUMN "expertiseCategories" TEXT NOT NULL DEFAULT '[]';
