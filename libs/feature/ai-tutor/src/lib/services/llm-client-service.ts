import { TRPCError } from "@trpc/server";
import { Message, llmApiResponseSchema, LlmConfig, errorMap } from "@self-learning/types";

export class LlmClientService {
	private static readonly TIMEOUT_MS = 30000;

	async sendChatRequest(messages: Message[], config: LlmConfig): Promise<string> {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), LlmClientService.TIMEOUT_MS);

			const response = await fetch(`${config.serverUrl}/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
				},
				body: JSON.stringify({
					messages,
					model: config.defaultModel,
					stream: false,
					temperature: 0.7,
					maxTokens: 1000
				}),
				signal: controller.signal
			});

			clearTimeout(timeout);

			if (!response.ok) {
				throw this.handleHttpError(response.status);
			}

			const data = await response.json();
			const validated = llmApiResponseSchema.safeParse(data);

			if (!validated.success) {
				console.error("[LlmClientService] Invalid LLM response format", {
					errors: validated.error
				});
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Invalid response format from LLM server"
				});
			}
			return validated.data.message.content;
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			if (error instanceof Error && error.name === "AbortError") {
				console.error("[LlmClientService] Request timeout");
				throw new TRPCError({
					code: "TIMEOUT",
					message: "LLM server request timed out"
				});
			}
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to communicate with LLM server"
			});
		}
	}

	private handleHttpError(status: number): TRPCError {
		const error = errorMap[status] || errorMap[500];
		return new TRPCError({
			code: error.code,
			message: error.message
		});
	}
}

export const llmClientService = new LlmClientService();
