import { adminProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { TRPCError } from "@trpc/server";
import { secondsToMilliseconds } from "date-fns";
import { llmConfigSchema, llmConfigSchemaForFetching, ollamaModelList } from "@self-learning/types";

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
	const response = await fetch(serverUrl + "/tags", {
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
	return ollamaModelList.parse(data);
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

	return config;
}

export const llmConfigRouter = t.router({
	get: adminProcedure.query(async () => {
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

<<<<<<< HEAD
=======
	getForServerUse: authProcedure.query(async () => {
		const config = await database.llmConfiguration.findFirst({
			where: { isActive: true },
			select: {
				id: true,
				serverUrl: true,
				defaultModel: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				apiKey: true
			}
		});
		return config || null;
	}),

>>>>>>> 69fd3814 (llm configuration ready for merge.)
	save: adminProcedure.input(llmConfigSchema).mutation(async ({ input }) => {
		try {
			const { serverUrl, apiKey, defaultModel } = input;

			try {
<<<<<<< HEAD
				const availableModels = await fetchAvailableModels(serverUrl, apiKey);
				const modelExists = availableModels.models.some(
					m => m.name === defaultModel || m.name.startsWith(defaultModel + ":")
=======
				const headers: Record<string, string> = {
					"Content-Type": "application/json"
				};

				if (apiKey) {
					headers["Authorization"] = `Bearer ${apiKey}`;
				}

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), secondsToMilliseconds(10));
				const response = await fetch(serverUrl + "/tags", {
					method: "GET",
					headers,
					signal: controller.signal
				});
				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Failed to connect to LLM server`
					});
				}

				const data = await response.json();
				const availableModels = data.models || [];
				const modelExists = availableModels.some(
					(model: any) =>
						model.name === defaultModel || model.name.startsWith(defaultModel + ":")
>>>>>>> 69fd3814 (llm configuration ready for merge.)
				);

				if (!modelExists) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Model "${defaultModel}" is not available on the server.`
					});
				}
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Failed to validate LLM configuration."
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
				const headers: Record<string, string> = {
					"Content-Type": "application/json"
				};
				if (apiKey) {
					headers["Authorization"] = `Bearer ${apiKey}`;
				}

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), secondsToMilliseconds(10));
				const response = await fetch(serverUrl + "/tags", {
					method: "GET",
					headers,
					signal: controller.signal
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					if (response.status === 401) {
						throw new TRPCError({
							code: "UNAUTHORIZED",
							message: "Invalid API key or unauthorized access"
						});
					} else {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "Failed to fetch available models."
						});
					}
				}
				const data = await response.json();
				const models = data.models || [];
>>>>>>> 69fd3814 (llm configuration ready for merge.)
				return {
					valid: true,
					availableModels: availableModels.models.map(m => m.name)
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch available models"
					message: "Failed to fetch available models"
				});
			}
		})
});
