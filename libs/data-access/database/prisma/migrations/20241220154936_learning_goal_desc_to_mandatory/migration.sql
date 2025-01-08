/*
  Warnings:

  - Made the column `description` on table `LearningGoal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `LearningSubGoal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LearningGoal" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "LearningSubGoal" ALTER COLUMN "description" SET NOT NULL;
