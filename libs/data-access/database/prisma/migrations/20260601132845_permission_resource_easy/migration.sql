/*
  Warnings:

  - A unique constraint covering the columns `[groupId,specializationId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,subjectId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "specializationId" TEXT,
ADD COLUMN     "subjectId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_groupId_specializationId_key" ON "Permission"("groupId", "specializationId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_groupId_subjectId_key" ON "Permission"("groupId", "subjectId");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("specializationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;
