import { database } from "@self-learning/database";

export interface LlmConfig {
  serverUrl: string;
  apiKey?: string;
  defaultModel: string;
}

export async function getLlmConfiguration(): Promise<LlmConfig | null> {
  try {
    const config = await database.llmConfiguration.findFirst({
      where: { isActive: true }
    });

    if (!config) {
      return null;
    }

    return {
      serverUrl: config.serverUrl,
      apiKey: config.apiKey || undefined,
      defaultModel: config.defaultModel
    };
  } catch (error) {
    console.error('Failed to fetch LLM configuration:', error);
    return null;
  }
}