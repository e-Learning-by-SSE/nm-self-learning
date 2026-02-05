-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'STARTED', 'ABORTED', 'FINISHED');

-- CreateTable
CREATE TABLE "JobQueue" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "cause" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobQueue_pkey" PRIMARY KEY ("id")
);
