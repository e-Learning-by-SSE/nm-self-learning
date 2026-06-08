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

export const openAiModelList = z.object({
	data: z.array(
		z.object({
			id: z.string()
		})
	)
});

export interface ServerConfig {
	serverUrl: string;
	apiKey?: string;
	defaultModel: string;
	updatedAt?: Date;
}
