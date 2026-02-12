import { z } from "zod";

export const llmConfigSchema = z.object({
	serverUrl: z.string().url(),
	apiKey: z.string().optional(),
	defaultModel: z.string().min(1)
});

export const llmConfigSchemaForFetching = z.object({
	serverUrl: z.string().url(),
	apiKey: z.string().optional()
});

export const ollamaModelList = z.object({
	models: z.array(
		z.object({
			name: z.string()
		})
	)
});

export interface ServerConfig {
	serverUrl: string;
	apiKey?: string;
	defaultModel: string;
	updatedAt?: Date;
}
