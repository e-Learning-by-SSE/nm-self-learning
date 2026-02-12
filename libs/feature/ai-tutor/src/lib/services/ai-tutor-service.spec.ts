// self-learn/libs/feature/src/lib/services/ai-tutor-service.spec.ts

import "@testing-library/jest-dom";
import { AiTutorService } from "./ai-tutor-service";
import { database } from "@self-learning/database";
import { TRPCError } from "@trpc/server";
import { Message, PageContext, ContextPayload } from "@self-learning/types";

// Mock the database module
jest.mock("@self-learning/database", () => ({
	database: {
		course: {
			findUnique: jest.fn()
		},
		lesson: {
			findUnique: jest.fn()
		}
	}
}));

describe("AiTutorService", () => {
	let service: AiTutorService;

	beforeEach(() => {
		service = new AiTutorService();
		jest.clearAllMocks();
	});

	describe("fetchContextPayload", () => {
		it("should return null when pageContext is null", async () => {
			const result = await service.fetchContextPayload(null);
			expect(result).toBeNull();
		});

		it("should return course context when type is course", async () => {
			const mockCourse = {
				title: "Introduction to TypeScript",
				description: "Learn TypeScript basics"
			};

			(database.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

			const pageContext: PageContext = {
				type: "course",
				courseSlug: "intro-typescript"
			};

			const result = await service.fetchContextPayload(pageContext);

			expect(result).toEqual({
				type: "course",
				courseTitle: "Introduction to TypeScript",
				courseDescription: "Learn TypeScript basics"
			});

			expect(database.course.findUnique).toHaveBeenCalledWith({
				where: { slug: "intro-typescript" },
				select: { title: true, description: true }
			});
		});

		it("should return lesson context when type is lesson and lesson exists", async () => {
			const mockCourse = {
				title: "Introduction to TypeScript",
				description: "Learn TypeScript basics"
			};

			const mockLesson = {
				lessonId: "lesson-123",
				title: "Variables and Types"
			};

			(database.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);

			const pageContext: PageContext = {
				type: "lesson",
				courseSlug: "intro-typescript",
				lessonSlug: "variables-types"
			};

			const result = await service.fetchContextPayload(pageContext);

			expect(result).toEqual({
				type: "lesson",
				courseTitle: "Introduction to TypeScript",
				courseDescription: "Learn TypeScript basics",
				lessonId: "lesson-123",
				title: "Variables and Types"
			});

			expect(database.lesson.findUnique).toHaveBeenCalledWith({
				where: { slug: "variables-types" },
				select: { lessonId: true, title: true }
			});
		});

		it("should return course context when lesson is not found", async () => {
			const mockCourse = {
				title: "Introduction to TypeScript",
				description: "Learn TypeScript basics"
			};

			(database.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(null);

			const pageContext: PageContext = {
				type: "lesson",
				courseSlug: "intro-typescript",
				lessonSlug: "non-existent-lesson"
			};

			const result = await service.fetchContextPayload(pageContext);

			expect(result).toEqual({
				type: "course",
				courseTitle: "Introduction to TypeScript",
				courseDescription: "Learn TypeScript basics"
			});
		});

		it("should return null when course is not found", async () => {
			(database.course.findUnique as jest.Mock).mockResolvedValue(null);

			const pageContext: PageContext = {
				type: "course",
				courseSlug: "non-existent-course"
			};

			const result = await service.fetchContextPayload(pageContext);

			expect(result).toBeNull();
		});

		it("should throw TRPCError when database query fails", async () => {
			(database.course.findUnique as jest.Mock).mockRejectedValue(
				new Error("Database connection failed")
			);

			const pageContext: PageContext = {
				type: "course",
				courseSlug: "intro-typescript"
			};

			await expect(service.fetchContextPayload(pageContext)).rejects.toThrow(TRPCError);
			await expect(service.fetchContextPayload(pageContext)).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch course/lesson context"
			});
		});

		it("should handle course with null description", async () => {
			const mockCourse = {
				title: "Introduction to TypeScript",
				description: null
			};

			(database.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

			const pageContext: PageContext = {
				type: "course",
				courseSlug: "intro-typescript"
			};

			const result = await service.fetchContextPayload(pageContext);

			expect(result).toEqual({
				type: "course",
				courseTitle: "Introduction to TypeScript",
				courseDescription: undefined
			});
		});
	});

	describe("extractUserQuestion", () => {
		it("should extract the last user message", () => {
			const messages: Message[] = [
				{ role: "system", content: "You are a tutor" },
				{ role: "user", content: "What is TypeScript?" },
				{ role: "assistant", content: "TypeScript is a typed superset of JavaScript" },
				{ role: "user", content: "How do I define a type?" }
			];

			const result = service.extractUserQuestion(messages);

			expect(result).toBe("How do I define a type?");
		});

		it("should throw TRPCError when no user message exists", () => {
			const messages: Message[] = [
				{ role: "system", content: "You are a tutor" },
				{ role: "assistant", content: "Hello!" }
			];

			expect(() => service.extractUserQuestion(messages)).toThrow(TRPCError);
			expect(() => service.extractUserQuestion(messages)).toThrow("No user question found");
		});

		it("should handle single user message", () => {
			const messages: Message[] = [{ role: "user", content: "Help me!" }];

			const result = service.extractUserQuestion(messages);

			expect(result).toBe("Help me!");
		});

		it("should handle empty messages array", () => {
			const messages: Message[] = [];

			expect(() => service.extractUserQuestion(messages)).toThrow(TRPCError);
		});
	});

	describe("buildSystemPrompt", () => {
		it("should return default prompt when payload is null", async () => {
			const result = await service.buildSystemPrompt(null, "What is TypeScript?", null);

			expect(result).toBe(AiTutorService.DEFAULT_SYSTEM_PROMPT);
		});

		it("should build course-level prompt", async () => {
			const payload: ContextPayload = {
				type: "course",
				courseTitle: "Introduction to TypeScript",
				courseDescription: "Learn TypeScript basics"
			};

			const result = await service.buildSystemPrompt(payload, "What is TypeScript?", null);

			expect(result).toContain(AiTutorService.DEFAULT_SYSTEM_PROMPT);
			expect(result).toContain("Course Title: Introduction to TypeScript");
			expect(result).toContain("Course Description: Learn TypeScript basics");
			expect(result).toContain("Remember to base your answers on the course information");
		});

		it("should build lesson-level prompt with RAG context", async () => {
			const payload: ContextPayload = {
				type: "lesson",
				courseTitle: "Introduction to TypeScript",
				courseDescription: "Learn TypeScript basics",
				lessonId: "lesson-123",
				title: "Variables and Types"
			};

			const ragContext = "TypeScript supports number, string, and boolean types...";

			const result = await service.buildSystemPrompt(
				payload,
				"What types exist?",
				ragContext
			);

			expect(result).toContain(AiTutorService.DEFAULT_SYSTEM_PROMPT);
			expect(result).toContain("Course Title: Introduction to TypeScript");
			expect(result).toContain("Lesson Title: Variables and Types");
			expect(result).toContain("Relevant Lesson Content:");
			expect(result).toContain(ragContext);
			expect(result).toContain("Remember to cite the sources");
		});

		it("should use default context when RAG context is null for lesson", async () => {
			const payload: ContextPayload = {
				type: "lesson",
				courseTitle: "Introduction to TypeScript",
				lessonId: "lesson-123",
				title: "Variables and Types"
			};

			const result = await service.buildSystemPrompt(payload, "What types exist?", null);

			expect(result).toContain("No relevant content found for this question");
		});

		it("should handle course without description", async () => {
			const payload: ContextPayload = {
				type: "course",
				courseTitle: "Introduction to TypeScript"
			};

			const result = await service.buildSystemPrompt(payload, "What is TypeScript?", null);

			expect(result).toContain("Course Title: Introduction to TypeScript");
			expect(result).not.toContain("Course Description:");
		});
	});

	describe("cleanResponse", () => {
		it("should remove <think> tags and their content", () => {
			const response =
				"<think>Let me analyze this...</think>TypeScript is a typed superset of JavaScript.";

			const result = service.cleanResponse(response);

			expect(result).toBe("TypeScript is a typed superset of JavaScript.");
		});

		it("should handle multiple <think> blocks", () => {
			const response =
				"<think>First thought</think>Answer part 1<think>Second thought</think>Answer part 2";

			const result = service.cleanResponse(response);

			expect(result).toBe("Answer part 1Answer part 2");
		});

		it("should handle response without <think> tags", () => {
			const response = "TypeScript is a typed superset of JavaScript.";

			const result = service.cleanResponse(response);

			expect(result).toBe("TypeScript is a typed superset of JavaScript.");
		});

		it("should trim whitespace", () => {
			const response = "  <think>thinking</think>  Answer  ";

			const result = service.cleanResponse(response);

			expect(result).toBe("Answer");
		});

		it("should handle multiline <think> content", () => {
			const response = `<think>
				Let me think about this
				across multiple lines
			</think>This is the answer`;

			const result = service.cleanResponse(response);

			expect(result).toBe("This is the answer");
		});
	});

	describe("Integration scenarios", () => {
		it("should handle complete course workflow", async () => {
			const mockCourse = {
				title: "Advanced React",
				description: "Master React patterns"
			};

			(database.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

			const pageContext: PageContext = {
				type: "course",
				courseSlug: "advanced-react"
			};

			const messages: Message[] = [{ role: "user", content: "What are React hooks?" }];

			// Fetch context
			const payload = await service.fetchContextPayload(pageContext);
			expect(payload?.type).toBe("course");

			// Extract question
			const question = service.extractUserQuestion(messages);
			expect(question).toBe("What are React hooks?");

			// Build prompt
			const prompt = await service.buildSystemPrompt(payload, question, null);
			expect(prompt).toContain("Course Title: Advanced React");

			// Clean response
			const cleaned = service.cleanResponse(
				"<think>hmm</think>Hooks let you use state in functional components."
			);
			expect(cleaned).toBe("Hooks let you use state in functional components.");
		});
	});
});
