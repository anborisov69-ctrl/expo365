/**
 * Ранее: копирование title → name. Поле title у Product удалено; скрипт оставлен как заглушка.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`migrate-product-schema: актуальная схема Product без title; записей продуктов: ${count}`);
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
