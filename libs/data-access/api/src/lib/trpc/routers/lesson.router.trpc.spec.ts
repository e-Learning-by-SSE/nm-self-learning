import { database } from "@self-learning/database";
import { Context, UserFromSession } from "../context";
import { t } from "../trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { lessonRouter } from "./lesson.router";

import {
	canCreate,
	canDelete,
	preparePermissionsForCreate,
	preparePermissionsForUpdate,
	hasEffectiveAccess
} from "../../permissions/permission.service";
import { AccessLevel, LessonType } from "@prisma/client";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		$transaction: jest.fn(),
		lesson: {
			delete: jest.fn(),
			update: jest.fn(),
			create: jest.fn(),
			findUnique: jest.fn()
		},
		permission: {
			findMany: jest.fn()
		}
	}
}));

jest.mock("../../permissions/permission.service", () => ({
	getEffectiveAccess: jest.fn(),
	canEdit: jest.fn(),
	canDelete: jest.fn(),
	canCreate: jest.fn(),
	preparePermissionsForCreate: jest.fn(),
	preparePermissionsForUpdate: jest.fn(),
	hasEffectiveAccess: jest.fn()
}));

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
			memberships: [],
			...user
		}
	};
	const caller = t.createCallerFactory(lessonRouter)(ctx);
	return { caller, ctx };
}

describe("tRPC API of Lesson Router", () => {
	const defaultLesson = {
		lessonId: "test-lesson",
		lesson: {
			lessonId: "test-lesson",
			courseId: "test-course",
			slug: "test-lessonId",
			title: "Test Lesson",
			description: "A lesson for testing",
			content: [],
			meta: {},
			authors: [{ username: "author1" }],
			licenseId: null,
			ragEnabled: false,
			requires: [
				{
					name: "Resource 1",
					id: "res1",
					description: "",
					children: [],
					repositoryId: "rid",
					parents: []
				}
			],
			provides: [
				{
					name: "Resource 2",
					id: "res2",
					description: "",
					children: [],
					repositoryId: "rid",
					parents: []
				}
			],
			lessonType: LessonType.TRADITIONAL,
			selfRegulatedQuestion: null,
			quiz: null,
			imgUrl: null,
			subtitle: null,
			permissions: [{ accessLevel: AccessLevel.FULL, groupId: 1, groupName: "Group 1" }]
		}
	};

	describe("createLesson", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should throw FORBIDDEN if user cannot create lessons", async () => {
			const { caller } = prepare({});

			(canCreate as jest.Mock).mockResolvedValue(false);

			await expect(caller.create(defaultLesson.lesson)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.lesson.create).not.toHaveBeenCalled();
		});

		it("should create lesson if user can create lessons", async () => {
			const { caller } = prepare({});

			(canCreate as jest.Mock).mockResolvedValue(true);
			(database.lesson.create as jest.Mock).mockResolvedValue({
				lessonId: "test-lessonId",
				slug: "test-lesson"
			});

			await expect(caller.create(defaultLesson.lesson)).resolves.toBeDefined();
			expect(database.lesson.create).toHaveBeenCalled();
		});

		it("should throw BAD_REQUEST if lesson has not FULL permission assigned to it", async () => {
			const { caller } = prepare({});

			(canCreate as jest.Mock).mockResolvedValue(true);
			(preparePermissionsForCreate as jest.Mock).mockRejectedValue(
				new TRPCError({
					code: "FORBIDDEN",
					message: "requires at least one FULL permission."
				})
			);
			await expect(
				caller.create({
					...defaultLesson.lesson,
					permissions: [
						{ accessLevel: AccessLevel.EDIT, groupId: 1, groupName: "Group 1" }
					]
				})
			).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "requires at least one FULL permission."
			} as Partial<TRPCError>);
			expect(database.lesson.create).not.toHaveBeenCalled();
		});
	});
	describe("editLesson", () => {
		beforeEach(() => {
			jest.clearAllMocks();
			(database.lesson.update as jest.Mock).mockImplementation(({ where }) => {
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

		it("should throw FORBIDDEN if user has no access", async () => {
			const { caller } = prepare({});

			(preparePermissionsForUpdate as jest.Mock).mockResolvedValue(undefined);
			(hasEffectiveAccess as jest.Mock).mockResolvedValue(false);

			await expect(caller.edit(defaultLesson)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.lesson.update).not.toHaveBeenCalled();
		});

		it("should throw FORBIDDEN if user has insufficient access", async () => {
			const { caller } = prepare({});

			(preparePermissionsForUpdate as jest.Mock).mockResolvedValue(undefined);
			(hasEffectiveAccess as jest.Mock).mockResolvedValue(false);

			await expect(caller.edit(defaultLesson)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.lesson.update).not.toHaveBeenCalled();
		});

		it("should throw BAD_REQUEST if lesson has not FULL permission assigned to it", async () => {
			const { caller } = prepare({});

			(preparePermissionsForUpdate as jest.Mock).mockRejectedValue(
				new TRPCError({
					code: "BAD_REQUEST",
					message: "requires at least one FULL permission."
				})
			);

			await expect(
				caller.edit({
					...defaultLesson,
					lesson: {
						...defaultLesson.lesson,
						permissions: [
							{ accessLevel: AccessLevel.EDIT, groupId: 1, groupName: "Group 1" }
						]
					}
				})
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: "requires at least one FULL permission."
			} as Partial<TRPCError>);
			expect(database.lesson.update).not.toHaveBeenCalled();
		});

		it("should throw FORBIDDEN if permissions were modified and user has not FULL access", async () => {
			const { caller } = prepare({});

			(preparePermissionsForUpdate as jest.Mock).mockResolvedValue({
				deleteMany: { groupId: { notIn: [1] } },
				upsert: []
			});
			(hasEffectiveAccess as jest.Mock).mockResolvedValue(false);

			await expect(caller.edit(defaultLesson)).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "Insufficient permissions"
			} as Partial<TRPCError>);
			expect(database.lesson.update).not.toHaveBeenCalled();
		});

		it("should update lesson if user has EDIT access and permissions are unchanged", async () => {
			const { caller } = prepare({ memberships: [1] });

			(preparePermissionsForUpdate as jest.Mock).mockResolvedValue(undefined);
			(hasEffectiveAccess as jest.Mock).mockResolvedValue(true);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue({
				ragVersionHash: "old-hash",
				ragEnabled: false
			});
			(database.lesson.update as jest.Mock).mockResolvedValue({
				lessonId: defaultLesson.lessonId,
				slug: defaultLesson.lesson.slug,
				title: defaultLesson.lesson.title,
				ragVersionHash: "new-hash",
				ragEnabled: false
			});
			(database.$transaction as jest.Mock).mockImplementation(async operations =>
				Promise.all(operations)
			);

			await expect(caller.edit(defaultLesson)).resolves.toBeDefined();
			expect(database.lesson.update).toHaveBeenCalledTimes(1);
		});

		it("should update lesson if user has FULL access and permissions were modified", async () => {
			const { caller } = prepare({});

			(preparePermissionsForUpdate as jest.Mock).mockResolvedValue({
				deleteMany: { groupId: { notIn: [1] } },
				upsert: []
			});
			(hasEffectiveAccess as jest.Mock).mockResolvedValue(true);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue({
				ragVersionHash: "old-hash",
				ragEnabled: false
			});

			(database.lesson.update as jest.Mock).mockResolvedValue({
				lessonId: defaultLesson.lessonId,
				slug: defaultLesson.lesson.slug,
				title: defaultLesson.lesson.title,
				ragVersionHash: "new-hash",
				ragEnabled: false
			});

			(database.$transaction as jest.Mock).mockImplementation(async operations =>
				Promise.all(operations)
			);

			await expect(caller.edit(defaultLesson)).resolves.toBeDefined();
			expect(database.lesson.update).toHaveBeenCalledTimes(1);
		});
	});

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

		it("should delete lesson if user can delete this lesson", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { lessonId: "test-lesson" };

			(canDelete as jest.Mock).mockResolvedValue(true);

			// Lesson exists; user can edit -> Success
			await expect(caller.deleteLesson(input)).resolves.not.toThrow();
			assertWhereClause(input.lessonId);
		});

		it("should throw error if if user cant delete this lesson", async () => {
			const { caller } = prepare({
				isAuthor: false,
				name: "author1"
			});
			const input = { lessonId: "test-lesson" };

			(canDelete as jest.Mock).mockResolvedValue(false);

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

			(canDelete as jest.Mock).mockResolvedValue(true);

			// Lesson doesn't exists; user can edit -> TRPCError
			await expect(caller.deleteLesson(input)).rejects.toThrow();
			assertWhereClause(input.lessonId);
		});
	});
});
