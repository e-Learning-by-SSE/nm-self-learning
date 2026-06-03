import { database } from "@self-learning/database";
import { AccessLevel } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Context, UserFromSession } from "../context";
import { subjectRouter } from "./subject.router";
import { t } from "../trpc";
import {
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		subject: {
			findMany: jest.fn(),
			findUniqueOrThrow: jest.fn(),
			create: jest.fn(),
			update: jest.fn()
		}
	}
}));

jest.mock("../../permissions/permission.service", () => ({
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
			memberships: [1],
			...user
		}
	};
	const caller = t.createCallerFactory(subjectRouter)(ctx);
	return { caller, ctx };
}

const defaultSubject = {
	subjectId: "math",
	title: "Mathematics",
	slug: "math",
	subtitle: "Math subject",
	cardImgUrl: null,
	imgUrlBanner: null,
	permissions: [{ groupId: 1, groupName: "Editors", accessLevel: AccessLevel.FULL }]
};

describe("subjectRouter", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("queries", () => {
		it("getAllWithSpecializations returns subjects from database", async () => {
			const caller = t.createCallerFactory(subjectRouter)({});
			(database.subject.findMany as jest.Mock).mockResolvedValue([
				{ subjectId: "math", title: "Math", specializations: [] }
			]);

			const result = await caller.getAllWithSpecializations();

			expect(result).toHaveLength(1);
		});

		it("getAllForAdminPage returns admin listing", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.subject.findMany as jest.Mock).mockResolvedValue([defaultSubject]);

			const result = await caller.getAllForAdminPage();

			expect(result).toHaveLength(1);
		});

		it("getForEdit loads subject with permissions", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.subject.findUniqueOrThrow as jest.Mock).mockResolvedValue(defaultSubject);

			const result = await caller.getForEdit({ subjectId: "math" });

			expect(result.subjectId).toBe("math");
		});
	});

	describe("create", () => {
		it("throws FORBIDDEN for non-admin users", async () => {
			const { caller } = prepare({ role: "USER" });

			await expect(caller.create(defaultSubject)).rejects.toMatchObject({
				code: "FORBIDDEN"
			});
			expect(preparePermissionsForCreate).not.toHaveBeenCalled();
		});

		it("creates subject when caller is ADMIN", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(preparePermissionsForCreate as jest.Mock).mockResolvedValue({
				create: [{ groupId: 1, accessLevel: AccessLevel.FULL }]
			});
			(database.subject.create as jest.Mock).mockResolvedValue({
				subjectId: "math",
				slug: "math",
				title: "Mathematics"
			});

			const result = await caller.create(defaultSubject);

			expect(preparePermissionsForCreate).toHaveBeenCalledWith(defaultSubject.permissions);
			expect(database.subject.create).toHaveBeenCalled();
			expect(result.subjectId).toBe("math");
		});

		it("propagates BAD_REQUEST from preparePermissionsForCreate", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(preparePermissionsForCreate as jest.Mock).mockRejectedValue(
				new TRPCError({
					code: "BAD_REQUEST",
					message: "requires at least one FULL permission."
				})
			);

			await expect(caller.create(defaultSubject)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			});
		});
	});

	describe("update", () => {
		it("throws FORBIDDEN when prepareResourceUpdate rejects", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(prepareResourceUpdate as jest.Mock).mockRejectedValue(
				new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" })
			);

			await expect(caller.update(defaultSubject)).rejects.toMatchObject({
				code: "FORBIDDEN"
			});
			expect(database.subject.update).not.toHaveBeenCalled();
		});

		it("updates subject when prepareResourceUpdate succeeds", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(prepareResourceUpdate as jest.Mock).mockResolvedValue(undefined);
			(database.subject.update as jest.Mock).mockResolvedValue(defaultSubject);

			await expect(caller.update(defaultSubject)).resolves.toEqual(defaultSubject);
			expect(prepareResourceUpdate).toHaveBeenCalledWith(
				expect.objectContaining({ id: "user-id" }),
				defaultSubject,
				defaultSubject.permissions
			);
		});
	});
});
