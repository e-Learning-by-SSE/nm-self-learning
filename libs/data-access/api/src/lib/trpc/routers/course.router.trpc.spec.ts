import { database } from "@self-learning/database";
import { Context, UserFromSession } from "../context";
import { courseRouter } from "./course.router";
import { t } from "../trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { canCreate, canDeleteBySlug, canEditBySlug } from "../../permissions/course.utils";
import { AccessLevel } from "@prisma/client";
import { getEffectiveAccess } from "../../permissions/permission.service";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: {
			delete: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			findUniqueOrThrow: jest.fn()
		},
		permission: {
			findMany: jest.fn()
		}
	}
}));

jest.mock("../../permissions/course.utils", () => ({
	canEditBySlug: jest.fn(),
	canCreate: jest.fn(),
	canDeleteBySlug: jest.fn()
}));

jest.mock("../../permissions/permission.service", () => ({
	getEffectiveAccess: jest.fn()
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
	const caller = t.createCallerFactory(courseRouter)(ctx);
	return { caller, ctx };
}

describe("tRPC API of Course Router", () => {
	const defaultCourse = {
		courseId: "test-course",
		course: {
			courseId: "test-course",
			subjectId: "test-subject",
			slug: "test-course",
			title: "Test Course",
			subtitle: "A course for testing",
			description: "This is a test course",
			imgUrl: null,
			authors: [{ username: "author1" }],
			content: [],
			permissions: [{ accessLevel: AccessLevel.FULL, groupId: 1, groupName: "Group 1" }]
		}
	};

	describe("createCourse", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		it("should throw FORBIDDEN if user cannot create courses", async () => {
			const { caller } = prepare({});

			(canCreate as jest.Mock).mockResolvedValue(false);

			await expect(caller.create(defaultCourse.course)).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "Insufficient permissions."
			} as Partial<TRPCError>);
			expect(database.course.create).not.toHaveBeenCalled();
		});

		it("should throw FORBIDDEN if no authors are provides and user is not ADMIN", async () => {
			const { caller } = prepare({});

			await expect(
				caller.create({ ...defaultCourse.course, authors: [] })
			).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.course.create).not.toHaveBeenCalled();
		});

		it("should create course if user can create courses", async () => {
			const { caller } = prepare({});

			(canCreate as jest.Mock).mockResolvedValue(true);
			(database.course.create as jest.Mock).mockResolvedValue({
				lessonId: "test-lessonId",
				slug: "test-lesson"
			});

			await expect(caller.create(defaultCourse.course)).resolves.toBeDefined();
			expect(database.course.create).toHaveBeenCalled();
		});

		it("should throw BAD_REQUEST if course has not FULL permission assigned to it", async () => {
			const { caller } = prepare({});

			(canCreate as jest.Mock).mockResolvedValue(true);
			await expect(
				caller.create({
					...defaultCourse.course,
					permissions: [
						{ accessLevel: AccessLevel.EDIT, groupId: 1, groupName: "Group 1" }
					]
				})
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: "requires at least one FULL permission."
			} as Partial<TRPCError>);
			expect(database.course.create).not.toHaveBeenCalled();
		});
	});

	describe("editCourse", () => {
		beforeEach(() => {
			jest.clearAllMocks();
			(database.course.update as jest.Mock).mockImplementation(({ where }) => {
				// Require
				// - lessonId: "test-lesson"
				if (where.courseId === "test-course") {
					return Promise.resolve({
						slug: "test-courseId",
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

		it("should throw FORBIDDEN if user has no access", async () => {
			const { caller } = prepare({});

			(getEffectiveAccess as jest.Mock).mockResolvedValue({
				accessLevel: null,
				groupId: null
			});

			await expect(caller.edit(defaultCourse)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.course.update).not.toHaveBeenCalled();
		});

		it("should throw FORBIDDEN if user has insufficient access", async () => {
			const { caller } = prepare({});

			(getEffectiveAccess as jest.Mock).mockResolvedValue({
				accessLevel: AccessLevel.VIEW,
				groupId: 1
			});

			await expect(caller.edit(defaultCourse)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.course.update).not.toHaveBeenCalled();
		});

		it("should throw BAD_REQUEST if course has not FULL permission assigned to it", async () => {
			const { caller } = prepare({});

			(getEffectiveAccess as jest.Mock).mockResolvedValue({
				accessLevel: AccessLevel.EDIT,
				groupId: 1
			});

			await expect(
				caller.edit({
					...defaultCourse,
					course: {
						...defaultCourse.course,
						permissions: [
							{ accessLevel: AccessLevel.EDIT, groupId: 1, groupName: "Group 1" }
						]
					}
				})
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: "requires at least one FULL permission."
			} as Partial<TRPCError>);
			expect(database.course.update).not.toHaveBeenCalled();
		});

		it("should throw FORBIDDEN if permissions were modified and user has not FULL access", async () => {
			const { caller } = prepare({});

			(getEffectiveAccess as jest.Mock).mockResolvedValue({
				accessLevel: AccessLevel.EDIT,
				groupId: 1
			});
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 1, accessLevel: AccessLevel.VIEW }
			]);

			await expect(caller.edit(defaultCourse)).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "Insufficient permissions to update permissions"
			} as Partial<TRPCError>);
			expect(database.course.update).not.toHaveBeenCalled();
		});

		it("should update course if user has EDIT access and permissions are unchanged", async () => {
			const { caller } = prepare({});

			(getEffectiveAccess as jest.Mock).mockResolvedValue({
				accessLevel: AccessLevel.EDIT,
				groupId: 1
			});
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 1, accessLevel: AccessLevel.FULL }
			]);

			await expect(caller.edit(defaultCourse)).resolves.toBeDefined();
			expect(database.course.update).toHaveBeenCalledTimes(1);
		});

		it("should update course if user has FULL access and permissions were modified", async () => {
			const { caller } = prepare({});

			(getEffectiveAccess as jest.Mock).mockResolvedValue({
				accessLevel: AccessLevel.FULL,
				groupId: 1
			});
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 1, accessLevel: AccessLevel.EDIT }
			]);

			await expect(caller.edit(defaultCourse)).resolves.toBeDefined();
			expect(database.course.update).toHaveBeenCalledTimes(1);
		});
	});

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
				if (where.slug === "test-course") {
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

		it("should delete a course if user can edit this course", async () => {
			const { caller, ctx } = prepare({
				memberships: [1]
			});
			const input = { slug: "test-course" };

			(canDeleteBySlug as jest.Mock).mockResolvedValue(true);

			// Course exists; user is author -> Success
			await expect(caller.deleteCourse(input)).resolves.not.toThrow();
			assertWhereClause(input.slug, ctx.user.name);
		});

		it("should throw error if user cant edit course", async () => {
			const { caller, ctx } = prepare({});
			const input = { slug: "test-course" };

			(canDeleteBySlug as jest.Mock).mockResolvedValue(false);
			// Course exists; user is foreign author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
			expect(database.course.delete).not.toHaveBeenCalled();
		});

		it("should throw error if course does not exist", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { slug: "non-existing-course" };

			(canDeleteBySlug as jest.Mock).mockResolvedValue(true);

			// Course doesn't exists; user is author -> TRPCError
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
			assertWhereClause(input.slug, ctx.user.name);
		});
	});
});
