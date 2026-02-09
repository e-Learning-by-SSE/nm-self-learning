import { database } from "@self-learning/database";
import { Context, UserFromSession } from "../context";
import { t } from "../trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { lessonRouter } from "./lesson.router";
// We must mock heavy/ESM modules (rag-processing -> @xenova/transformers)
// before importing the router to avoid Jest parsing errors from those deps.

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		lesson: {
			deleteMany: jest.fn()
		}
	}
}));

// Mock the rag-processing module which imports @xenova/transformers
// (causes Jest parse errors when loaded). Keep the mocked API surface
// used by the router (functions + vectorStore).
jest.mock("@self-learning/rag-processing", () => ({
	__esModule: true,
	getRagVersionHash: jest.fn(() => "mock-hash"),
	prepareRagContent: jest.fn().mockResolvedValue({
		pdfBuffers: [],
		articleTexts: [],
		transcriptTexts: []
	}),
	deleteEmbedding: jest.fn().mockResolvedValue(undefined),
	vectorStore: {
		lessonExists: jest.fn().mockResolvedValue(false),
		deleteLesson: jest.fn().mockResolvedValue(undefined)
	}
}));

// Import the router after mocks to prevent importing the real rag-processing
// (which pulls in ESM/native deps that break Jest transform).

function prepare(user: Partial<UserFromSession>) {
	const ctx: Context & { user: UserFromSession } = {
		user: {
			id: "user-id",
			name: "john",
			role: "USER",
			isAuthor: false,
			featureFlags: {
				learningDiary: false,
				learningStatistics: false,
				experimental: false
			},
			...user
		}
	};
	const caller = t.createCallerFactory(lessonRouter)(ctx);
	return { caller, ctx };
}

describe("tRPC API of Lesson Router", () => {
	describe("deleteLesson", () => {
		function assertWhereClause(lessonId: string, author: string) {
			expect(database.lesson.deleteMany).toHaveBeenCalledTimes(1);

			const whereClause = (database.lesson.deleteMany as jest.Mock).mock.calls[0][0];

			expect(whereClause).toEqual({
				where: {
					lessonId,
					authors: { some: { username: author } }
				}
			});
		}
		beforeEach(() => {
			jest.clearAllMocks();
			(database.lesson.deleteMany as jest.Mock).mockImplementation(({ where }) => {
				// Require
				// - lessonId: "test-lesson"
				// - Authors: "author1" or "author2"
				if (
					where.lessonId === "test-lesson" &&
					(where.authors.some.username === "author1" ||
						where.authors.some.username === "author2")
				) {
					return Promise.resolve({
						slug: "test-lessonId",
						authors: [{ username: "author1" }]
					});
				} else {
					throw new PrismaClientKnownRequestError(
						"No Lesson found for specified where condition",
						{ code: "P2025", clientVersion: "4.0.0" } // Mocked error code & version
					);
				}
			});
		});

		it("should delete lesson if user is author", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { lessonId: "test-lesson" };

			// Lesson exists; user is author -> Success
			await expect(caller.deleteLesson(input)).resolves.not.toThrow();
			assertWhereClause(input.lessonId, ctx.user.name);
		});

		it("should delete a lesson if user second author", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author2"
			});
			const input = { lessonId: "test-lesson" };

			// Lesson exists; user is author -> Success
			await expect(caller.deleteLesson(input)).resolves.not.toThrow();
			assertWhereClause(input.lessonId, ctx.user.name);
		});

		it("should throw error if user is not author", async () => {
			const { caller } = prepare({
				isAuthor: false,
				name: "author1"
			});
			const input = { lessonId: "test-lesson" };

			// Lesson exists; user is no author -> TRPCError
			await expect(caller.deleteLesson(input)).rejects.toThrow(TRPCError);
			// Author procedure should prevent the call to database
			expect(database.lesson.deleteMany).not.toHaveBeenCalled();
		});

		it("should throw error if user is wrong author", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author3"
			});
			const input = { lessonId: "test-lesson" };

			// Lesson exists; user is foreign author -> TRPCError
			await expect(caller.deleteLesson(input)).rejects.toThrow();
			assertWhereClause(input.lessonId, ctx.user.name);
		});

		it("should throw error if lesson does not exist", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { lessonId: "non-existing-lesson" };

			// Lesson doesn't exists; user is author -> TRPCError
			await expect(caller.deleteLesson(input)).rejects.toThrow();
			assertWhereClause(input.lessonId, ctx.user.name);
		});
	});
});
