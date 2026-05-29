import { TRPCError } from "@trpc/server";
import { Message } from "@self-learning/ai-tutor";
import z from "zod";

const llmApiResponseSchema = z.object({
	choices: z.array(
		z.object({
			message: z.object({
				content: z.string(),
				role: z.string()
			})
		})
	)
});

interface LlmConfig {
	serverUrl: string;
	apiKey: string | null;
	defaultModel: string;
}

/**
 * Send a chat request to the LLM server with the given messages and configuration.
 *
 * This function handles the communication with the LLM server, including error handling and response validation.
 * It sends a POST request to the LLM server's /chat/completions endpoint with the conversation history and configuration parameters.
 * The response is expected to contain a choices array with the assistant's reply, which is then validated against a schema.
 * If the response format is invalid or if there are any communication errors, appropriate TRPC errors are thrown.
 *
 * @param messages Conversation with chat bot, containing of system prompt, user requests, and LLM responses.
 * @param config LLM server configuration including URL, API key, and default model.
 * @param options Additional options to customize the LLM request (e.g., temperature, max_tokens).
 * @returns The content of the LLM's response message. May contain a <think> tag, which is not intended to be rendered on (or even sent to) the client.
 * @throws TRPCError if there are communication issues with the LLM server or if the response format is invalid.
 */
export async function sendChatRequest(
	messages: Message[],
	config: LlmConfig,
	options: Record<string, unknown> = {}
) {
	const TIMEOUT_MS = 30000; // 30 seconds timeout for LLM response
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

		const response = await fetch(`${config.serverUrl}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
			},
			body: JSON.stringify({
				messages,
				model: config.defaultModel,
				temperature: 0.7,
				max_tokens: 2000,
				stream: false,

				...options
			}),
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (!response.ok) {
			throw handleHttpError(response.status);
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

		const firstChoice = validated.data.choices[0];

		if (!firstChoice || typeof firstChoice.message?.content !== "string") {
			console.error("[LlmClientService] LLM response missing first choice content");
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Invalid response format from LLM server"
			});
		}

		return firstChoice.message.content;
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

function handleHttpError(status: number): TRPCError {
	const error = errorMap[status] || errorMap[500];
	return new TRPCError({
		code: error.code,
		message: error.message
	});
}

const errorMap: Record<number, { code: TRPCError["code"]; message: string }> = {
	400: { code: "BAD_REQUEST", message: "Invalid request to LLM server" },
	401: { code: "UNAUTHORIZED", message: "LLM API authentication failed" },
	403: { code: "FORBIDDEN", message: "Access to LLM API forbidden" },
	404: { code: "NOT_FOUND", message: "LLM API endpoint not found" },
	429: { code: "TOO_MANY_REQUESTS", message: "LLM API rate limit exceeded" },
	500: { code: "INTERNAL_SERVER_ERROR", message: "LLM server internal error" },
	502: { code: "BAD_GATEWAY", message: "LLM server unavailable" },
	503: { code: "SERVICE_UNAVAILABLE", message: "LLM server temporarily unavailable" }
};
