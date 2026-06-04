-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultGroupId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultGroupId_fkey" FOREIGN KEY ("defaultGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
