import { getServerSideProps } from "../../../../pages/courses/[courseSlug]/[lessonSlug]/index";
import { database } from "@self-learning/database";
import { Author, Course, Lesson, Skill } from "@prisma/client";
import { CourseContent } from "@self-learning/types";
import { getServerSession } from "next-auth";
import { createMockContext } from "../../../context-utils";
import { compileMarkdown } from "@self-learning/markdown";

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
		course: { findUnique: jest.fn() },
		lesson: { findUnique: jest.fn() }
	}
}));

jest.mock("@self-learning/markdown", () => ({
	compileMarkdown: jest.fn()
}));

describe("getServerSideProps", () => {
	const mockCtx = createMockContext({ params: { courseSlug: "course1", lessonSlug: "lesson1" } });

	describe("Authorization", () => {
		// For te test required properties of Lesson
		const dummySkill: Skill = {
			id: "skill:1",
			name: "Skill1",
			description: "Skill1 description",
			repositoryId: "repo:1"
		};

		const lessonMock: Partial<
			Lesson & { authors: Pick<Author, "username">[] } & {
				requirements: Skill[];
			} & { teachingGoals: Skill[] }
		> = {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			lessonId: mockCtx.params!.lessonId as string,
			slug: "lesson1",
			title: "Lesson 1",
			subtitle: null,
			description: null,
			content: [
				{
					type: "article",
					value: { content: null }
				}
			],
			quiz: "Quiz",
			imgUrl: "imgUrl",
			licenseId: 1,
			requirements: [dummySkill],
			teachingGoals: [dummySkill],
			authors: [{ username: "Author1" }, { username: "Author2" }],
			selfRegulatedQuestion: null
		};

		// For the test required properties of Course
		const courseMock: Partial<
			Course & { authors: Pick<Author, "username">[] } & { content: CourseContent }
		> = {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			courseId: mockCtx.params!.courseId as string,
			slug: "course1",
			title: "Course 1",
			description: "Course 1 description",
			authors: [{ username: "author1" }],
			content: [
				{
					title: "Chapter 1",
					content: [
						{
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							lessonId: lessonMock.lessonId!
						}
					]
				}
			]
		};
		const redirectPage = "loginPage";

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findUnique as jest.Mock).mockResolvedValue(courseMock);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(lessonMock);
			(compileMarkdown as jest.Mock).mockResolvedValue("");
			global.encodeURIComponent = jest.fn().mockReturnValue("loginPage");
		});

		it("Anonymous -> Redirect to Login", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: undefined
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({
				redirect: {
					destination: `/api/auth/signin?callbackUrl=${redirectPage}`,
					permanent: false
				}
			});
		});

		it("Authenticated -> 200", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { name: "user1" }
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({
				props: expect.any(Object)
			});
		});
	});
});
