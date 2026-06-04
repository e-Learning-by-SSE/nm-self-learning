-- AlterTable
ALTER TABLE "JobQueue" ADD COLUMN     "context" TEXT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "ragEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ragVersionHash" VARCHAR(128);
