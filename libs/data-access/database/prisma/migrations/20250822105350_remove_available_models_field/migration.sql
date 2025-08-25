/*
  Warnings:

  - You are about to drop the column `availableModels` on the `llm_configurations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "llm_configurations" DROP COLUMN "availableModels";
