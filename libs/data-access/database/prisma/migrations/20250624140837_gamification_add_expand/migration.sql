/*
  Warnings:

  - A unique constraint covering the columns `[username,lessonId]` on the table `CompletedLesson` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AchievementTrigger" AS ENUM ('lesson_completed', 'daily_login', 'session_time', 'streak_check', 'manual');

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('all', 'user', 'admin', 'author');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('courseReminder', 'streakReminderFirst', 'streakReminderLast');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'push');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'SKIPPED');

-- DropIndex
DROP INDEX "CompletedLesson_username_lessonId_idx";

-- AlterTable
ALTER TABLE "CompletedLesson" ADD COLUMN     "performanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" 
ADD COLUMN     "acceptedExperimentTerms" TIMESTAMP(3),
ADD COLUMN     "declinedExperimentTerms" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GamificationProfile" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginStreak" JSONB NOT NULL DEFAULT '{"count": 0, "status": "active", "pauseUntil": null}',
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 2,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GamificationProfile_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trigger" "AchievementTrigger" NOT NULL,
    "meta" JSONB,
    "requiredValue" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementProgress" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progressValue" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,

    CONSTRAINT "AchievementProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "props" JSONB NOT NULL,
    "displayFrom" TIMESTAMP(3) NOT NULL,
    "displayUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "targetAudience" "AudienceType" NOT NULL DEFAULT 'all',

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationUser" (
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "seenAt" TIMESTAMP(3),

    CONSTRAINT "NotificationUser_pkey" PRIMARY KEY ("notificationId","userId")
);

-- CreateTable
CREATE TABLE "UserNotificationSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "ReminderStatus" NOT NULL,
    "error" TEXT,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "GamificationProfile_userId_key" ON "GamificationProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementProgress_username_achievementId_key" ON "AchievementProgress"("username", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSetting_userId_type_channel_key" ON "UserNotificationSetting"("userId", "type", "channel");

-- CreateIndex
CREATE INDEX "ReminderLog_userId_templateKey_sentAt_idx" ON "ReminderLog"("userId", "templateKey", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Features_username_key" ON "Features"("username");



-- AddForeignKey
ALTER TABLE "GamificationProfile" ADD CONSTRAINT "GamificationProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementProgress" ADD CONSTRAINT "AchievementProgress_username_fkey" FOREIGN KEY ("username") REFERENCES "GamificationProfile"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementProgress" ADD CONSTRAINT "AchievementProgress_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationUser" ADD CONSTRAINT "NotificationUser_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationUser" ADD CONSTRAINT "NotificationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationSetting" ADD CONSTRAINT "UserNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Features" ADD CONSTRAINT "Features_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
