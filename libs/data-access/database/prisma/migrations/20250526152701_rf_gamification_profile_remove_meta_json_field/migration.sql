/*
  Warnings:

  - You are about to drop the column `meta` on the `GamificationProfile` table. All the data in the column will be lost.
  - The `loginStreak` column on the `GamificationProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `LearningActivity` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "GamificationProfile" DROP COLUMN "meta",
ADD COLUMN     "flames" JSONB NOT NULL DEFAULT '{"count": 0, "maxStatus": 3}',
DROP COLUMN "loginStreak",
ADD COLUMN     "loginStreak" JSONB NOT NULL DEFAULT '{"count": 0, "status": "active", "pauseUntil": null}';

-- DropTable
DROP TABLE "LearningActivity";
