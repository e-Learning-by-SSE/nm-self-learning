/*
  Warnings:

  - You are about to drop the column `enabledFeatureLearningDiary` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `enabledLearningStatistics` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "enabledFeatureLearningDiary",
DROP COLUMN "enabledLearningStatistics";

