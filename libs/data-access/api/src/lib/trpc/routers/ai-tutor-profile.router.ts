import { TRPCError } from "@trpc/server";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { aiTutorProfileSchema } from "@self-learning/types";
import { fetchAvailableModels, fetchLlmConfig } from "./llm-config.router";

export async function getModels() {
	const config = await fetchLlmConfig();
	if (!config) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "LLM configuration not found"
		});
	}
	const models = await fetchAvailableModels(
		config.serverUrl,
		config.apiKey ? config.apiKey : undefined
	);
	return {
		valid: true,
		models: models.models.map(m => m.name)
	};
}

export const aiTutorProfileRouter = t.router({
	getModels: authProcedure.mutation(async () => {
		return getModels();
	}),

	getAll: authProcedure.query(async () => {
		const profiles = await database.aiTutorProfile.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				description: true,
				avatarUrl: true,
				systemPrompt: true,
				model: true,
				author: true,
				createdAt: true,
				updatedAt: true
			}
		});
		return profiles;
	}),

	save: authProcedure.input(aiTutorProfileSchema).mutation(async ({ input }) => {
		if (input.model === undefined) {
			const llmConfig = await fetchLlmConfig();
			if (!llmConfig) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No default model configured"
				});
			}
			input.model = llmConfig.defaultModel;
		}
		try {
			const profile = await database.aiTutorProfile.upsert({
				where: { id: input.id || crypto.randomUUID() },
				update: {
					name: input.name,
					description: input.description,
					avatarUrl: input.avatarUrl,
					systemPrompt: input.systemPrompt,
					model: input.model,
					author: input.author
				},
				create: {
					name: input.name,
					description: input.description,
					avatarUrl: input.avatarUrl,
					systemPrompt: input.systemPrompt,
					model: input.model,
					author: input.author
				},
				select: {
					id: true,
					name: true,
					description: true,
					avatarUrl: true,
					systemPrompt: true,
					model: true,
					author: true,
					updatedAt: true
				}
			});
			return profile;
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to save profile data"
			});
		}
	}),

	delete: authProcedure.input(aiTutorProfileSchema).mutation(async ({ input, ctx }) => {
		return database.aiTutorProfile.delete({
			where: {
				id: input.id,
				author: ctx.user.name
			}
		});
	})
});
