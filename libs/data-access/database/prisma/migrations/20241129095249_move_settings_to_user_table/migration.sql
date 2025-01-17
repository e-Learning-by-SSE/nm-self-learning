/*
  Warnings:

  - You are about to drop the `StudentSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudentSettings" DROP CONSTRAINT "StudentSettings_username_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "enabledFeatureLearningDiary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enabledLearningStatistics" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registrationCompleted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "StudentSettings";
