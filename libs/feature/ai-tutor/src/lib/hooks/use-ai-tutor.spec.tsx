// self-learn/libs/feature/ai-tutor/src/lib/hooks/use-ai-tutor.spec.tsx

import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { useAiTutor } from "./use-ai-tutor";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";

// Setup global mocks
global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
		text: () => Promise.resolve(""),
		status: 200,
		statusText: "OK"
	})
) as jest.Mock;

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

// Mock dependencies
jest.mock("@self-learning/api-client", () => ({
	trpc: {
		llmConfig: {
			get: {
				useQuery: jest.fn()
			}
		},
		aiTutor: {
			sendMessage: {
				useMutation: jest.fn()
			}
		}
	}
}));

jest.mock("@self-learning/ui/common", () => ({
	showToast: jest.fn()
}));

jest.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key
	})
}));

// Helper to safely set pathname using History API
const setWindowPath = (pathname: string) => {
	window.history.pushState({}, "", pathname);
};

describe("useAiTutor", () => {
	let mockMutateAsync: jest.Mock;
	const originalLocation = window.location;

	beforeEach(() => {
		// Reset mocks
		mockMutateAsync = jest.fn();

		(trpc.aiTutor.sendMessage.useMutation as jest.Mock).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false
		});

		(trpc.llmConfig.get.useQuery as jest.Mock).mockReturnValue({
			data: {
				serverUrl: "http://localhost:8000",
				defaultModel: "gpt-3.5-turbo",
				apiKey: "test-key"
			}
		});

		// Reset to root path
		window.history.pushState({}, "", "/");

		jest.clearAllMocks();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		// Reset back to original
		window.history.pushState({}, "", "/");
	});

	describe("Initial state", () => {
		it("should initialize with empty messages", () => {
			const { result } = renderHook(() => useAiTutor());

			expect(result.current.messages).toEqual([]);
		});

		it("should initialize with empty input", () => {
			const { result } = renderHook(() => useAiTutor());

			expect(result.current.input).toBe("");
		});

		it("should initialize with tutor closed", () => {
			const { result } = renderHook(() => useAiTutor());

			expect(result.current.isTutorOpen).toBe(false);
		});

		it("should initialize with no animation", () => {
			const { result } = renderHook(() => useAiTutor());

			expect(result.current.isAnimating).toBe(false);
		});

		it("should initialize with null pageContext", () => {
			const { result } = renderHook(() => useAiTutor());

			expect(result.current.pageContext).toBeNull();
		});

		it("should load config on mount", () => {
			const { result } = renderHook(() => useAiTutor());

			expect(result.current.config).toEqual({
				serverUrl: "http://localhost:8000",
				defaultModel: "gpt-3.5-turbo",
				apiKey: "test-key"
			});
		});
	});

	describe("detectPageContext", () => {
		it("should detect course context from URL", () => {
			setWindowPath("/courses/intro-typescript");

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.pageContext).toEqual({
				type: "course",
				courseSlug: "intro-typescript"
			});
		});

		it("should detect lesson context from URL", () => {
			setWindowPath("/courses/intro-typescript/variables-types");

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.pageContext).toEqual({
				type: "lesson",
				courseSlug: "intro-typescript",
				lessonSlug: "variables-types"
			});
		});

		it("should set null context when not on course page", () => {
			setWindowPath("/about");

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.pageContext).toBeNull();
		});

		it("should handle complex URL paths", () => {
			setWindowPath("/en/courses/advanced-react/hooks-deep-dive");

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.pageContext).toEqual({
				type: "lesson",
				courseSlug: "advanced-react",
				lessonSlug: "hooks-deep-dive"
			});
		});
	});

	describe("sendMessage", () => {
		it("should send message and receive response", async () => {
			mockMutateAsync.mockResolvedValue({
				content: "TypeScript is a typed superset of JavaScript."
			});

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("What is TypeScript?");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(result.current.messages).toHaveLength(2);
			expect(result.current.messages[0]).toEqual({
				role: "user",
				content: "What is TypeScript?"
			});
			expect(result.current.messages[1]).toEqual({
				role: "assistant",
				content: "TypeScript is a typed superset of JavaScript."
			});
			expect(result.current.input).toBe("");
		});

		it("should not send empty message", async () => {
			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("   ");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(mockMutateAsync).not.toHaveBeenCalled();
			expect(result.current.messages).toHaveLength(0);
		});

		it("should include pageContext in request", async () => {
			setWindowPath("/courses/intro-typescript");

			mockMutateAsync.mockResolvedValue({
				content: "Response"
			});

			const { result } = renderHook(() => useAiTutor());

			// First toggle to set the context
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify context is set
			expect(result.current.pageContext).toEqual({
				type: "course",
				courseSlug: "intro-typescript"
			});

			// Now send message
			act(() => {
				result.current.setInput("Question");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(mockMutateAsync).toHaveBeenCalledWith({
				messages: [{ role: "user", content: "Question" }],
				pageContext: {
					type: "course",
					courseSlug: "intro-typescript"
				}
			});
		});

		it("should handle API error and restore input", async () => {
			mockMutateAsync.mockRejectedValue(new Error("API Error"));

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("What is TypeScript?");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(result.current.messages).toHaveLength(0);
			expect(result.current.input).toBe("What is TypeScript?");
			expect(showToast).toHaveBeenCalledWith({
				type: "error",
				title: "Message Failed",
				subtitle: "API Error"
			});
		});

		it("should handle unknown error", async () => {
			mockMutateAsync.mockRejectedValue("Unknown error");

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("Question");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(showToast).toHaveBeenCalledWith({
				type: "error",
				title: "Message Failed",
				subtitle: "Unknown error"
			});
		});

		it("should trim whitespace from input", async () => {
			mockMutateAsync.mockResolvedValue({
				content: "Response"
			});

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("  What is TypeScript?  ");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(result.current.messages[0].content).toBe("What is TypeScript?");
		});

		it("should accumulate messages in conversation", async () => {
			mockMutateAsync
				.mockResolvedValueOnce({ content: "First response" })
				.mockResolvedValueOnce({ content: "Second response" });

			const { result } = renderHook(() => useAiTutor());

			// First message
			act(() => {
				result.current.setInput("First question");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			// Second message
			act(() => {
				result.current.setInput("Second question");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(result.current.messages).toHaveLength(4);
			expect(result.current.messages.map(m => m.content)).toEqual([
				"First question",
				"First response",
				"Second question",
				"Second response"
			]);
		});
	});

	describe("handleKeyDown", () => {
		it("should send message on Enter key", async () => {
			mockMutateAsync.mockResolvedValue({ content: "Response" });

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("Question");
			});

			const event = {
				key: "Enter",
				shiftKey: false,
				preventDefault: jest.fn()
			} as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

			await act(async () => {
				result.current.handleKeyDown(event);
			});

			expect(event.preventDefault).toHaveBeenCalled();
			expect(mockMutateAsync).toHaveBeenCalled();
		});

		it("should not send message on Shift+Enter", async () => {
			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("Question");
			});

			const event = {
				key: "Enter",
				shiftKey: true,
				preventDefault: jest.fn()
			} as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

			await act(async () => {
				result.current.handleKeyDown(event);
			});

			expect(event.preventDefault).not.toHaveBeenCalled();
			expect(mockMutateAsync).not.toHaveBeenCalled();
		});

		it("should not send on other keys", async () => {
			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("Question");
			});

			const event = {
				key: "a",
				shiftKey: false,
				preventDefault: jest.fn()
			} as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

			await act(async () => {
				result.current.handleKeyDown(event);
			});

			expect(mockMutateAsync).not.toHaveBeenCalled();
		});
	});

	describe("toggleTutor", () => {
		it("should open tutor", () => {
			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.isTutorOpen).toBe(true);
			expect(result.current.isAnimating).toBe(false);
		});

		it("should close tutor when already open", () => {
			const { result } = renderHook(() => useAiTutor());

			// Open
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.isTutorOpen).toBe(true);

			// Close
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.isTutorOpen).toBe(false);
		});

		it("should detect page context on toggle", () => {
			setWindowPath("/courses/intro-typescript");

			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			expect(result.current.pageContext).toEqual({
				type: "course",
				courseSlug: "intro-typescript"
			});
		});
	});

	describe("closeTutor", () => {
		it("should close tutor immediately", () => {
			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.closeTutor();
			});

			expect(result.current.isTutorOpen).toBe(false);
		});
	});

	describe("clearChat", () => {
		it("should clear messages and input", async () => {
			mockMutateAsync.mockResolvedValue({ content: "Response" });

			const { result } = renderHook(() => useAiTutor());

			// Add some messages
			act(() => {
				result.current.setInput("Question");
			});

			await act(async () => {
				await result.current.sendMessage();
			});

			expect(result.current.messages.length).toBeGreaterThan(0);

			// Clear
			act(() => {
				result.current.clearChat();
			});

			expect(result.current.messages).toEqual([]);
			expect(result.current.input).toBe("");
		});
	});

	describe("isLoading", () => {
		it("should reflect mutation pending state", () => {
			(trpc.aiTutor.sendMessage.useMutation as jest.Mock).mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: true
			});

			const { result } = renderHook(() => useAiTutor());

			expect(result.current.isLoading).toBe(true);
		});

		it("should be false when not loading", () => {
			(trpc.aiTutor.sendMessage.useMutation as jest.Mock).mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false
			});

			const { result } = renderHook(() => useAiTutor());

			expect(result.current.isLoading).toBe(false);
		});
	});

	describe("setInput", () => {
		it("should update input state", () => {
			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.setInput("New input");
			});

			expect(result.current.input).toBe("New input");
		});
	});
});
