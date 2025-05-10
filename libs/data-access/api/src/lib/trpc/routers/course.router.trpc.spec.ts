import { database } from "@self-learning/database";
import { Context, UserFromSession } from "../context";
import { courseRouter } from "./course.router";
import { t } from "../trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: {
			delete: jest.fn()
		}
	}
}));

function prepare(user: Partial<UserFromSession>) {
	const ctx: Context & { user: UserFromSession } = {
		user: {
			id: "user-id",
			name: "john",
			role: "USER",
			isAuthor: false,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false,
			...user
		}
	};
	const caller = t.createCallerFactory(courseRouter)(ctx);
	return { caller, ctx };
}

describe("tRPC API of Course Router", () => {
	describe("deleteCourse", () => {
		function assertWhereClause(slug: string, author: string) {
			expect(database.course.delete).toHaveBeenCalledTimes(1);

			const whereClause = (database.course.delete as jest.Mock).mock.calls[0][0];

			expect(whereClause).toEqual({
				where: {
					slug,
					authors: { some: { username: author } }
				}
			});
		}
		beforeEach(() => {
			jest.clearAllMocks();
			(database.course.delete as jest.Mock).mockImplementation(({ where }) => {
				// Require
				// - Slug: "test-course"
				// - Authors: "author1" or "author2"
				if (
					where.slug === "test-course" &&
					(where.authors.some.username === "author1" ||
						where.authors.some.username === "author2")
				) {
					return Promise.resolve({
						slug: "test-course",
						authors: [{ username: "author1" }]
					});
				} else {
					throw new PrismaClientKnownRequestError(
						"No Course found for specified where condition",
						{ code: "P2025", clientVersion: "4.0.0" } // Mocked error code & version
					);
				}
			});
		});

		it("should delete a course if user is author", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { slug: "test-course" };

			// Course exists; user is author -> Success
			await expect(caller.deleteCourse(input)).resolves.not.toThrow();
			assertWhereClause(input.slug, ctx.user.name);
		});

		it("should delete a course if user second author", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author2"
			});
			const input = { slug: "test-course" };

			// Course exists; user is author -> Success
			await expect(caller.deleteCourse(input)).resolves.not.toThrow();
			assertWhereClause(input.slug, ctx.user.name);
		});

		it("should throw error if user is not author", async () => {
			const { caller } = prepare({
				isAuthor: false,
				name: "author1"
			});
			const input = { slug: "test-course" };

			// Course exists; user is no author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
			// Author procedure should prevent the call to database
			expect(database.course.delete).not.toHaveBeenCalled();
		});

		it("should throw error if user is wrong author", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author3"
			});
			const input = { slug: "test-course" };

			// Course exists; user is foreign author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
			assertWhereClause(input.slug, ctx.user.name);
		});

		it("should throw error if course does not exist", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { slug: "non-existing-course" };

			// Course doesn't exists; user is author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
			assertWhereClause(input.slug, ctx.user.name);
		});
	});
});
