import { database } from "@self-learning/database";
import { Context, UserFromSession } from "../context";
import { t } from "../trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { lessonRouter } from "./lesson.router";

import { canEdit } from "../../permissions/lesson.utils";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		lesson: {
			delete: jest.fn()
		}
	}
}));

jest.mock("../../permissions/lesson.utils", () => ({
	canEdit: jest.fn()
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
			memberships: [],
			...user
		}
	};
	const caller = t.createCallerFactory(lessonRouter)(ctx);
	return { caller, ctx };
}

describe("tRPC API of Lesson Router", () => {
	describe("deleteLesson", () => {
		function assertWhereClause(lessonId: string) {
			expect(database.lesson.delete).toHaveBeenCalledTimes(1);

			const whereClause = (database.lesson.delete as jest.Mock).mock.calls[0][0];

			expect(whereClause).toEqual({
				where: {
					lessonId
				}
			});
		}
		beforeEach(() => {
			jest.clearAllMocks();
			(database.lesson.delete as jest.Mock).mockImplementation(({ where }) => {
				// Require
				// - lessonId: "test-lesson"
				if (where.lessonId === "test-lesson") {
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

		it("should delete lesson if user can edit this lesson", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { lessonId: "test-lesson" };

			(canEdit as jest.Mock).mockResolvedValue(true);

			// Lesson exists; user can edit -> Success
			await expect(caller.deleteLesson(input)).resolves.not.toThrow();
			assertWhereClause(input.lessonId);
		});

		it("should throw error if if user cant edit this lesson", async () => {
			const { caller } = prepare({
				isAuthor: false,
				name: "author1"
			});
			const input = { lessonId: "test-lesson" };

			(canEdit as jest.Mock).mockResolvedValue(false);

			// Lesson exists; user cant edit -> TRPCError
			await expect(caller.deleteLesson(input)).rejects.toThrow(TRPCError);
			// Author procedure should prevent the call to database
			expect(database.lesson.delete).not.toHaveBeenCalled();
		});

		it("should throw error if lesson does not exist", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { lessonId: "non-existing-lesson" };

			(canEdit as jest.Mock).mockResolvedValue(true);

			// Lesson doesn't exists; user can edit -> TRPCError
			await expect(caller.deleteLesson(input)).rejects.toThrow();
			assertWhereClause(input.lessonId);
		});
	});
});
