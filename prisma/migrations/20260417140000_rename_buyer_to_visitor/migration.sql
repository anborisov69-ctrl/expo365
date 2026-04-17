-- Роль в SQLite хранится как TEXT
UPDATE "User" SET role = 'VISITOR' WHERE role = 'BUYER';
