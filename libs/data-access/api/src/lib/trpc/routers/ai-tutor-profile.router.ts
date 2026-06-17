import { TRPCError } from "@trpc/server";
import { adminProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { aiTutorProfileSchema, deleteProfileSchema } from "@self-learning/types";
import { fetchAvailableModels, fetchLlmConfig } from "./llm-config.router";

export const aiTutorProfileRouter = t.router({
	// Fetches models from the configured LLM server — admin-only operation.
	getModels: adminProcedure.mutation(async () => {
		return getModels();
	}),

	// Returns all profiles ordered by creation date — admin-only operation.
	getAll: adminProcedure.query(async () => {
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
		return profiles.map(p => ({
			...p,
			description: p.description ?? undefined,
			avatarUrl: p.avatarUrl ?? undefined,
			model: p.model ?? undefined
		}));
	}),

	// Creates or updates a profile. Falls back to the active LLM default model when no model is explicitly provided.
	save: adminProcedure.input(aiTutorProfileSchema).mutation(async ({ input }) => {
		let model = input.model;

		if (!model) {
			const llmConfig = await fetchLlmConfig();
			model = llmConfig.defaultModel;
		}

		try {
			const id = input.id ?? crypto.randomUUID();
			const profile = await database.aiTutorProfile.upsert({
				where: { id },
				update: {
					name: input.name,
					description: input.description,
					avatarUrl: input.avatarUrl,
					systemPrompt: input.systemPrompt,
					model,
					author: input.author
				},
				create: {
					name: input.name,
					description: input.description,
					avatarUrl: input.avatarUrl,
					systemPrompt: input.systemPrompt,
					model,
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
			console.warn("Failed to save profile data", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to save profile data"
			});
		}
	}),

	// Deletes a profile by ID. The author guard ensures only the profile's creator can delete it.
	delete: adminProcedure.input(deleteProfileSchema).mutation(async ({ input }) => {
		const profile = await database.aiTutorProfile.findUnique({
			where: {
				id: input.id
			}
		});

		if (!profile) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Profile not found"
			});
		}

		try {
			return await database.aiTutorProfile.delete({
				where: {
					id: input.id
				}
			});
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to delete profile"
			});
		}
	})
});

export async function getModels() {
	const config = await fetchLlmConfig();
	if (!config) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "LLM configuration not found"
		});
	}
	const models = await fetchAvailableModels(config.serverUrl, config.apiKey ?? undefined);
	return {
		valid: true,
		models: models.data.map(m => m.id)
	};
}
