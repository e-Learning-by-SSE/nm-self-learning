-- AlterTable
ALTER TABLE "LearningGoal" ADD COLUMN     "order" SERIAL NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "LearningGoal" ADD CONSTRAINT "LearningGoal_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LearningGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
