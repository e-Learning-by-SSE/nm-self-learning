/*
  Warnings:

  - You are about to drop the `LearnPath` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LearnPath";

-- CreateTable
CREATE TABLE "LessonPool" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teachingGoals" TEXT[],
    "lessons" TEXT[],

    CONSTRAINT "LessonPool_pkey" PRIMARY KEY ("id")
);
