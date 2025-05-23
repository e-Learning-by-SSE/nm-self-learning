/*
  Warnings:

  - You are about to drop the column `completedAt` on the `AchievementProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AchievementProgress" DROP COLUMN "completedAt",
ADD COLUMN     "redeemedAt" TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT;
