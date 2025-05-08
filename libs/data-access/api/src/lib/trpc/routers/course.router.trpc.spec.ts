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
	const ctx: Context = {
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
	return caller;
}

describe("tRPC API of Course Router", () => {
	describe("deleteCourse", () => {
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
			const caller = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { slug: "test-course" };

			// Course exists; user is author -> Success
			await expect(caller.deleteCourse(input)).resolves.not.toThrow();
		});

		it("should delete a course if user second author", async () => {
			const caller = prepare({
				isAuthor: true,
				name: "author2"
			});
			const input = { slug: "test-course" };

			// Course exists; user is author -> Success
			await expect(caller.deleteCourse(input)).resolves.not.toThrow();
		});

		it("should throw error if user is not author", async () => {
			const caller = prepare({
				isAuthor: false,
				name: "author1"
			});
			const input = { slug: "test-course" };

			// Course exists; user is no author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
		});

		it("should throw error if user is wrong author", async () => {
			const caller = prepare({
				isAuthor: true,
				name: "author3"
			});
			const input = { slug: "test-course" };

			// Course exists; user is foreign author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
		});

		it("should throw error if course does not exist", async () => {
			const caller = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { slug: "non-existing-course" };

			// Course doesn't exists; user is author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
		});
	});
});
