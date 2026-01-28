-- AlterTable
ALTER TABLE "_AuthorToCourse" ADD CONSTRAINT "_AuthorToCourse_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_AuthorToCourse_AB_unique";

-- AlterTable
ALTER TABLE "_AuthorToLesson" ADD CONSTRAINT "_AuthorToLesson_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_AuthorToLesson_AB_unique";

-- AlterTable
ALTER TABLE "_AuthorToTeam" ADD CONSTRAINT "_AuthorToTeam_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_AuthorToTeam_AB_unique";

-- AlterTable
ALTER TABLE "_CourseToSpecialization" ADD CONSTRAINT "_CourseToSpecialization_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_CourseToSpecialization_AB_unique";

-- AlterTable
ALTER TABLE "_parent" ADD CONSTRAINT "_parent_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_parent_AB_unique";

-- AlterTable
ALTER TABLE "_providedSkills" ADD CONSTRAINT "_providedSkills_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_providedSkills_AB_unique";

-- AlterTable
ALTER TABLE "_requiredSkills" ADD CONSTRAINT "_requiredSkills_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_requiredSkills_AB_unique";
