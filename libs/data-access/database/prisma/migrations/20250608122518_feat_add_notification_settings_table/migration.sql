/*
  Warnings:

  - You are about to drop the column `notificationSettings` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('courseReminder', 'streakReminder');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'push');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "notificationSettings",
ADD COLUMN     "acceptedExperimentTerms" TIMESTAMP(3),
ADD COLUMN     "experimentalFeatures" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "UserNotificationSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSetting_userId_type_channel_key" ON "UserNotificationSetting"("userId", "type", "channel");

-- AddForeignKey
ALTER TABLE "UserNotificationSetting" ADD CONSTRAINT "UserNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
