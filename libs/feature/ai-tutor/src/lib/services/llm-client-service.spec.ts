// self-learn/libs/feature/src/lib/services/llm-client-service.spec.ts

import "@testing-library/jest-dom";
import { LlmClientService } from "./llm-client-service";
import { TRPCError } from "@trpc/server";
import { Message, LlmConfig } from "@self-learning/types";

// Mock fetch globally
global.fetch = jest.fn();

// Setup AbortController if not available
if (typeof AbortController === "undefined") {
	(global as any).AbortController = class AbortController {
		signal: AbortSignal;

		constructor() {
			this.signal = {
				aborted: false,
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn()
			} as any;
		}

		abort() {
			(this.signal as any).aborted = true;
		}
	};
}

describe("LlmClientService", () => {
	let service: LlmClientService;
	let mockConfig: LlmConfig;

	beforeEach(() => {
		service = new LlmClientService();
		mockConfig = {
			serverUrl: "http://localhost:8000",
			defaultModel: "gpt-3.5-turbo",
			apiKey: "test-api-key"
		};
		jest.clearAllMocks();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe("sendChatRequest", () => {
		const mockMessages: Message[] = [
			{ role: "system", content: "You are a helpful tutor" },
			{ role: "user", content: "What is TypeScript?" }
		];

		it("should successfully send chat request and return response", async () => {
			const mockResponse = {
				message: {
					role: "assistant",
					content: "TypeScript is a typed superset of JavaScript."
				}
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			const result = await service.sendChatRequest(mockMessages, mockConfig);

			expect(result).toBe("TypeScript is a typed superset of JavaScript.");

			expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-api-key"
				},
				body: JSON.stringify({
					messages: mockMessages,
					model: "gpt-3.5-turbo",
					stream: false,
					temperature: 0.7,
					maxTokens: 1000
				}),
				signal: expect.any(AbortSignal)
			});
		});

		it("should send request without Authorization header when apiKey is not provided", async () => {
			const configWithoutKey: LlmConfig = {
				serverUrl: "http://localhost:8000",
				defaultModel: "gpt-3.5-turbo",
				apiKey: null
			};

			const mockResponse = {
				message: {
					role: "assistant",
					content: "Response without auth"
				}
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			await service.sendChatRequest(mockMessages, configWithoutKey);

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: {
						"Content-Type": "application/json"
					}
				})
			);

			const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
			expect(callArgs.headers.Authorization).toBeUndefined();
		});

		it("should throw TRPCError on 401 Unauthorized", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 401
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toThrow(
				TRPCError
			);

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "UNAUTHORIZED"
			});
		});

		it("should throw TRPCError on 403 Forbidden", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 403
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "FORBIDDEN"
			});
		});

		it("should throw TRPCError on 429 Too Many Requests", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 429
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "TOO_MANY_REQUESTS"
			});
		});

		it("should throw TRPCError on 500 Internal Server Error", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 500
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR"
			});
		});

		it("should throw TRPCError on 503 Service Unavailable", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 503
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "SERVICE_UNAVAILABLE"
			});
		});

		it("should handle unknown HTTP status codes with default error", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 418 // I'm a teapot - unusual status code
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR"
			});
		});

		it("should throw TIMEOUT error when request times out", async () => {
			const abortError = new Error("Aborted");
			abortError.name = "AbortError";

			(global.fetch as jest.Mock).mockImplementation(
				() =>
					new Promise((_, reject) => {
						setTimeout(() => reject(abortError), 100);
					})
			);

			const requestPromise = service.sendChatRequest(mockMessages, mockConfig);

			// Fast-forward time to trigger timeout
			jest.advanceTimersByTime(30000);

			await expect(requestPromise).rejects.toMatchObject({
				code: "TIMEOUT",
				message: "LLM server request timed out"
			});
		});

		it("should throw TRPCError when response format is invalid", async () => {
			const invalidResponse = {
				message: {
					// Missing 'content' field
					role: "assistant"
				}
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => invalidResponse
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR",
				message: "Invalid response format from LLM server"
			});
		});

		it("should throw TRPCError when JSON parsing fails", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => {
					throw new Error("Invalid JSON");
				}
			});

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to communicate with LLM server"
			});
		});

		it("should handle network errors", async () => {
			(global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

			await expect(service.sendChatRequest(mockMessages, mockConfig)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to communicate with LLM server"
			});
		});

		it("should clear timeout on successful request", async () => {
			const mockResponse = {
				message: {
					role: "assistant",
					content: "Success"
				}
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

			await service.sendChatRequest(mockMessages, mockConfig);

			expect(clearTimeoutSpy).toHaveBeenCalled();
		});

		it("should use correct request parameters", async () => {
			const mockResponse = {
				message: {
					role: "assistant",
					content: "Response"
				}
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			await service.sendChatRequest(mockMessages, mockConfig);

			const [, requestOptions] = (global.fetch as jest.Mock).mock.calls[0];
			const body = JSON.parse(requestOptions.body);

			expect(body).toMatchObject({
				messages: mockMessages,
				model: "gpt-3.5-turbo",
				stream: false,
				temperature: 0.7,
				maxTokens: 1000
			});
		});

		it("should handle empty message content", async () => {
			const mockResponse = {
				message: {
					role: "assistant",
					content: ""
				}
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			const result = await service.sendChatRequest(mockMessages, mockConfig);

			expect(result).toBe("");
		});

		it("should handle long message content", async () => {
			const longContent = "A".repeat(10000);
			const mockResponse = {
				message: {
					role: "assistant",
					content: longContent
				}
			};

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			const result = await service.sendChatRequest(mockMessages, mockConfig);

			expect(result).toBe(longContent);
			expect(result.length).toBe(10000);
		});
	});

	describe("Error handling edge cases", () => {
		it("should preserve TRPCError when thrown", async () => {
			const customError = new TRPCError({
				code: "BAD_REQUEST",
				message: "Custom error"
			});

			(global.fetch as jest.Mock).mockRejectedValue(customError);

			await expect(service.sendChatRequest([], mockConfig)).rejects.toThrow(customError);
		});

		it("should handle undefined response", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => undefined
			});

			await expect(service.sendChatRequest([], mockConfig)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR"
			});
		});

		it("should handle null response", async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => null
			});

			await expect(service.sendChatRequest([], mockConfig)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR"
			});
		});
	});
});
