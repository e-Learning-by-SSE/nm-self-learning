-- CreateTable
CREATE TABLE "LearnPath" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teachingGoals" TEXT[],
    "lessons" TEXT[],

    CONSTRAINT "LearnPath_pkey" PRIMARY KEY ("id")
);
