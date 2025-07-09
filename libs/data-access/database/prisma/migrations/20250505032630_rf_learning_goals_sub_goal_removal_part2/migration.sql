/*
  Warnings:

  - You are about to drop the `LearningSubGoal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LearningSubGoal" DROP CONSTRAINT "LearningSubGoal_learningGoalId_fkey";

-- DropTable
DROP TABLE "LearningSubGoal";
