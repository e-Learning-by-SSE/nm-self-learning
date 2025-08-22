-- CreateTable
CREATE TABLE "llm_configurations" (
    "id" TEXT NOT NULL,
    "serverUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "defaultModel" TEXT NOT NULL,
    "availableModels" JSONB DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_configurations_pkey" PRIMARY KEY ("id")
);
