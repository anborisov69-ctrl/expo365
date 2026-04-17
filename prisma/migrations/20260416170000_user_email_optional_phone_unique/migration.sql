-- SQLite: email опционален, phone уникален (вход по телефону).
-- Если `prisma migrate` уже применял более ранние версии без дрифта, примените этот файл через migrate deploy.
-- При локальном дрифте используйте: `npx prisma db push`

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "buyerCompany" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_User" ("id", "email", "password", "name", "role", "buyerCompany", "phone", "createdAt", "updatedAt")
SELECT "id", "email", "password", "name", "role", "buyerCompany", "phone", "createdAt", "updatedAt"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

PRAGMA foreign_keys=ON;
