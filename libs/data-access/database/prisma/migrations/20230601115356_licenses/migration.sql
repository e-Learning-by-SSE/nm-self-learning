-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('TRADITIONAL', 'SELF_REGULATED');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "lessonType" "LessonType" NOT NULL DEFAULT 'TRADITIONAL',
ADD COLUMN     "licenseId" INTEGER,
ADD COLUMN     "selfRegulatedQuestion" TEXT;

-- CreateTable
CREATE TABLE "License" (
    "licenseId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "licenseText" TEXT,
    "logoUrl" TEXT,
    "oerCompatible" BOOLEAN NOT NULL DEFAULT false,
    "defaultSuggestion" BOOLEAN NOT NULL DEFAULT false,
    "selectable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "License_pkey" PRIMARY KEY ("licenseId")
);

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("licenseId") ON DELETE RESTRICT ON UPDATE RESTRICT;
