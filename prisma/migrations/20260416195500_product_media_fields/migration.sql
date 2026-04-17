-- AlterTable
ALTER TABLE "Product" ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'image';
ALTER TABLE "Product" ADD COLUMN "mediaUrl" TEXT;
