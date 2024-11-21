/*
  Warnings:

  - Added the required column `description` to the `LearningTechnique` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LearningGoal" ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "LearningStrategie" ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "LearningTechnique" ADD COLUMN     "description" TEXT NOT NULL;
