import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { useAiTutor } from "./use-ai-tutor";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import type { Message, PageContext } from "../utils/types";

// ---------------------------------------------------------------------------
// Global mock setup
// ---------------------------------------------------------------------------

global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
		text: () => Promise.resolve(""),
		status: 200,
		statusText: "OK"
	})
) as jest.Mock;

if (typeof AbortController === "undefined") {
	class FakeAbortSignal implements AbortSignal {
		aborted = false;
		onabort: ((this: AbortSignal, ev: Event) => void) | null = null;
		reason: unknown = undefined;

		addEventListener = jest.fn();
		removeEventListener = jest.fn();
		dispatchEvent = jest.fn(() => false);

		throwIfAborted(): void {
			if (this.aborted) {
				throw new DOMException("The operation was aborted.", "AbortError");
			}
		}
	}

	class FakeAbortController {
		signal: FakeAbortSignal = new FakeAbortSignal();

		abort() {
			this.signal.aborted = true;
			if (this.signal.onabort) {
				this.signal.onabort(new Event("abort"));
			}
		}
	}

	(global as typeof globalThis & { AbortController: unknown }).AbortController =
		FakeAbortController;
}

// ---------------------------------------------------------------------------
// next/navigation mock
//
// jest.mock() factories are hoisted by Babel before any module-level code
// runs. Babel's scope checker only permits variables whose names begin with
// "mock" (case-insensitive) to be referenced inside a factory. Using a plain
// name (e.g. `nextNavigation`) causes a ReferenceError at transform time.
//
// Solution: name the shared state object `mockNextNavigation` so Babel allows
// it, and close over the *object reference* (not a primitive `let`) so the
// mock functions always read the latest property values at call time.
// ---------------------------------------------------------------------------

const mockNextNavigation = {
	pathname: "/",
	searchParams: new URLSearchParams()
};

jest.mock("next/navigation", () => ({
	usePathname: () => mockNextNavigation.pathname,
	useSearchParams: () => mockNextNavigation.searchParams
}));

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

interface LlmConfig {
	serverUrl: string;
	defaultModel: string;
	apiKey: string;
}

interface MutationState {
	mutateAsync: jest.Mock;
	isPending: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sets the pathname that `usePathname()` returns for the current test.
 * Mutates `mockNextNavigation.pathname` so the already-hoisted mock factory
 * picks up the new value on every subsequent call.
 */
const setWindowPath = (pathname: string): void => {
	mockNextNavigation.pathname = pathname;
	window.history.pushState({}, "", pathname);
};

/**
 * Sets a query parameter that `useSearchParams()` returns for the current test.
 */
const setSearchParam = (key: string, value: string): void => {
	mockNextNavigation.searchParams = new URLSearchParams({ [key]: value });
};

function setupMutation(overrides: Partial<MutationState> = {}): jest.Mock {
	const mockMutateAsync = overrides.mutateAsync ?? jest.fn();

	(trpc.aiTutor.sendMessage.useMutation as jest.Mock).mockReturnValue({
		mutateAsync: mockMutateAsync,
		isPending: overrides.isPending ?? false
	} satisfies MutationState);

	return mockMutateAsync;
}

function setupLlmConfig(config: LlmConfig): void {
	(trpc.llmConfig.get.useQuery as jest.Mock).mockReturnValue({ data: config });
}

const defaultConfig: LlmConfig = {
	serverUrl: "http://localhost:8000",
	defaultModel: "gpt-3.5-turbo",
	apiKey: "test-key"
};

// ---------------------------------------------------------------------------
// useAiTutor tests
// ---------------------------------------------------------------------------

describe("useAiTutor", () => {
	let mockMutateAsync: jest.Mock<Promise<{ content: string }>, []>;

	beforeEach(() => {
		// Reset navigation state before clearing mocks so the object is clean
		mockNextNavigation.pathname = "/";
		mockNextNavigation.searchParams = new URLSearchParams();
		window.history.pushState({}, "", "/");

		jest.clearAllMocks();
		jest.useFakeTimers();

		// Re-apply mock return values after clearAllMocks wipes them
		mockMutateAsync = setupMutation();
		setupLlmConfig(defaultConfig);
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		mockNextNavigation.pathname = "/";
		mockNextNavigation.searchParams = new URLSearchParams();
		window.history.pushState({}, "", "/");
	});

	// =========================================================================
	describe("Initial state", () => {
		// =========================================================================

		it("initializes with an empty messages array", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.messages).toEqual([]);
		});

		it("initializes with an empty input string", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.input).toBe("");
		});

		it("initializes with the tutor closed", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.isTutorOpen).toBe(false);
		});

		it("initializes with no active animation", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.isAnimating).toBe(false);
		});

		it("initializes with a null pageContext", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.pageContext).toBeNull();
		});

		it("exposes the LLM config returned by the query hook", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.config).toEqual(defaultConfig);
		});

		it("initializes with hideToggle as false", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.hideToggle).toBe(false);
		});
	});

	// =========================================================================
	describe("detectPageContext", () => {
		// =========================================================================

		it("detects a course context from a /courses/<slug> URL", () => {
			// Setup
			setWindowPath("/courses/intro-typescript");
			const { result } = renderHook(() => useAiTutor());
			const expected: PageContext = {
				type: "course",
				courseSlug: "intro-typescript"
			};

			// Exercise
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify
			expect(result.current.pageContext).toEqual(expected);
		});

		it("detects a lesson context from a /courses/<course>/<lesson> URL", () => {
			// Setup
			setWindowPath("/courses/intro-typescript/variables-types");
			const { result } = renderHook(() => useAiTutor());
			const expected: PageContext = {
				type: "lesson",
				courseSlug: "intro-typescript",
				lessonSlug: "variables-types"
			};

			// Exercise
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify
			expect(result.current.pageContext).toEqual(expected);
		});

		it("sets a null context when not on a course or lesson page", () => {
			// Setup
			setWindowPath("/about");
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify
			expect(result.current.pageContext).toBeNull();
		});

		it("handles locale-prefixed URLs like /en/courses/<course>/<lesson>", () => {
			// Setup
			setWindowPath("/en/courses/advanced-react/hooks-deep-dive");
			const { result } = renderHook(() => useAiTutor());
			const expected: PageContext = {
				type: "lesson",
				courseSlug: "advanced-react",
				lessonSlug: "hooks-deep-dive"
			};

			// Exercise
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify
			expect(result.current.pageContext).toEqual(expected);
		});
	});

	// =========================================================================
	describe("sendMessage", () => {
		// =========================================================================

		it("appends a user message and an assistant reply, then clears the input", async () => {
			// Setup
			mockMutateAsync.mockResolvedValue({
				content: "TypeScript is a typed superset of JavaScript."
			});
			const { result } = renderHook(() => useAiTutor());
			const expectedMessages: Message[] = [
				{ role: "user", content: "What is TypeScript?" },
				{
					role: "assistant",
					content: "TypeScript is a typed superset of JavaScript."
				}
			];

			// Exercise
			act(() => {
				result.current.setInput("What is TypeScript?");
			});
			await act(async () => {
				await result.current.sendMessage();
			});

			// Verify
			expect(result.current.messages).toEqual(expectedMessages);
			expect(result.current.input).toBe("");
		});

		it("does nothing when the input is blank or whitespace-only", async () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.setInput("   ");
			});
			await act(async () => {
				await result.current.sendMessage();
			});

			// Verify
			expect(mockMutateAsync).not.toHaveBeenCalled();
			expect(result.current.messages).toHaveLength(0);
		});

		it("includes the current pageContext in the mutation payload", async () => {
			// Setup
			setWindowPath("/courses/intro-typescript");
			mockMutateAsync.mockResolvedValue({ content: "Response" });
			const { result } = renderHook(() => useAiTutor());

			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});
			expect(result.current.pageContext).toEqual({
				type: "course",
				courseSlug: "intro-typescript"
			});

			act(() => {
				result.current.setInput("Question");
			});

			// Exercise
			await act(async () => {
				await result.current.sendMessage();
			});

			// Verify
			expect(mockMutateAsync).toHaveBeenCalledWith({
				messages: [{ role: "user", content: "Question" }],
				pageContext: { type: "course", courseSlug: "intro-typescript" }
			});
		});

		it("restores the original input and shows an error toast when the API call fails", async () => {
			// Setup
			mockMutateAsync.mockRejectedValue(new Error("API Error"));
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.setInput("What is TypeScript?");
			});
			await act(async () => {
				await result.current.sendMessage();
			});

			// Verify
			expect(result.current.messages).toHaveLength(0);
			expect(result.current.input).toBe("What is TypeScript?");
			expect(showToast).toHaveBeenCalledWith({
				type: "error",
				title: "Message Failed",
				subtitle: "API Error"
			});
		});

		it("handles a non-Error rejection by passing its string form to the toast", async () => {
			// Setup
			mockMutateAsync.mockRejectedValue("Unknown error");
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.setInput("Question");
			});
			await act(async () => {
				await result.current.sendMessage();
			});

			// Verify
			expect(showToast).toHaveBeenCalledWith({
				type: "error",
				title: "Message Failed",
				subtitle: "Unknown error"
			});
		});

		it("trims leading and trailing whitespace from the input before sending", async () => {
			// Setup
			mockMutateAsync.mockResolvedValue({ content: "Response" });
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.setInput("  What is TypeScript?  ");
			});
			await act(async () => {
				await result.current.sendMessage();
			});

			// Verify
			expect(result.current.messages[0].content).toBe("What is TypeScript?");
		});

		it("accumulates messages across multiple turns in the conversation", async () => {
			// Setup
			mockMutateAsync
				.mockResolvedValueOnce({ content: "First response" })
				.mockResolvedValueOnce({ content: "Second response" });
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.setInput("First question");
			});
			await act(async () => {
				await result.current.sendMessage();
			});

			act(() => {
				result.current.setInput("Second question");
			});
			await act(async () => {
				await result.current.sendMessage();
			});

			// Verify
			expect(result.current.messages).toHaveLength(4);
			expect(result.current.messages.map((m: Message) => m.content)).toEqual([
				"First question",
				"First response",
				"Second question",
				"Second response"
			]);
		});
	});

	// =========================================================================
	describe("handleKeyDown", () => {
		// =========================================================================

		it("sends the message and prevents the default action on Enter (without Shift)", async () => {
			// Setup
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

			// Exercise
			await act(async () => {
				result.current.handleKeyDown(event);
			});

			// Verify
			expect(event.preventDefault).toHaveBeenCalled();
			expect(mockMutateAsync).toHaveBeenCalled();
		});

		it("does not send the message on Shift+Enter (soft line break)", async () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());
			act(() => {
				result.current.setInput("Question");
			});
			const event = {
				key: "Enter",
				shiftKey: true,
				preventDefault: jest.fn()
			} as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

			// Exercise
			await act(async () => {
				result.current.handleKeyDown(event);
			});

			// Verify
			expect(event.preventDefault).not.toHaveBeenCalled();
			expect(mockMutateAsync).not.toHaveBeenCalled();
		});

		it("does not trigger a send for any other key", async () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());
			act(() => {
				result.current.setInput("Question");
			});
			const event = {
				key: "a",
				shiftKey: false,
				preventDefault: jest.fn()
			} as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

			// Exercise
			await act(async () => {
				result.current.handleKeyDown(event);
			});

			// Verify
			expect(mockMutateAsync).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	describe("toggleTutor", () => {
		// =========================================================================

		it("opens the tutor after the animation delay", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify
			expect(result.current.isTutorOpen).toBe(true);
			expect(result.current.isAnimating).toBe(false);
		});

		it("closes the tutor when it is already open", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});
			expect(result.current.isTutorOpen).toBe(true);

			// Exercise
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify
			expect(result.current.isTutorOpen).toBe(false);
		});

		it("detects and stores the page context when toggled", () => {
			// Setup
			setWindowPath("/courses/intro-typescript");
			const { result } = renderHook(() => useAiTutor());
			const expected: PageContext = {
				type: "course",
				courseSlug: "intro-typescript"
			};

			// Exercise
			act(() => {
				result.current.toggleTutor();
				jest.advanceTimersByTime(400);
			});

			// Verify
			expect(result.current.pageContext).toEqual(expected);
		});
	});

	// =========================================================================
	describe("closeTutor", () => {
		// =========================================================================

		it("sets isTutorOpen to false immediately", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.closeTutor();
			});

			// Verify
			expect(result.current.isTutorOpen).toBe(false);
		});
	});

	// =========================================================================
	describe("clearChat", () => {
		// =========================================================================

		it("empties the message list and resets the input field", async () => {
			// Setup
			mockMutateAsync.mockResolvedValue({ content: "Response" });
			const { result } = renderHook(() => useAiTutor());
			act(() => {
				result.current.setInput("Question");
			});
			await act(async () => {
				await result.current.sendMessage();
			});
			expect(result.current.messages.length).toBeGreaterThan(0);

			// Exercise
			act(() => {
				result.current.clearChat();
			});

			// Verify
			expect(result.current.messages).toEqual([]);
			expect(result.current.input).toBe("");
		});
	});

	// =========================================================================
	describe("isLoading", () => {
		// =========================================================================

		it("returns true when the mutation is pending", () => {
			// Setup
			setupMutation({ isPending: true });

			// Exercise
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.isLoading).toBe(true);
		});

		it("returns false when the mutation is not pending", () => {
			// Setup
			setupMutation({ isPending: false });

			// Exercise
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.isLoading).toBe(false);
		});
	});

	// =========================================================================
	describe("setInput", () => {
		// =========================================================================

		it("updates the input state to the provided value", () => {
			// Setup
			const { result } = renderHook(() => useAiTutor());

			// Exercise
			act(() => {
				result.current.setInput("New input");
			});

			// Verify
			expect(result.current.input).toBe("New input");
		});
	});

	// =========================================================================
	describe("hideToggle", () => {
		// =========================================================================

		it("sets hideToggle to true and closes the tutor when the modal=open query param is present", () => {
			// Setup
			setSearchParam("modal", "open");
			const { result } = renderHook(() => useAiTutor());

			// Verify — the useEffect fires on mount and reads searchParams
			expect(result.current.hideToggle).toBe(true);
			expect(result.current.isTutorOpen).toBe(false);
		});

		it("keeps hideToggle as false when the modal query param is absent", () => {
			// Setup — mockNextNavigation.searchParams is empty (reset in beforeEach)
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.hideToggle).toBe(false);
		});

		it("keeps hideToggle as false when the modal query param has a value other than 'open'", () => {
			// Setup
			setSearchParam("modal", "closed");
			const { result } = renderHook(() => useAiTutor());

			// Verify
			expect(result.current.hideToggle).toBe(false);
		});

		it("resets hideToggle to false when the modal query param is removed", () => {
			// Setup — start with modal=open
			setSearchParam("modal", "open");
			const { result, rerender } = renderHook(() => useAiTutor());
			expect(result.current.hideToggle).toBe(true);

			// Exercise — update the shared object and re-render inside act so React
			// processes the state updates triggered by the useEffect
			act(() => {
				mockNextNavigation.searchParams = new URLSearchParams();
				rerender();
			});

			// Verify
			expect(result.current.hideToggle).toBe(false);
		});
	});
});
