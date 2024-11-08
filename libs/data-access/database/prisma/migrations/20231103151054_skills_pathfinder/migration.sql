-- CreateTable
CREATE TABLE "skill-repositories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "skill-repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "repositoryId" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_requirements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_teachingGoals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_parent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "skill-repositories_ownerId_name_key" ON "skill-repositories"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_repositoryId_name_key" ON "skills"("repositoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_requirements_AB_unique" ON "_requirements"("A", "B");

-- CreateIndex
CREATE INDEX "_requirements_B_index" ON "_requirements"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_teachingGoals_AB_unique" ON "_teachingGoals"("A", "B");

-- CreateIndex
CREATE INDEX "_teachingGoals_B_index" ON "_teachingGoals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_parent_AB_unique" ON "_parent"("A", "B");

-- CreateIndex
CREATE INDEX "_parent_B_index" ON "_parent"("B");

-- AddForeignKey
ALTER TABLE "skill-repositories" ADD CONSTRAINT "skill-repositories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "skill-repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requirements" ADD CONSTRAINT "_requirements_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("lessonId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requirements" ADD CONSTRAINT "_requirements_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teachingGoals" ADD CONSTRAINT "_teachingGoals_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("lessonId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teachingGoals" ADD CONSTRAINT "_teachingGoals_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parent" ADD CONSTRAINT "_parent_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parent" ADD CONSTRAINT "_parent_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;