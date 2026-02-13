import { hasGroupRole, hasResourceAccess } from "./permission.service";
import { canEdit, canDelete, canCreate } from "./lesson.utils";
import { AccessLevel } from "@prisma/client";
import { UserFromSession } from "../trpc/context";
import { database } from "@self-learning/database";

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

describe("lesson permission utils", () => {
	describe("canEdit", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return true for ADMIN", async () => {
			const user = { role: "ADMIN" } as UserFromSession;

			const result = await canEdit(user, "lessonId");

			expect(result).toBe(true);
		});

		it("should call hasResourceAccess for non-admin", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);

			const result = await canEdit(user, "lessonId");

			expect(result).toBe(true);
			expect(hasResourceAccess).toHaveBeenCalledWith({
				userId: "userId",
				lessonId: "lessonId",
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

			const result = await canDelete(user, "lessonId");

			expect(result).toBe(true);
		});

		it("should call hasResourceAccess with FULL access level for non-admin", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);

			const result = await canDelete(user, "lessonId");

			expect(result).toBe(true);
			expect(hasResourceAccess).toHaveBeenCalledWith({
				userId: "userId",
				lessonId: "lessonId",
				accessLevel: AccessLevel.FULL
			});
		});

		it("should return false if user lacks FULL access", async () => {
			const user = { role: "USER", id: "userId" } as UserFromSession;
			(hasResourceAccess as jest.Mock).mockResolvedValue(false);

			const result = await canDelete(user, "lessonId");

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
