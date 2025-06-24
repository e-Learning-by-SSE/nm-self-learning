/*
  Warnings:

  - You are about to drop the column `flames` on the `GamificationProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GamificationProfile" DROP COLUMN "flames",
ADD COLUMN     "energy" INTEGER NOT NULL DEFAULT 2;
