jest.mock("@self-learning/database", () => ({
	database: {
		lesson: { findUnique: jest.fn() },
		course: { findUnique: jest.fn() }
	}
}));

jest.mock("@trpc/server", () => ({
	TRPCError: class TRPCError extends Error {
		code: string;
		constructor({ code, message }: { code: string; message: string }) {
			super(message);
			this.name = "TRPCError";
			this.code = code;
		}
	}
}));

import { database } from "@self-learning/database";
import { TRPCError } from "@trpc/server";
import {
	fetchContextPayload,
	extractUserQuestion,
	buildSystemPrompt,
	cleanResponse
} from "./ai-tutor-utils";
import type {
	PageContext,
	Message,
	ContextPayload,
	LessonwithoutCourseContextPayload
} from "./types";

// ---------------------------------------------------------------------------
// Type helpers – avoid "any"
// ---------------------------------------------------------------------------

/** Subset of the Prisma lesson row returned by the mocked queries. */
interface LessonRow {
	lessonId: string;
	title: string;
}

/** Subset of the Prisma course row returned by the mocked queries. */
interface CourseRow {
	title: string;
	description: string | null;
}

// ---------------------------------------------------------------------------
// fetchContextPayload
// ---------------------------------------------------------------------------

describe("fetchContextPayload", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// =========================================================================
	describe("when pageContext is null", () => {
		// =========================================================================

		it("returns null without querying the database", async () => {
			// Setup
			const pageContext: PageContext | null = null;

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toBeNull();
			expect(database.course.findUnique).not.toHaveBeenCalled();
			expect(database.lesson.findUnique).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	describe("when pageContext is a course", () => {
		// =========================================================================

		it("returns a course context payload when the course exists", async () => {
			// Setup
			const pageContext: PageContext = { type: "course", courseSlug: "my-course" };
			const courseRow: CourseRow = { title: "My Course", description: "A great course" };
			(database.course.findUnique as jest.Mock).mockResolvedValue(courseRow);

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toEqual({
				type: "course",
				courseTitle: "My Course",
				courseDescription: "A great course"
			} satisfies ContextPayload);
		});

		it("returns null when the course does not exist in the database", async () => {
			// Setup
			const pageContext: PageContext = { type: "course", courseSlug: "ghost-course" };
			(database.course.findUnique as jest.Mock).mockResolvedValue(null);

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toBeNull();
		});
	});

	// =========================================================================
	describe("when pageContext is a lesson within a course", () => {
		// =========================================================================

		it("returns a lesson context payload with course information when both exist", async () => {
			// Setup
			const pageContext: PageContext = {
				type: "lesson",
				courseSlug: "my-course",
				lessonSlug: "intro"
			};
			const courseRow: CourseRow = { title: "My Course", description: null };
			const lessonRow: LessonRow = { lessonId: "lesson-abc", title: "Intro Lesson" };
			(database.course.findUnique as jest.Mock).mockResolvedValue(courseRow);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(lessonRow);

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toEqual({
				type: "lesson",
				courseTitle: "My Course",
				courseDescription: undefined,
				lessonId: "lesson-abc",
				title: "Intro Lesson"
			} satisfies ContextPayload);
		});

		it("falls back to course context when the lesson slug is not found", async () => {
			// Setup
			const pageContext: PageContext = {
				type: "lesson",
				courseSlug: "my-course",
				lessonSlug: "missing-lesson"
			};
			const courseRow: CourseRow = { title: "My Course", description: "Desc" };
			(database.course.findUnique as jest.Mock).mockResolvedValue(courseRow);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(null);

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toEqual({
				type: "course",
				courseTitle: "My Course",
				courseDescription: "Desc"
			} satisfies ContextPayload);
		});

		it("returns null when the course does not exist", async () => {
			// Setup
			const pageContext: PageContext = {
				type: "lesson",
				courseSlug: "no-course",
				lessonSlug: "some-lesson"
			};
			(database.course.findUnique as jest.Mock).mockResolvedValue(null);

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toBeNull();
		});
	});

	// =========================================================================
	describe("when pageContext is a standalone lesson (no courseSlug)", () => {
		// =========================================================================

		it("returns a standalone lesson payload when the lesson exists", async () => {
			// Setup
			const pageContext: PageContext = {
				type: "lesson",
				courseSlug: "",
				lessonSlug: "standalone-lesson"
			};
			const lessonRow: LessonRow = { lessonId: "lesson-xyz", title: "Standalone" };
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(lessonRow);

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toEqual({
				type: "lesson",
				lessonId: "lesson-xyz",
				title: "Standalone"
			} satisfies LessonwithoutCourseContextPayload);
		});

		it("returns null when the standalone lesson is not found", async () => {
			// Setup
			const pageContext: PageContext = {
				type: "lesson",
				courseSlug: "",
				lessonSlug: "ghost-lesson"
			};
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(null);

			// Exercise
			const result = await fetchContextPayload(pageContext);

			// Verify
			expect(result).toBeNull();
		});
	});

	// =========================================================================
	describe("error handling", () => {
		// =========================================================================

		it("throws a TRPCError when a database call rejects unexpectedly", async () => {
			// Setup
			const pageContext: PageContext = { type: "course", courseSlug: "bad-course" };
			(database.course.findUnique as jest.Mock).mockRejectedValue(
				new Error("DB connection lost")
			);

			// Exercise & Verify
			await expect(fetchContextPayload(pageContext)).rejects.toBeInstanceOf(TRPCError);
		});
	});
});

// ---------------------------------------------------------------------------
// extractUserQuestion
// ---------------------------------------------------------------------------

describe("extractUserQuestion", () => {
	// =========================================================================
	describe("when messages contain at least one user message", () => {
		// =========================================================================

		it("returns the content of the last user message", () => {
			// Setup
			const messages: Message[] = [
				{ role: "user", content: "First question" },
				{ role: "assistant", content: "First answer" },
				{ role: "user", content: "Second question" }
			];

			// Exercise
			const question = extractUserQuestion(messages);

			// Verify
			expect(question).toBe("Second question");
		});

		it("extracts the sole user message from a single-entry history", () => {
			// Setup
			const messages: Message[] = [{ role: "user", content: "Only question" }];

			// Exercise
			const question = extractUserQuestion(messages);

			// Verify
			expect(question).toBe("Only question");
		});
	});

	// =========================================================================
	describe("when no user message is present", () => {
		// =========================================================================

		it("throws a TRPCError when the message list is empty", () => {
			// Setup
			const messages: Message[] = [];

			// Exercise & Verify
			expect(() => extractUserQuestion(messages)).toThrow(TRPCError);
		});

		it("throws a TRPCError when only assistant messages are present", () => {
			// Setup
			const messages: Message[] = [{ role: "assistant", content: "I am an assistant" }];

			// Exercise & Verify
			expect(() => extractUserQuestion(messages)).toThrow(TRPCError);
		});
	});
});

// ---------------------------------------------------------------------------
// buildSystemPrompt
// ---------------------------------------------------------------------------

describe("buildSystemPrompt", () => {
	// =========================================================================
	describe("when payload is null", () => {
		// =========================================================================

		it("returns the default system prompt without any context appended", async () => {
			// Setup – no context payload

			// Exercise
			const prompt = await buildSystemPrompt(null, null);

			// Verify
			expect(typeof prompt).toBe("string");
			expect(prompt.length).toBeGreaterThan(0);
			expect(prompt).toContain("excellent tutor");
		});
	});

	// =========================================================================
	describe("when payload is a course context", () => {
		// =========================================================================

		it("includes the course title in the generated prompt", async () => {
			// Setup
			const payload: ContextPayload = {
				type: "course",
				courseTitle: "Advanced TypeScript",
				courseDescription: "Deep dive into TS"
			};

			// Exercise
			const prompt = await buildSystemPrompt(payload, null);

			// Verify
			expect(prompt).toContain("Advanced TypeScript");
		});

		it("includes the course description when one is provided", async () => {
			// Setup
			const payload: ContextPayload = {
				type: "course",
				courseTitle: "Advanced TypeScript",
				courseDescription: "Deep dive into TS"
			};

			// Exercise
			const prompt = await buildSystemPrompt(payload, null);

			// Verify
			expect(prompt).toContain("Deep dive into TS");
		});
	});

	// =========================================================================
	describe("when payload is a lesson context", () => {
		// =========================================================================

		it("includes the lesson title in the generated prompt", async () => {
			// Setup
			const payload: ContextPayload = {
				type: "lesson",
				courseTitle: "Advanced TypeScript",
				courseDescription: "Desc",
				lessonId: "lesson-1",
				title: "Generics Deep Dive"
			};
			const ragContext = "Generics allow type parameters.";

			// Exercise
			const prompt = await buildSystemPrompt(payload, ragContext);

			// Verify
			expect(prompt).toContain("Generics Deep Dive");
		});

		it("embeds the RAG context in the prompt when supplied", async () => {
			// Setup
			const payload: ContextPayload = {
				type: "lesson",
				courseTitle: "My Course",
				courseDescription: undefined,
				lessonId: "lesson-2",
				title: "Some Lesson"
			};
			const ragContext = "This is the retrieved context.";

			// Exercise
			const prompt = await buildSystemPrompt(payload, ragContext);

			// Verify
			expect(prompt).toContain(ragContext);
		});

		it("uses a fallback message when no RAG context is provided", async () => {
			// Setup
			const payload: ContextPayload = {
				type: "lesson",
				courseTitle: "My Course",
				courseDescription: undefined,
				lessonId: "lesson-3",
				title: "Another Lesson"
			};

			// Exercise
			const prompt = await buildSystemPrompt(payload, null);

			// Verify
			expect(prompt).toContain("No relevant content found");
		});
	});
});

// ---------------------------------------------------------------------------
// cleanResponse
// ---------------------------------------------------------------------------

describe("cleanResponse", () => {
	// =========================================================================
	describe("when the response contains <think> blocks", () => {
		// =========================================================================

		it("removes a single <think>…</think> block from the response", () => {
			// Setup
			const raw = "<think>Internal reasoning here.</think>The actual answer.";

			// Exercise
			const cleaned = cleanResponse(raw);

			// Verify
			expect(cleaned).toBe("The actual answer.");
			expect(cleaned).not.toContain("<think>");
		});

		it("removes multiple <think>…</think> blocks", () => {
			// Setup
			const raw =
				"<think>First thought.</think>Answer part one. <think>Second thought.</think>Answer part two.";

			// Exercise
			const cleaned = cleanResponse(raw);

			// Verify
			expect(cleaned).toBe("Answer part one. Answer part two.");
		});

		it("removes multi-line <think> blocks", () => {
			// Setup
			const raw = "<think>\nLine one.\nLine two.\n</think>Clean answer.";

			// Exercise
			const cleaned = cleanResponse(raw);

			// Verify
			expect(cleaned).toBe("Clean answer.");
		});
	});

	// =========================================================================
	describe("when the response has no <think> blocks", () => {
		// =========================================================================

		it("returns the response trimmed and unchanged", () => {
			// Setup
			const raw = "  Plain response without any think blocks.  ";

			// Exercise
			const cleaned = cleanResponse(raw);

			// Verify
			expect(cleaned).toBe("Plain response without any think blocks.");
		});

		it("returns an empty string when given an empty input", () => {
			// Setup
			const raw = "";

			// Exercise
			const cleaned = cleanResponse(raw);

			// Verify
			expect(cleaned).toBe("");
		});
	});
});
