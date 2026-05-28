import { adminProcedure, authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { TRPCError } from "@trpc/server";
import { secondsToMilliseconds } from "date-fns";
import { llmConfigSchema, llmConfigSchemaForFetching, openAiModelList } from "@self-learning/types";

/**
 * Fetches available models from the LLM server.
 * @param serverUrl The URL of the LLM server.
 * @param apiKey Optional API key for authentication.
 * @param timeoutSeconds Optional timeout in seconds (default: 10).
 */
async function fetchAvailableModels(serverUrl: string, apiKey?: string, timeoutSeconds = 10) {
	const headers: Record<string, string> = {
		"Content-Type": "application/json"
	};

	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), secondsToMilliseconds(timeoutSeconds));
	const response = await fetch(serverUrl + "/models", {
		method: "GET",
		headers,
		signal: controller.signal
	});
	clearTimeout(timeoutId);
	if (!response.ok) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: `${response.statusText}`
		});
	}

	const data = await response.json();
	return openAiModelList.parse(data);
}

export async function fetchLlmConfig() {
	const config = await database.llmConfiguration.findFirst({
		where: { isActive: true },
		select: {
			serverUrl: true,
			defaultModel: true,
			updatedAt: true,
			apiKey: true
		}
	});

	if (config) {
		return {
			...config,
			apiKey: config.apiKey ?? undefined
		};
	} else {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "No configuration data found."
		});
	}
}

export const llmConfigRouter = t.router({
	get: authProcedure.query(async () => {
		const config = await fetchLlmConfig();
		if (!config) {
			return null;
		}

		const { apiKey, ...rest } = config;

		return {
			...rest,
			hasApiKey: !!apiKey
		};
	}),

	save: adminProcedure.input(llmConfigSchema).mutation(async ({ input }) => {
		try {
			const { serverUrl, apiKey, defaultModel } = input;

			try {
				const availableModels = await fetchAvailableModels(serverUrl, apiKey);
				const modelExists = availableModels.data.some(m => m.id === defaultModel);

				if (!modelExists) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "This Model is not available on the server."
					});
				}
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Failed to validate LLM configuration."
				});
			}

			const existingConfig = await database.llmConfiguration.findFirst({
				where: { isActive: true }
			});

			const config = await database.llmConfiguration.upsert({
				where: { id: existingConfig?.id || crypto.randomUUID() },
				update: {
					serverUrl,
					apiKey: apiKey || null,
					defaultModel,
					updatedAt: new Date()
				},
				create: {
					serverUrl,
					apiKey: apiKey || null,
					defaultModel,
					isActive: true
				},
				select: {
					id: true,
					serverUrl: true,
					defaultModel: true,
					updatedAt: true
				}
			});

			return {
				...config,
				hasApiKey: !!apiKey
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to save LLM configuration"
			});
		}
	}),

	getAvailableModels: adminProcedure
		.input(llmConfigSchemaForFetching)
		.mutation(async ({ input }) => {
			try {
				const { serverUrl, apiKey } = input;
				const availableModels = await fetchAvailableModels(serverUrl, apiKey);
				return {
					valid: true,
					availableModels: availableModels.data.map(m => m.id)
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch available models"
				});
			}
		})
});
