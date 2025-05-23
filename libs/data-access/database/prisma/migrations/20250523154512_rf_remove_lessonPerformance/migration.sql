/*
  Warnings:

  - You are about to drop the `LessonPerformance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username,lessonId]` on the table `CompletedLesson` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'SKIPPED');

-- DropForeignKey
ALTER TABLE "LessonPerformance" DROP CONSTRAINT "LessonPerformance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonPerformance" DROP CONSTRAINT "LessonPerformance_userId_fkey";

-- DropIndex
DROP INDEX "CompletedLesson_username_lessonId_idx";

-- AlterTable
ALTER TABLE "CompletedLesson" ADD COLUMN     "performanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "LessonPerformance";

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "ReminderStatus" NOT NULL,
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReminderLog_userId_templateKey_sentAt_idx" ON "ReminderLog"("userId", "templateKey", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedLesson_username_lessonId_key" ON "CompletedLesson"("username", "lessonId");

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
