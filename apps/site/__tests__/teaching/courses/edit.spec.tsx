import { getServerSideProps } from "../../../pages/teaching/courses/edit/[courseId]";
import { database } from "@self-learning/database";
import { Author, Course, Lesson, Skill } from "@prisma/client";
import { getServerSession } from "next-auth";
import { CourseContent } from "@self-learning/types";
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
		course: { findUnique: jest.fn() },
		lesson: { findMany: jest.fn() }
	}
}));

describe("getServerSideProps", () => {
	const mockCtx = createMockContext({ params: { courseId: "course1" } });

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

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findUnique as jest.Mock).mockResolvedValue({
				...courseMock
			});
			(database.lesson.findMany as jest.Mock).mockResolvedValue([lessonMock]);
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

		it("Admin -> Course Property (allowed access)", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					role: "ADMIN"
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toMatchObject({
				notFound: false,
				props: {
					course: expect.any(Object),
					lessons: expect.any(Array)
				}
			});
		});

		it("Author of Lesson -> Course Property (allowed access)", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: true,
					role: "USER",
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					name: courseMock.authors![0].username
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toMatchObject({
				notFound: false,
				props: {
					course: expect.any(Object),
					lessons: expect.any(Array)
				}
			});
		});
	});
});
