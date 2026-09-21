import { database } from "@self-learning/database";
import { testResourceGuard } from "@self-learning/ui/layouts";
import { getServerSession } from "next-auth";
import { getServerSideProps } from "../../pages/subjects/[subjectSlug]/[specializationSlug]";
import { createMockContext } from "../context-utils";

jest.mock("@self-learning/database", () => ({
	database: { specialization: { findUnique: jest.fn() } }
}));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@self-learning/util/auth/server", () => ({ authOptions: {} }));
jest.mock("@self-learning/ui/layouts", () => ({ testResourceGuard: jest.fn() }));
jest.mock("@self-learning/teaching", () => ({ I18N_NAMESPACE: ["common"] }));
jest.mock("@self-learning/ui/common", () => ({}));
jest.mock("@self-learning/ui/static", () => ({}));
jest.mock("@self-learning/api", () => ({
	withTranslations: (_namespaces: string[], handler: unknown) => handler
}));

describe("public specialization server props", () => {
	const context = createMockContext({ params: { specializationSlug: "algebra" } });
	const specialization = {
		specializationId: "spec-id",
		subjectId: "subject-id",
		slug: "algebra",
		title: "Algebra",
		subtitle: "Algebra description",
		imgUrlBanner: null,
		subject: { slug: "mathematik", title: "Mathematik" },
		courses: [],
		permissions: [{ groupId: 7, accessLevel: "EDIT" }]
	};

	beforeEach(() => {
		jest.resetAllMocks();
		(database.specialization.findUnique as jest.Mock).mockResolvedValue(specialization);
		(getServerSession as jest.Mock).mockResolvedValue(null);
	});

	it.each([true, false])(
		"returns only the permission decision (%s), never the ACL",
		async canEdit => {
			const user = { id: "user-id", role: "USER", memberships: [7] };
			(getServerSession as jest.Mock).mockResolvedValue({ user });
			(testResourceGuard as jest.Mock).mockReturnValue(canEdit);

			const result = await getServerSideProps(context);

			expect(getServerSession).toHaveBeenCalledWith(context.req, context.res, {});
			expect(testResourceGuard).toHaveBeenCalledWith(
				user,
				"EDIT",
				specialization.permissions
			);
			const { permissions: _permissions, ...publicSpecialization } = specialization;
			expect(result).toEqual({ props: { specialization: publicSpecialization, canEdit } });
			expect(JSON.stringify(result)).not.toContain('"permissions"');
			expect(JSON.stringify(result)).not.toContain('"groupId"');
			expect(JSON.stringify(result)).not.toContain('"accessLevel"');
		}
	);

	it("allows anonymous viewing with editing disabled and no permission data", async () => {
		const result = await getServerSideProps(context);

		expect(result).toMatchObject({ props: { canEdit: false } });
		expect(result).not.toHaveProperty("redirect");
		expect(result).not.toHaveProperty("props.specialization.permissions");
		expect(testResourceGuard).not.toHaveBeenCalled();
	});

	it("returns 404 for a missing specialization", async () => {
		(database.specialization.findUnique as jest.Mock).mockResolvedValue(null);
		expect(await getServerSideProps(context)).toEqual({ notFound: true });
		expect(getServerSession).not.toHaveBeenCalled();
	});

	it("rejects an invalid specialization slug", async () => {
		await expect(getServerSideProps(createMockContext())).rejects.toThrow(
			"[specializationSlug] must be a string."
		);
		expect(database.specialization.findUnique).not.toHaveBeenCalled();
	});
});
