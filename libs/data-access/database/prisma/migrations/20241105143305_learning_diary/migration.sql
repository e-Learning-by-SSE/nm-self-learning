/*
  Warnings:

  - You are about to drop the `LearningDiary` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ownerName,name]` on the table `skill-repositories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LearningProgress" AS ENUM ('NOT_STARTED', 'STARTED', 'FINISHED');

-- CreateEnum
CREATE TYPE "LearningGoalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "LearningDiary" DROP CONSTRAINT "LearningDiary_username_fkey";

-- DropForeignKey
ALTER TABLE "skill-repositories" DROP CONSTRAINT "skill-repositories_ownerId_fkey";

-- DropIndex
DROP INDEX "skill-repositories_ownerId_name_key";

-- AlterTable
ALTER TABLE "skill-repositories" ADD COLUMN     "ownerName" TEXT;

-- DropTable
DROP TABLE "LearningDiary";

-- CreateTable
CREATE TABLE "LearningDiaryPage" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "hasRead" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scope" INTEGER NOT NULL DEFAULT 0,
    "distractionLevel" INTEGER NOT NULL DEFAULT 0,
    "effortLevel" INTEGER NOT NULL DEFAULT 0,
    "learningLocationId" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "totalDurationLearnedMs" INTEGER,

    CONSTRAINT "LearningDiaryPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconURL" TEXT,
    "defaultLocation" BOOLEAN NOT NULL DEFAULT false,
    "creatorName" TEXT,

    CONSTRAINT "LearningLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningStrategie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "LearningStrategie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningTechnique" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creatorName" TEXT,
    "defaultTechnique" BOOLEAN NOT NULL DEFAULT false,
    "learningStrategieId" TEXT NOT NULL,

    CONSTRAINT "LearningTechnique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechniqueRating" (
    "score" INTEGER NOT NULL,
    "techniqueId" TEXT NOT NULL,
    "diaryPageId" TEXT NOT NULL,
    "creatorName" TEXT NOT NULL,

    CONSTRAINT "TechniqueRating_pkey" PRIMARY KEY ("diaryPageId","techniqueId")
);

-- CreateTable
CREATE TABLE "LearningDiaryLearnedLessons" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "LearningDiaryLearnedLessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningGoal" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "LearningGoalStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastProgressUpdate" TIMESTAMP(3),
    "username" TEXT NOT NULL,
    "learningDiaryPageId" TEXT,

    CONSTRAINT "LearningGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningSubGoal" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "LearningGoalStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastProgressUpdate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "priority" SERIAL NOT NULL,
    "learningGoalId" TEXT NOT NULL,

    CONSTRAINT "LearningSubGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSettings" (
    "username" TEXT NOT NULL,
    "learningStatistics" BOOLEAN NOT NULL DEFAULT true,
    "hasLearningDiary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentSettings_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "resourceId" TEXT,
    "courseId" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningLocation_name_creatorName_key" ON "LearningLocation"("name", "creatorName");

-- CreateIndex
CREATE UNIQUE INDEX "LearningStrategie_name_key" ON "LearningStrategie"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill-repositories_ownerName_name_key" ON "skill-repositories"("ownerName", "name");

-- AddForeignKey
ALTER TABLE "LearningDiaryPage" ADD CONSTRAINT "LearningDiaryPage_studentName_fkey" FOREIGN KEY ("studentName") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningDiaryPage" ADD CONSTRAINT "LearningDiaryPage_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "Course"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningDiaryPage" ADD CONSTRAINT "LearningDiaryPage_learningLocationId_fkey" FOREIGN KEY ("learningLocationId") REFERENCES "LearningLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningLocation" ADD CONSTRAINT "LearningLocation_creatorName_fkey" FOREIGN KEY ("creatorName") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTechnique" ADD CONSTRAINT "LearningTechnique_creatorName_fkey" FOREIGN KEY ("creatorName") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTechnique" ADD CONSTRAINT "LearningTechnique_learningStrategieId_fkey" FOREIGN KEY ("learningStrategieId") REFERENCES "LearningStrategie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueRating" ADD CONSTRAINT "TechniqueRating_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "LearningTechnique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueRating" ADD CONSTRAINT "TechniqueRating_diaryPageId_fkey" FOREIGN KEY ("diaryPageId") REFERENCES "LearningDiaryPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueRating" ADD CONSTRAINT "TechniqueRating_creatorName_fkey" FOREIGN KEY ("creatorName") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningDiaryLearnedLessons" ADD CONSTRAINT "LearningDiaryLearnedLessons_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "LearningDiaryPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningDiaryLearnedLessons" ADD CONSTRAINT "LearningDiaryLearnedLessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("lessonId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningGoal" ADD CONSTRAINT "LearningGoal_username_fkey" FOREIGN KEY ("username") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningGoal" ADD CONSTRAINT "LearningGoal_learningDiaryPageId_fkey" FOREIGN KEY ("learningDiaryPageId") REFERENCES "LearningDiaryPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningSubGoal" ADD CONSTRAINT "LearningSubGoal_learningGoalId_fkey" FOREIGN KEY ("learningGoalId") REFERENCES "LearningGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSettings" ADD CONSTRAINT "StudentSettings_username_fkey" FOREIGN KEY ("username") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill-repositories" ADD CONSTRAINT "skill-repositories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
