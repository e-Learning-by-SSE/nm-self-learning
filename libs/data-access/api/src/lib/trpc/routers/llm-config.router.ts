import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { TRPCError } from "@trpc/server";
import { secondsToMilliseconds } from "date-fns";

const llmConfigSchema = z.object({
	serverUrl: z.string().url(),
	apiKey: z.string().optional(),
	defaultModel: z.string().min(1)
});

const llmConfigSchemaForFetching = z.object({
	serverUrl: z.string().url(),
	apiKey: z.string().optional()
});

export const llmConfigRouter = t.router({
	get: adminProcedure.query(async () => {
		const config = await database.llmConfiguration.findFirst({
			where: { isActive: true },
			select: {
				id: true,
				serverUrl: true,
				defaultModel: true,
				isActive: true,
				createdAt: true,
				updatedAt: true
			}
		});

		if (!config) {
			return null;
		}

		const hasApiKey = await database.llmConfiguration.findFirst({
			where: { id: config.id, apiKey: { not: null } },
			select: { id: true }
		});

		return {
			...config,
			hasApiKey: !!hasApiKey,
			apiKey: hasApiKey ? "****" : undefined
		};
	}),

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

	save: adminProcedure.input(llmConfigSchema).mutation(async ({ input }) => {
		try {
			const { serverUrl, apiKey, defaultModel } = input;

			try {
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
				});
			}

			const existingConfig = await database.llmConfiguration.findFirst({
				where: { isActive: true }
			});

			if (existingConfig) {
				const updatedConfig = await database.llmConfiguration.update({
					where: { id: existingConfig.id },
					data: {
						serverUrl,
						apiKey: apiKey || null,
						defaultModel,
						updatedAt: new Date()
					},
					select: {
						id: true,
						serverUrl: true,
						defaultModel: true,
						isActive: true,
						createdAt: true,
						updatedAt: true
					}
				});

				return {
					...updatedConfig,
					hasApiKey: !!apiKey,
					apiKey: apiKey ? "****" : undefined
				};
			} else {
				const newConfig = await database.llmConfiguration.create({
					data: {
						serverUrl,
						apiKey: apiKey || null,
						defaultModel,
						isActive: true
					},
					select: {
						id: true,
						serverUrl: true,
						defaultModel: true,
						isActive: true,
						createdAt: true,
						updatedAt: true
					}
				});

				return {
					...newConfig,
					hasApiKey: !!apiKey,
					apiKey: apiKey ? "****" : undefined
				};
			}
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
				return {
					valid: true,
					availableModels: models.map((model: any) => model.name)
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
