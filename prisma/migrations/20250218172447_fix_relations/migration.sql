/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `Bad` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Bad_postId_userId_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clerkId" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "imageUrl" TEXT,
    "statusMessage" TEXT
);
INSERT INTO "new_User" ("avatarUrl", "clerkId", "createdAt", "email", "id", "imageUrl", "statusMessage", "updatedAt", "username") SELECT "avatarUrl", "clerkId", "createdAt", "email", "id", "imageUrl", "statusMessage", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Bad_userId_idx" ON "Bad"("userId");

-- CreateIndex
CREATE INDEX "Bad_postId_idx" ON "Bad"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Bad_userId_postId_key" ON "Bad"("userId", "postId");
