/*
  Warnings:

  - You are about to drop the column `enabledFeatureLearningDiary` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `enabledLearningStatistics` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `experimentalFeatures` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "enabledFeatureLearningDiary",
DROP COLUMN "enabledLearningStatistics",
DROP COLUMN "experimentalFeatures";

-- CreateTable
CREATE TABLE "Features" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "learningStatistics" BOOLEAN NOT NULL DEFAULT false,
    "learningDiary" BOOLEAN NOT NULL DEFAULT false,
    "experimental" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Features_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Features_username_key" ON "Features"("username");

-- AddForeignKey
ALTER TABLE "Features" ADD CONSTRAINT "Features_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
