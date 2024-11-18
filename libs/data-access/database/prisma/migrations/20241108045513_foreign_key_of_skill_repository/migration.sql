/*
  Warnings:

  - You are about to drop the column `ownerId` on the `skill-repositories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerName,name]` on the table `skill-repositories` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ownerName` on table `skill-repositories` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "skill-repositories" DROP CONSTRAINT "skill-repositories_ownerId_fkey";

-- DropIndex
DROP INDEX "skill-repositories_ownerId_name_key";

-- AlterTable
ALTER TABLE "skill-repositories" DROP COLUMN "ownerId",
ALTER COLUMN "ownerName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "skill-repositories_ownerName_name_key" ON "skill-repositories"("ownerName", "name");

-- AddForeignKey
ALTER TABLE "skill-repositories" ADD CONSTRAINT "skill-repositories_ownerName_fkey" FOREIGN KEY ("ownerName") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
