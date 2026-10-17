/*
  Warnings:

  - The values [SKIPPED] on the enum `ReminderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Enrollment` table will be changed to an UUID, existing entries will be updated.
  - You are about to drop the column `repositoryId` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the `skill-repositories` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[courseId,username]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,skillId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorId` to the `skills` table, existing authorIds will be discovered and populated before making the column non-nullable.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('STATIC', 'DYNAMIC');

-- AlterEnum
BEGIN;
CREATE TYPE "ReminderStatus_new" AS ENUM ('SCHEDULED', 'SENT', 'FAILED');
ALTER TABLE "ReminderLog" ALTER COLUMN "status" TYPE "ReminderStatus_new" USING ("status"::text::"ReminderStatus_new");
ALTER TYPE "ReminderStatus" RENAME TO "ReminderStatus_old";
ALTER TYPE "ReminderStatus_new" RENAME TO "ReminderStatus";
DROP TYPE "public"."ReminderStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "skill-repositories" DROP CONSTRAINT "skill-repositories_ownerName_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_repositoryId_fkey";

-- DropIndex
DROP INDEX "skills_repositoryId_name_key";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "context" JSONB,
ADD COLUMN     "type" "CourseType" NOT NULL DEFAULT 'STATIC',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable Enrollment
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
ADD COLUMN "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id");
ALTER TABLE "Enrollment"
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "skillId" TEXT;

-- Copy authorId from User through skill-repositories before dropping table
-- 1. Create new column initially as nullable
ALTER TABLE "skills"
ADD COLUMN "authorId" INTEGER;

-- 2. Map user names to ids
UPDATE "skills" AS s
SET "authorId" = a."id"
FROM "skill-repositories" AS sr
JOIN "Author" AS a ON a."username" = sr."ownerName"
WHERE s."repositoryId" = sr."id";

-- 3. Fallback: Assign the first author to any skills that do not have an author
UPDATE "skills"
SET "authorId" = (
    SELECT "id"
    FROM "Author"
    ORDER BY "id" ASC
    LIMIT 1
)
WHERE "authorId" IS NULL;

-- 4. Make authorId NOT NULL
ALTER TABLE "skills"
ALTER COLUMN "authorId" SET NOT NULL;

-- 5. Drop old column (end of migration for authorId)
ALTER TABLE "skills"
DROP COLUMN "repositoryId";

-- DropTable
DROP TABLE "skill-repositories";

-- CreateTable
CREATE TABLE "GeneratedLessonPath" (
    "lessonPathId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "meta" JSONB NOT NULL,
    "courseVersion" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedLessonPath_pkey" PRIMARY KEY ("lessonPathId")
);

-- CreateTable
CREATE TABLE "_StudentToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_courseRequiredSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_courseRequiredSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_courseProvidedSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_courseProvidedSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedLessonPath_slug_username_key" ON "GeneratedLessonPath"("slug", "username");

-- CreateIndex
CREATE INDEX "_StudentToSkill_B_index" ON "_StudentToSkill"("B");

-- CreateIndex
CREATE INDEX "_courseRequiredSkills_B_index" ON "_courseRequiredSkills"("B");

-- CreateIndex
CREATE INDEX "_courseProvidedSkills_B_index" ON "_courseProvidedSkills"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_courseId_username_key" ON "Enrollment"("courseId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_groupId_skillId_key" ON "Permission"("groupId", "skillId");

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedLessonPath" ADD CONSTRAINT "GeneratedLessonPath_username_fkey" FOREIGN KEY ("username") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedLessonPath" ADD CONSTRAINT "GeneratedLessonPath_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToSkill" ADD CONSTRAINT "_StudentToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToSkill" ADD CONSTRAINT "_StudentToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseRequiredSkills" ADD CONSTRAINT "_courseRequiredSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseRequiredSkills" ADD CONSTRAINT "_courseRequiredSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseProvidedSkills" ADD CONSTRAINT "_courseProvidedSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseProvidedSkills" ADD CONSTRAINT "_courseProvidedSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
