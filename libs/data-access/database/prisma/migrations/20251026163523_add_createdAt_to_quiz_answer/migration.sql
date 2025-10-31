-- Add createdAt field in QuizAnswer table
ALTER TABLE "QuizAnswer"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;