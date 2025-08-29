/*
  Warnings:

  - You are about to drop the column `repositoryId` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the `llm_configurations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skill-repositories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `skills` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "skill-repositories" DROP CONSTRAINT "skill-repositories_ownerName_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_repositoryId_fkey";

-- DropIndex
DROP INDEX "skills_repositoryId_name_key";

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "repositoryId",
ADD COLUMN     "authorId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "llm_configurations";

-- DropTable
DROP TABLE "skill-repositories";

-- CreateTable
CREATE TABLE "_courseRequiredSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_courseProvidedSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_courseRequiredSkills_AB_unique" ON "_courseRequiredSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_courseRequiredSkills_B_index" ON "_courseRequiredSkills"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_courseProvidedSkills_AB_unique" ON "_courseProvidedSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_courseProvidedSkills_B_index" ON "_courseProvidedSkills"("B");

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseRequiredSkills" ADD CONSTRAINT "_courseRequiredSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseRequiredSkills" ADD CONSTRAINT "_courseRequiredSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseProvidedSkills" ADD CONSTRAINT "_courseProvidedSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseProvidedSkills" ADD CONSTRAINT "_courseProvidedSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
