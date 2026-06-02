import { database } from "@self-learning/database";
import { Context, UserFromSession } from "../context";
import { courseRouter } from "./course.router";
import { t } from "../trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { getCourseResource } from "../../permissions/course.utils";
import { AccessLevel } from "@prisma/client";
import {
	canCreate,
	canDelete,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";

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
	getCourseResource: jest.fn()
}));

jest.mock("../../permissions/permission.service", () => ({
	canCreate: jest.fn(),
	canDelete: jest.fn(),
	canEdit: jest.fn(),
	preparePermissionsForCreate: jest.fn(),
	prepareResourceUpdate: jest.fn()
}));

function prepare(user: Partial<UserFromSession>) {
	const ctx: Context & { user: UserFromSession } = {
		user: {
			id: "user-id",
			name: "john",
			role: "USER",
			isAuthor: false,
			avatarUrl: null,
			featureFlags: {
				learningDiary: false,
				learningStatistics: false,
				experimental: false
			},
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
			(preparePermissionsForCreate as jest.Mock).mockReturnValue(undefined);

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
			(preparePermissionsForCreate as jest.Mock).mockReturnValue({
				create: defaultCourse.course.permissions.map(p => ({
					accessLevel: p.accessLevel,
					groupId: p.groupId
				}))
			});
			(database.course.create as jest.Mock).mockResolvedValue({
				courseId: "test-course",
				slug: "test-course"
			});

			await expect(caller.create(defaultCourse.course)).resolves.toBeDefined();
			expect(database.course.create).toHaveBeenCalled();
		});

		it("should throw BAD_REQUEST if course has not FULL permission assigned to it", async () => {
			const { caller } = prepare({});

			(canCreate as jest.Mock).mockResolvedValue(true);
			(preparePermissionsForCreate as jest.Mock).mockRejectedValue(
				new TRPCError({
					code: "BAD_REQUEST",
					message: "requires at least one FULL permission."
				})
			);
			await expect(
				caller.create({
					...defaultCourse.course,
					permissions: [
						{ accessLevel: AccessLevel.EDIT, groupId: 1, groupName: "Group 1" }
					]
				})
			).rejects.toMatchObject({
				code: "BAD_REQUEST"
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

		it("throws FORBIDDEN when prepareResourceUpdate rejects", async () => {
			const { caller } = prepare({});

			(prepareResourceUpdate as jest.Mock).mockRejectedValue(
				new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" })
			);

			await expect(caller.edit(defaultCourse)).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "Insufficient permissions"
			} as Partial<TRPCError>);
			expect(database.course.update).not.toHaveBeenCalled();
		});

		it("throws BAD_REQUEST when prepareResourceUpdate rejects", async () => {
			const { caller } = prepare({});

			(prepareResourceUpdate as jest.Mock).mockRejectedValue(
				new TRPCError({
					code: "BAD_REQUEST",
					message: "requires at least one FULL permission."
				})
			);

			await expect(caller.edit(defaultCourse)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			} as Partial<TRPCError>);
			expect(database.course.update).not.toHaveBeenCalled();
		});

		it("updates course when prepareResourceUpdate succeeds", async () => {
			const { caller } = prepare({});

			(prepareResourceUpdate as jest.Mock).mockResolvedValue(undefined);

			await expect(caller.edit(defaultCourse)).resolves.toBeDefined();
			expect(prepareResourceUpdate).toHaveBeenCalledWith(
				expect.objectContaining({ id: "user-id" }),
				defaultCourse,
				defaultCourse.course.permissions
			);
			expect(database.course.update).toHaveBeenCalledTimes(1);
		});

		it("updates course when prepareResourceUpdate returns permission upsert payload", async () => {
			const { caller } = prepare({});

			(prepareResourceUpdate as jest.Mock).mockResolvedValue({
				deleteMany: { groupId: { notIn: [1] } },
				upsert: []
			});

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
					slug
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

		it("deletes course when canDelete returns true", async () => {
			const { caller, ctx } = prepare({
				memberships: [1]
			});
			const input = { slug: "test-course" };

			(getCourseResource as jest.Mock).mockResolvedValue({ courseId: "test-course" });
			(canDelete as jest.Mock).mockResolvedValue(true);

			await expect(caller.deleteCourse(input)).resolves.not.toThrow();
			assertWhereClause(input.slug, ctx.user.name);
		});

		it("throws FORBIDDEN when canDelete returns false", async () => {
			const { caller, ctx } = prepare({});
			const input = { slug: "test-course" };

			(getCourseResource as jest.Mock).mockResolvedValue({ courseId: "test-course" });
			(canDelete as jest.Mock).mockResolvedValue(false);
			await expect(caller.deleteCourse(input)).rejects.toThrow(TRPCError);
			expect(database.course.delete).not.toHaveBeenCalled();
		});

		it("should throw error if course does not exist", async () => {
			const { caller, ctx } = prepare({
				isAuthor: true,
				name: "author1"
			});
			const input = { slug: "non-existing-course" };

			(getCourseResource as jest.Mock).mockRejectedValue(
				new TRPCError({
					code: "NOT_FOUND",
					message: "Course not found"
				})
			);
			(canDelete as jest.Mock).mockResolvedValue(true);

			// Course doesn't exist; getCourseResource drives NOT_FOUND
			await expect(caller.deleteCourse(input)).rejects.toMatchObject({
				code: "NOT_FOUND"
			});
			expect(database.course.delete).not.toHaveBeenCalled();
		});
	});
});
