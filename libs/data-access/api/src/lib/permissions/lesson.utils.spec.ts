import { hasGroupRole, hasResourceAccess } from "./permission.service";
import { canEdit } from "./lesson.utils";
import { AccessLevel } from "@prisma/client";
import { UserFromSession } from "../trpc/context";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: {
			findUniqueOrThrow: jest.fn()
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
});
