/*
  Warnings:

  - `_requirements` table will be renamed to `_requiredSkills`.
  - `_teachingGoals` table will be renamed to `_providedSkills`.

*/
-- Drop ForeignKeys
ALTER TABLE "_requirements" DROP CONSTRAINT "_requirements_A_fkey";
ALTER TABLE "_requirements" DROP CONSTRAINT "_requirements_B_fkey";
ALTER TABLE "_teachingGoals" DROP CONSTRAINT "_teachingGoals_A_fkey";
ALTER TABLE "_teachingGoals" DROP CONSTRAINT "_teachingGoals_B_fkey";

-- Rename Tables
ALTER TABLE "_requirements" RENAME TO "_requiredSkills";
ALTER TABLE "_teachingGoals" RENAME TO "_providedSkills";

-- Rename Indexes
ALTER INDEX "_requirements_AB_unique" RENAME TO "_requiredSkills_AB_unique";
ALTER INDEX "_requirements_B_index" RENAME TO "_requiredSkills_B_index";
ALTER INDEX "_teachingGoals_AB_unique" RENAME TO "_providedSkills_AB_unique";
ALTER INDEX "_teachingGoals_B_index" RENAME TO "_providedSkills_B_index";

-- Add ForeignKeys
ALTER TABLE "_requiredSkills" ADD CONSTRAINT "_requiredSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("lessonId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_requiredSkills" ADD CONSTRAINT "_requiredSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_providedSkills" ADD CONSTRAINT "_providedSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("lessonId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_providedSkills" ADD CONSTRAINT "_providedSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
