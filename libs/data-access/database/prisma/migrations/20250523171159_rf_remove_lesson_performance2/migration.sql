/*
  Warnings:

  - You are about to drop the column `userId` on the `AchievementProgress` table. All the data in the column will be lost.
  - You are about to drop the `CoursePerformance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username,achievementId]` on the table `AchievementProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `AchievementProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AchievementProgress" DROP CONSTRAINT "AchievementProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "CoursePerformance" DROP CONSTRAINT "CoursePerformance_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CoursePerformance" DROP CONSTRAINT "CoursePerformance_userId_fkey";

-- DropIndex
DROP INDEX "AchievementProgress_userId_achievementId_key";

-- AlterTable
ALTER TABLE "AchievementProgress" DROP COLUMN "userId",
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "CoursePerformance";

-- CreateTable
CREATE TABLE "LearningActivity" (
    "activityId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningActivity_pkey" PRIMARY KEY ("activityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AchievementProgress_username_achievementId_key" ON "AchievementProgress"("username", "achievementId");

-- AddForeignKey
ALTER TABLE "AchievementProgress" ADD CONSTRAINT "AchievementProgress_username_fkey" FOREIGN KEY ("username") REFERENCES "GamificationProfile"("username") ON DELETE CASCADE ON UPDATE CASCADE;
