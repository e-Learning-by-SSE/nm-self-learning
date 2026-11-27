ALTER TABLE "User" ADD COLUMN "isDeletionPlaceholder" BOOLEAN NOT NULL DEFAULT false;
UPDATE "User" SET "isDeletionPlaceholder" = true
WHERE "name" ~ '^anonymous-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND "displayName" = 'Deleted User';

CREATE TABLE "DailySignIn" (
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    CONSTRAINT "DailySignIn_pkey" PRIMARY KEY ("userId", "day"),
    CONSTRAINT "DailySignIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "DailySignIn_day_idx" ON "DailySignIn"("day");
CREATE TABLE "SignInTracking" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SignInTracking_pkey" PRIMARY KEY ("id")
);
INSERT INTO "SignInTracking" ("id") VALUES (1);
