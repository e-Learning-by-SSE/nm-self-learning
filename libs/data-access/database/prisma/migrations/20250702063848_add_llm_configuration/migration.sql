-- CreateTable
CREATE TABLE "llm_configurations" (
    "id" TEXT NOT NULL,
    "server_url" TEXT NOT NULL,
    "api_key" TEXT,
    "default_model" TEXT NOT NULL,
    "availableModels" JSONB DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_configurations_pkey" PRIMARY KEY ("id")
);
