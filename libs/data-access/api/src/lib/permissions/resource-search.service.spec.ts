import { database } from "@self-learning/database";
import { AccessLevel } from "@prisma/client";
import { searchAllResources, searchMyResources } from "./resource-search.service";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: { findMany: jest.fn() },
		lesson: { findMany: jest.fn() },
		specialization: { findMany: jest.fn() },
		subject: { findMany: jest.fn() },
		permission: { findMany: jest.fn() }
	}
}));

describe("resource-search.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("searchAllResources", () => {
		it("returns paginated entries for all kinds by default", async () => {
			(database.course.findMany as jest.Mock).mockResolvedValue([
				{ courseId: "c1", slug: "c1", title: "Course A", imgUrl: null }
			]);
			(database.lesson.findMany as jest.Mock).mockResolvedValue([]);
			(database.specialization.findMany as jest.Mock).mockResolvedValue([
				{
					specializationId: "sp1",
					subjectId: "sb1",
					slug: "sp1",
					title: "Spec A",
					cardImgUrl: null
				}
			]);
			(database.subject.findMany as jest.Mock).mockResolvedValue([
				{ subjectId: "sb1", slug: "sb1", title: "Subject A", cardImgUrl: null }
			]);

			const page = await searchAllResources({ page: 1 });

			expect(page.totalCount).toBe(3);
			expect(page.result.map(entry => entry.kind)).toEqual(
				expect.arrayContaining(["course", "specialization", "subject"])
			);
			const spec = page.result.find(entry => entry.kind === "specialization");
			expect(spec?.parentId).toBe("sb1");
		});

		it("includes lessons in global search", async () => {
			(database.course.findMany as jest.Mock).mockResolvedValue([]);
			(database.lesson.findMany as jest.Mock).mockResolvedValue([
				{ lessonId: "l1", slug: "l1", title: "Lesson A", imgUrl: null }
			]);
			(database.specialization.findMany as jest.Mock).mockResolvedValue([]);
			(database.subject.findMany as jest.Mock).mockResolvedValue([]);

			const page = await searchAllResources({ page: 1, kinds: ["lesson"] });

			expect(page.result[0].kind).toBe("lesson");
		});

		it("filters by kinds when provided", async () => {
			(database.subject.findMany as jest.Mock).mockResolvedValue([
				{ subjectId: "sb1", slug: "sb1", title: "Subject A", cardImgUrl: null }
			]);

			const page = await searchAllResources({ page: 1, kinds: ["subject"] });

			expect(database.course.findMany).not.toHaveBeenCalled();
			expect(page.result).toHaveLength(1);
			expect(page.result[0].kind).toBe("subject");
		});
	});

	describe("searchMyResources", () => {
		it("aggregates best access per resource key", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{
					accessLevel: AccessLevel.VIEW,
					course: { courseId: "c1", slug: "c1", title: "Course A", imgUrl: null },
					lesson: null,
					specialization: null,
					subject: null
				},
				{
					accessLevel: AccessLevel.FULL,
					course: { courseId: "c1", slug: "c1", title: "Course A", imgUrl: null },
					lesson: null,
					specialization: null,
					subject: null
				}
			]);

			const page = await searchMyResources("user-1", { page: 1, kinds: ["course"] });

			expect(page.totalCount).toBe(1);
			expect(page.result[0]).toMatchObject({
				kind: "course",
				id: "c1",
				accessLevel: AccessLevel.FULL
			});
		});

		it("skips permissions that do not match selected kinds", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{
					accessLevel: AccessLevel.VIEW,
					course: { courseId: "c1", slug: "c1", title: "C", imgUrl: null },
					lesson: null,
					specialization: null,
					subject: null
				}
			]);

			const page = await searchMyResources("user-1", { page: 1, kinds: ["lesson"] });

			expect(page.totalCount).toBe(0);
		});

		it("maps lesson and subject permissions", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{
					accessLevel: AccessLevel.VIEW,
					course: null,
					lesson: { lessonId: "l1", slug: "l1", title: "L", imgUrl: null },
					specialization: null,
					subject: null
				},
				{
					accessLevel: AccessLevel.FULL,
					course: null,
					lesson: null,
					specialization: null,
					subject: { subjectId: "sb1", slug: "sb1", title: "S", cardImgUrl: null }
				}
			]);

			const page = await searchMyResources("user-1", {
				page: 1,
				kinds: ["lesson", "subject"]
			});

			expect(page.totalCount).toBe(2);
			expect(page.result.map(entry => entry.kind)).toEqual(
				expect.arrayContaining(["lesson", "subject"])
			);
		});

		it("maps specialization permissions with parent subject id", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{
					accessLevel: AccessLevel.EDIT,
					course: null,
					lesson: null,
					specialization: {
						specializationId: "sp1",
						subjectId: "sb1",
						slug: "sp1",
						title: "Spec A",
						cardImgUrl: null
					},
					subject: null
				}
			]);

			const page = await searchMyResources("user-1", { page: 1, kinds: ["specialization"] });

			expect(page.result[0]).toMatchObject({
				kind: "specialization",
				id: "sp1",
				parentId: "sb1",
				accessLevel: AccessLevel.EDIT
			});
		});
	});
});
