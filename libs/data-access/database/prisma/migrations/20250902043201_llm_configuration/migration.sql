-- CreateTable
CREATE TABLE "LlmConfiguration" (
    "id" TEXT NOT NULL,
    "serverUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "defaultModel" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LlmConfiguration_pkey" PRIMARY KEY ("id")
);
