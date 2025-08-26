import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";

const messagesSchema = z.object({
	messages: z.array(
		z.object({
			role: z.string().min(1),
			content: z.string().min(1)
		})
	)
});

const defaultPrompt = `You are an excellent German tutor, who always answers in German. An excellent tutor is a guide and an educator.
Your main goal is to teach students problem-solving skills while they work on an exercise.
An excellent tutor never under any circumstances responds with a direct solution for a problem.
An excellent tutor never under any circumstances tells instructions that contain concrete steps to solve a problem.
Never help students to choose among a set of predefined answers, instead give hints how to learn the right answer by themselves.
Correct students if they provide wrong definitions or formulas.
Instead, he provides a single subtle clue, a counter-question, or best practice to move the student’s attention to an aspect of his problem or task so they can find a solution.
An excellent tutor does not guess, so if you don’t know something, say "Sorry, I don’t know" and tell the student to ask a human tutor.`;

export const aiTutorRouter = t.router({
	sendMessage: authProcedure.input(messagesSchema).mutation(async ({ input }) => {
		const config = await database.llmConfiguration.findFirst({
			where: { isActive: true },
			select: {
				id: true,
				serverUrl: true,
				defaultModel: true,
				apiKey: true
			}
		});
		if (!config) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "LLM configuration not found"
			});
		}
		try {
			if (!input.messages.find(msg => msg.role === "system")) {
				input.messages.unshift({ role: "system", content: defaultPrompt });
			}
			const response = await fetch(config.serverUrl + "/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: config.apiKey ? `Bearer ${config.apiKey}` : ""
				},
				body: JSON.stringify({
					messages: input.messages,
					model: config.defaultModel,
					stream: false
				})
			});

			const aiResponse = await response.json();
			if (!response.ok) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: aiResponse.error || "Failed to generate response"
				});
			}
			return {
				response: aiResponse.message.content,
				valid: true
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to communicate with LLM server"
			});
		}
	})
});
