import { database } from "@self-learning/database";
import { AccessLevel } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Context, UserFromSession } from "../context";
import { specializationRouter } from "./specialization.router";
import { t } from "../trpc";
import {
	canEdit,
	hasResourceAccess,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		specialization: {
			findUniqueOrThrow: jest.fn(),
			create: jest.fn(),
			update: jest.fn()
		}
	}
}));

jest.mock("../../permissions/permission.service", () => ({
	canEdit: jest.fn(),
	hasResourceAccess: jest.fn(),
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
	const caller = t.createCallerFactory(specializationRouter)(ctx);
	return { caller, ctx };
}

const defaultSpec = {
	specializationId: "algebra",
	subjectId: "math",
	title: "Algebra",
	slug: "algebra",
	subtitle: "Algebra spec",
	cardImgUrl: null,
	imgUrlBanner: null,
	permissions: [{ groupId: 1, groupName: "Editors", accessLevel: AccessLevel.FULL }]
};

const attachInput = {
	subjectId: "math",
	specializationId: "algebra",
	courseId: "course-1"
};

describe("specializationRouter", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("create", () => {
		it("throws FORBIDDEN when user cannot edit parent subject", async () => {
			const { caller } = prepare({ role: "USER" });
			(canEdit as jest.Mock).mockResolvedValue(false);

			await expect(
				caller.create({ subjectId: "math", data: defaultSpec })
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("creates specialization when user can edit subject", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(canEdit as jest.Mock).mockResolvedValue(true);
			(preparePermissionsForCreate as jest.Mock).mockResolvedValue({
				create: [{ groupId: 1, accessLevel: AccessLevel.FULL }]
			});
			(database.specialization.create as jest.Mock).mockResolvedValue({
				specializationId: "algebra",
				subjectId: "math",
				slug: "algebra",
				title: "Algebra"
			});

			const result = await caller.create({ subjectId: "math", data: defaultSpec });

			expect(canEdit).toHaveBeenCalledWith(expect.anything(), { subjectId: "math" });
			expect(result.specializationId).toBe("algebra");
		});
	});

	describe("getForEdit", () => {
		it("returns specialization with permissions", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.specialization.findUniqueOrThrow as jest.Mock).mockResolvedValue(defaultSpec);

			const result = await caller.getForEdit({ specializationId: "algebra" });

			expect(result.specializationId).toBe("algebra");
		});
	});

	describe("getById", () => {
		it("returns specialization metadata", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.specialization.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				specializationId: "algebra",
				slug: "algebra",
				title: "Algebra"
			});

			const result = await caller.getById({ specializationId: "algebra" });

			expect(result.specializationId).toBe("algebra");
		});
	});

	describe("update", () => {
		it("updates specialization when prepareResourceUpdate succeeds", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(prepareResourceUpdate as jest.Mock).mockResolvedValue(undefined);
			(database.specialization.update as jest.Mock).mockResolvedValue(defaultSpec);

			await expect(
				caller.update({ subjectId: "math", data: defaultSpec })
			).resolves.toEqual(defaultSpec);
		});

		it("throws FORBIDDEN when prepareResourceUpdate rejects", async () => {
			const { caller } = prepare({ role: "USER" });
			(prepareResourceUpdate as jest.Mock).mockRejectedValue(
				new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" })
			);

			await expect(
				caller.update({ subjectId: "math", data: defaultSpec })
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});

	describe("addCourse / removeCourse", () => {
		it("allows ADMIN without hasResourceAccess checks", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.specialization.update as jest.Mock).mockResolvedValue({
				specializationId: "algebra"
			});

			await caller.addCourse(attachInput);

			expect(hasResourceAccess).not.toHaveBeenCalled();
			expect(database.specialization.update).toHaveBeenCalled();
		});

		it("allows attach when user has FULL on course and EDIT on specialization", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(hasResourceAccess as jest.Mock)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(false);
			(database.specialization.update as jest.Mock).mockResolvedValue({
				specializationId: "algebra"
			});

			await caller.addCourse(attachInput);

			expect(hasResourceAccess).toHaveBeenCalledTimes(3);
		});

		it("allows attach when user has FULL on course and EDIT on subject", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(hasResourceAccess as jest.Mock)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(false)
				.mockResolvedValueOnce(true);
			(database.specialization.update as jest.Mock).mockResolvedValue({
				specializationId: "algebra"
			});

			await caller.addCourse(attachInput);
		});

		it("throws FORBIDDEN when user lacks FULL access on course", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(hasResourceAccess as jest.Mock).mockResolvedValue(false);

			await expect(caller.addCourse(attachInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
			expect(database.specialization.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when course is FULL but neither spec nor subject is EDIT", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(hasResourceAccess as jest.Mock)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(false)
				.mockResolvedValueOnce(false);

			await expect(caller.addCourse(attachInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("removeCourse uses the same attach permission check", async () => {
			const { caller } = prepare({ role: "USER", memberships: [1] });
			(hasResourceAccess as jest.Mock).mockResolvedValue(false);

			await expect(caller.removeCourse(attachInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("removeCourse disconnects when attach is allowed", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.specialization.update as jest.Mock).mockResolvedValue({
				specializationId: "algebra"
			});

			await caller.removeCourse(attachInput);

			expect(database.specialization.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { courses: { disconnect: { courseId: "course-1" } } }
				})
			);
		});
	});
});
