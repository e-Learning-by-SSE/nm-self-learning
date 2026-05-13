import { database } from "@self-learning/database";
import { hasGroupRole, hasResourceAccess } from "./permission.service";
import {
	getIdBySlug,
	canEdit,
	canEditBySlug,
	canDelete,
	canDeleteBySlug,
	canCreate
} from "./course.utils";
import { AccessLevel } from "@prisma/client";
import { UserFromSession } from "../trpc/context";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: {
			findUniqueOrThrow: jest.fn()
		},
		member: {
			findFirst: jest.fn()
		}
	}
}));

jest.mock("./permission.service", () => ({
	hasGroupRole: jest.fn(),
	hasResourceAccess: jest.fn()
}));

describe("course permission utils", () => {
	describe("getIdBySlug", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return courseId for valid slug", async () => {
			const mockCourse = { courseId: "123" };
			(database.course.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockCourse);

			const result = await getIdBySlug("test-slug");

			expect(result).toBe("123");
			expect(database.course.findUniqueOrThrow).toHaveBeenCalledWith({
				where: { slug: "test-slug" },
				select: { courseId: true }
			});
		});

		it("should throw if not found", async () => {
			(database.course.findUniqueOrThrow as jest.Mock).mockRejectedValue(
				new Error("Not found")
			);

			await expect(getIdBySlug("invalid")).rejects.toThrow();
		});
	});

	describe("canEdit", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return true for ADMIN", async () => {
			const user = { role: "ADMIN" } as UserFromSession;

			const result = await canEdit(user, "courseId");

			expect(result).toBe(true);
		});

		it("should call hasResourceAccess for non-admin", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);

			const result = await canEdit(user, "courseId");

			expect(result).toBe(true);
			expect(hasResourceAccess).toHaveBeenCalledWith({
				userId: "userId",
				courseId: "courseId",
				accessLevel: AccessLevel.EDIT
			});
		});
	});

	describe("canEditBySlug", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return true for ADMIN", async () => {
			const user = { role: "ADMIN" } as UserFromSession;

			const result = await canEditBySlug(user, "slug");

			expect(result).toBe(true);
		});

		it("should call getIdBySlug and canEdit", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(database.course.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				courseId: "courseId"
			});
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);

			const result = await canEditBySlug(user, "slug");

			expect(result).toBe(true);
			expect(database.course.findUniqueOrThrow).toHaveBeenCalledWith({
				where: { slug: "slug" },
				select: { courseId: true }
			});
			expect(hasResourceAccess).toHaveBeenCalledWith({
				userId: "userId",
				courseId: "courseId",
				accessLevel: AccessLevel.EDIT
			});
		});
	});

	describe("canDelete", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return true for ADMIN", async () => {
			const user = { role: "ADMIN" } as UserFromSession;

			const result = await canDelete(user, "courseId");

			expect(result).toBe(true);
		});

		it("should call hasResourceAccess with FULL access level for non-admin", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);

			const result = await canDelete(user, "courseId");

			expect(result).toBe(true);
			expect(hasResourceAccess).toHaveBeenCalledWith({
				userId: "userId",
				courseId: "courseId",
				accessLevel: AccessLevel.FULL
			});
		});

		it("should return false if user lacks FULL access", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(hasResourceAccess as jest.Mock).mockResolvedValue(false);

			const result = await canDelete(user, "courseId");

			expect(result).toBe(false);
		});
	});

	describe("canDeleteBySlug", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return true for ADMIN", async () => {
			const user = { role: "ADMIN" } as UserFromSession;

			const result = await canDeleteBySlug(user, "slug");

			expect(result).toBe(true);
		});

		it("should call getIdBySlug and canDelete", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(database.course.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				courseId: "courseId"
			});
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);

			const result = await canDeleteBySlug(user, "slug");

			expect(result).toBe(true);
			expect(database.course.findUniqueOrThrow).toHaveBeenCalledWith({
				where: { slug: "slug" },
				select: { courseId: true }
			});
			expect(hasResourceAccess).toHaveBeenCalledWith({
				userId: "userId",
				courseId: "courseId",
				accessLevel: AccessLevel.FULL
			});
		});

		it("should return false if user lacks FULL access", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(database.course.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				courseId: "courseId"
			});
			(hasResourceAccess as jest.Mock).mockResolvedValue(false);

			const result = await canDeleteBySlug(user, "slug");

			expect(result).toBe(false);
		});
	});

	describe("canCreate", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return true for ADMIN", async () => {
			const user = { role: "ADMIN" } as UserFromSession;

			const result = await canCreate(user);

			expect(result).toBe(true);
		});

		it("should return true if user is a group member", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			const mockMember = { userId: "userId" };
			(database.member.findFirst as jest.Mock).mockResolvedValue(mockMember);

			const result = await canCreate(user);

			expect(result).toBe(true);
			expect(database.member.findFirst).toHaveBeenCalledWith({
				where: {
					userId: "userId"
				},
				select: { userId: true }
			});
		});

		it("should return false if user is not a group member", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(database.member.findFirst as jest.Mock).mockResolvedValue(null);

			const result = await canCreate(user);

			expect(result).toBe(false);
		});
	});
});
