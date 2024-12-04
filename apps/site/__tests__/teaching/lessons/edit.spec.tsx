import { getServerSideProps } from "../../../pages/teaching/lessons/edit/[lessonId]";
import { database } from "@self-learning/database";
import { Author, Lesson, Skill } from "@prisma/client";
import { getServerSession } from "next-auth";
import { createMockContext } from "../../context-utils";

// Mocks getServerSession of withAuth procedure to mock User object
// ESM support & default mock required by NextAuth
jest.mock("next-auth", () => ({
	__esModule: true,
	getServerSession: jest.fn(),
	default: jest.fn()
}));

// Mock the database
jest.mock("@self-learning/database", () => ({
	database: {
		lesson: { findUnique: jest.fn() }
	}
}));

describe("getServerSideProps", () => {
	const mockCtx = createMockContext({ params: { lessonId: "lesson1" } });

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Authorization", () => {
		const dummySkill: Skill = {
			id: "skill:1",
			name: "Skill1",
			description: "Skill1 description",
			repositoryId: "repo:1"
		};

		// For te test required properties of Lesson
		const lessonMock: Partial<
			Lesson & { authors: Pick<Author, "username">[] } & {
				requirements: Skill[];
			} & { teachingGoals: Skill[] }
		> = {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			lessonId: mockCtx.params!.lessonId as string,
			slug: "lesson1",
			title: "Lesson 1",
			subtitle: "Subtitle",
			description: "Description",
			content: "Content",
			quiz: "Quiz",
			imgUrl: "imgUrl",
			licenseId: 1,
			requirements: [dummySkill],
			teachingGoals: [dummySkill],
			authors: [{ username: "Author1" }, { username: "Author2" }],
			selfRegulatedQuestion: "SelfRegulatedQuestion"
		};

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(lessonMock);
		});

		it("No Author/Admin -> 403", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: false,
					role: "USER",
					name: "user1"
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({ redirect: { destination: "/403", permanent: false } });
		});

		it("Foreign Author -> 403", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: true,
					role: "USER",
					name: "user1"
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({ redirect: { destination: "/403", permanent: false } });
		});

		it("Admin -> Lesson Property (allowed access)", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					role: "ADMIN"
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toMatchObject({ props: { lesson: expect.any(Object) } });
		});

		it("Author of Lesson -> Lesson Property (allowed access)", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: true,
					role: "USER",
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					name: lessonMock.authors![0].username
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toMatchObject({ props: { lesson: expect.any(Object) } });
		});
	});
});
