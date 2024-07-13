-- CreateEnum
CREATE TYPE "LearningProgeress" AS ENUM ('NOT_STARTED', 'STARTED', 'FINISHED');

-- CreateTable
CREATE TABLE "LearningDiaryEntry" (
    "id" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "distractionLevel" INTEGER NOT NULL,
    "learningLocationId" TEXT NOT NULL,

    CONSTRAINT "LearningDiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultLocation" BOOLEAN NOT NULL DEFAULT false,
    "creatorName" TEXT,

    CONSTRAINT "LearningLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningStrategie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LearningStrategie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningTechnique" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" TEXT,

    CONSTRAINT "LearningTechnique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningTechniqueEvaluation" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "learningStrategieId" TEXT NOT NULL,
    "learningTechniqueId" TEXT NOT NULL,
    "learningDiaryEntryId" TEXT NOT NULL,

    CONSTRAINT "LearningTechniqueEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningGoal" (
    "id" TEXT NOT NULL,
    "learningDiaryEntryId" TEXT NOT NULL,
    "parentGoalId" TEXT,

    CONSTRAINT "LearningGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LearningDiaryEntry" ADD CONSTRAINT "LearningDiaryEntry_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningDiaryEntry" ADD CONSTRAINT "LearningDiaryEntry_studentName_fkey" FOREIGN KEY ("studentName") REFERENCES "Student"("username") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningDiaryEntry" ADD CONSTRAINT "LearningDiaryEntry_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "Course"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningDiaryEntry" ADD CONSTRAINT "LearningDiaryEntry_learningLocationId_fkey" FOREIGN KEY ("learningLocationId") REFERENCES "LearningLocation"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningLocation" ADD CONSTRAINT "LearningLocation_creatorName_fkey" FOREIGN KEY ("creatorName") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTechnique" ADD CONSTRAINT "LearningTechnique_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Student"("username") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTechniqueEvaluation" ADD CONSTRAINT "LearningTechniqueEvaluation_learningStrategieId_fkey" FOREIGN KEY ("learningStrategieId") REFERENCES "LearningStrategie"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTechniqueEvaluation" ADD CONSTRAINT "LearningTechniqueEvaluation_learningTechniqueId_fkey" FOREIGN KEY ("learningTechniqueId") REFERENCES "LearningTechnique"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTechniqueEvaluation" ADD CONSTRAINT "LearningTechniqueEvaluation_learningDiaryEntryId_fkey" FOREIGN KEY ("learningDiaryEntryId") REFERENCES "LearningDiaryEntry"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningGoal" ADD CONSTRAINT "LearningGoal_learningDiaryEntryId_fkey" FOREIGN KEY ("learningDiaryEntryId") REFERENCES "LearningDiaryEntry"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningGoal" ADD CONSTRAINT "LearningGoal_parentGoalId_fkey" FOREIGN KEY ("parentGoalId") REFERENCES "LearningGoal"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
