import { createCourseMock, callOpenApi } from "@self-learning/util/testing";
import { database } from "@self-learning/database";
import { UserFromSession } from "../context";

// Mock the database
jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			findFirst: jest.fn()
		},
		enrollment: {
			findMany: jest.fn()
		},
		completedLesson: {
			groupBy: jest.fn()
		}
	}
}));

describe("REST API of Course Router", () => {
	const privilegedUser: UserFromSession = {
		id: "1",
		name: "user",
		role: "ADMIN",
		isAuthor: true,
		avatarUrl: null,
		featureFlags: {
			experimental: false,
			learningDiary: false,
			learningStatistics: false
		}
	};

	describe("[GET]: /courses", () => {
		const coursesMock = Array(15)
			.fill(null)
			.map((_, index) => {
				return createCourseMock({
					title: `Course ${index}`,
					courseId: `course ${index}`,
					slug: `slug${index}`,
					authors: ["Author1"],
					content: []
				});
			});
		for (let i = 5; i < 10; i++) {
			coursesMock[i].authors = [{ username: "Author2" }];
		}
		for (let i = 10; i < coursesMock.length; i++) {
			coursesMock[i].authors = [{ username: "Author1" }, { username: "Author2" }];
		}

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findMany as jest.Mock).mockImplementation(async query => {
				let courses = coursesMock;

				// Simulate filtering by author (WHERE query)
				if (query.where && query.where.authors) {
					courses = courses.filter(course =>
						course.authors.some(
							author => author.username === query.where.authors.some.username
						)
					);
				}

				return courses;
			});
		});

		it("should list all courses (paginated) if no filter specified", async () => {
			const pageSize = 20;

			const response = await callOpenApi({
				method: "GET",
				path: "/courses",
				query: { page: 1, pageSize },
				headers: { "content-type": "application/json" },
				user: privilegedUser
			});

			const expected = {
				result: coursesMock.slice(0, pageSize).map(course => ({
					title: course.title,
					slug: course.slug
				})),
				pageSize,
				page: 1,
				totalCount: coursesMock.length
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});

		it("should accept filter parameter: authorId", async () => {
			const pageSize = 20;

			const response = await callOpenApi({
				method: "GET",
				path: "/courses",
				query: { page: 1, pageSize, authorId: "Author1" },
				headers: { "content-type": "application/json" },
				user: privilegedUser
			});

			// Remove courses without "Author1": [5, 6, 7, 8, 9]
			coursesMock.splice(5, 5);
			const expected = {
				result: coursesMock.map(course => ({
					title: course.title,
					slug: course.slug
				})),
				pageSize,
				page: 1,
				totalCount: Math.min(coursesMock.length, pageSize)
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});

		it("should return 404 on unauthorized calls", async () => {
			const pageSize = 20;

			const response = await callOpenApi({
				method: "GET",
				path: "/courses",
				query: { page: 1, pageSize, authorId: "Author1" },
				headers: { "content-type": "application/json" }
			});

			expect(response.statusCode).toBe(401);
		});
	});

	describe("[GET]: /courses/{slug}", () => {
		// For the test required properties of Course
		const courseMock = createCourseMock({
			title: "Course 1",
			subtitle: "Subtitle 1",
			courseId: "course1",
			slug: "slug1",
			authors: ["Author1"],
			content: [
				{
					chapterTitle: "Chapter 1",
					lessons: ["lesson1"]
				}
			],
			description: "Course Description"
		});

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findUnique as jest.Mock).mockImplementation(async input => {
				if (input.where.slug === courseMock.slug) {
					return courseMock;
				} else {
					return null;
				}
			});
		});

		it("should return course information for valid slug", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}`,
				user: privilegedUser
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				title: courseMock.title,
				subtitle: courseMock.subtitle,
				slug: courseMock.slug,
				lessons: courseMock.content.reduce(
					(acc, chapter) => acc + chapter.content.length,
					0
				),
				description: courseMock.description
			});
		});

		it("should return 404 for invalid slug", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/invalid-slug-id`,
				user: privilegedUser
			});

			expect(response.statusCode).toBe(404);
		});

		it("should return 401 on unauthorized calls", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}`
			});

			expect(response.statusCode).toBe(401);
		});
	});

	// testing of getProgress end-point
	describe("[GET]: /courses/{slug}/progress", () => {
		const courseMock = createCourseMock({
			courseId: "course1",
			slug: "test-course",
			title: "Test Course",
			authors: ["teacher1", "teacher2"], // Multiple authors
			content: [
				{
					chapterTitle: "Chapter 1",
					lessons: ["lesson1", "lesson2", "lesson3", "lesson4"]
				}
			]
		});

		// Test users
		const courseAuthor1: UserFromSession = {
			id: "1",
			name: "teacher1", // First author - should have access
			role: "USER",
			isAuthor: true,
			avatarUrl: null,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};

		const courseAuthor2: UserFromSession = {
			id: "2",
			name: "teacher2", // Second author - should also have access
			role: "USER",
			isAuthor: true,
			avatarUrl: null,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};

		const nonAuthor: UserFromSession = {
			id: "3",
			name: "teacher3", // Not an author of this course - should be blocked
			role: "USER",
			isAuthor: true,
			avatarUrl: null,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};

		const adminNonAuthor: UserFromSession = {
			id: "4",
			name: "admin1", // Admin but NOT author of this course - should be blocked
			role: "ADMIN",
			isAuthor: true,
			avatarUrl: null,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};

		beforeEach(() => {
			jest.clearAllMocks();

			// Mock course.findFirst for authorization check
			(database.course.findFirst as jest.Mock).mockImplementation(async query => {
				// Check if the requesting user is one of the course authors
				const requestingUser = query.where.authors?.some?.username;
				const courseAuthors = ["teacher1", "teacher2"]; // Multiple authors

				if (courseAuthors.includes(requestingUser)) {
					return {
						courseId: courseMock.courseId,
						content: courseMock.content
					};
				}
				return null; // User is not an author (includes admins who aren't authors)
			});

			// Mock course.findUnique for 404 check
			(database.course.findUnique as jest.Mock).mockImplementation(async query => {
				if (query.where.slug === "test-course") {
					return {
						courseId: courseMock.courseId,
						content: courseMock.content
					};
				}
				return null; // Course doesn't exist
			});

			// Mock enrollment.findMany for enrolled students check
			(database.enrollment.findMany as jest.Mock).mockImplementation(async query => {
				const requestedUsernames = query.where.username.in || [];
				const allEnrollments = [
					{ username: "student1" },
					{ username: "student2" }
					// Note: student3 is NOT enrolled
				];

				return allEnrollments.filter(enrollment =>
					requestedUsernames.includes(enrollment.username)
				);
			});

			// Mock completedLesson.groupBy for progress data
			(database.completedLesson.groupBy as jest.Mock).mockImplementation(async query => {
				const requestedUsernames = query.where.username?.in || [];

				// Simulate different progress levels
				const progressData = [
					{ username: "student1", _count: { lessonId: 2 } }, // 2/4 = 50%
					{ username: "student2", _count: { lessonId: 4 } } // 4/4 = 100%
				];

				return progressData.filter(data => requestedUsernames.includes(data.username));
			});
		});

		it("should return progress for enrolled students only", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}/progress`,
				query: { usernames: "student1,student2,student3" }, // student3 not enrolled
				headers: { "content-type": "application/json" },
				user: courseAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([
				{ username: "student1", progress: 50 }, // 2/4 lessons = 50%
				{ username: "student2", progress: 100 } // 4/4 lessons = 100%
				// student3 not in results (not enrolled)
			]);
		});

		it("should allow access for second course author", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}/progress`,
				query: { usernames: "student1,student2" },
				headers: { "content-type": "application/json" },
				user: courseAuthor2 // Second author should also have access
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([
				{ username: "student1", progress: 50 },
				{ username: "student2", progress: 100 }
			]);
		});

		it("should return empty array when no usernames provided", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}/progress`,
				query: {},
				headers: { "content-type": "application/json" },
				user: courseAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([]);
		});

		it("should return 403 for non-author users", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}/progress`,
				query: { usernames: "student1,student2" },
				headers: { "content-type": "application/json" },
				user: nonAuthor // This user is NOT an author of the course
			});

			expect(response.statusCode).toBe(403);
			expect(response.body).toMatchObject({
				code: "FORBIDDEN",
				message: "You are not an author of this course."
			});
		});

		it("should return 403 for admin users who are not course authors", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}/progress`,
				query: { usernames: "student1,student2" },
				headers: { "content-type": "application/json" },
				user: adminNonAuthor // Admin but NOT author of this course
			});

			expect(response.statusCode).toBe(403);
			expect(response.body).toMatchObject({
				code: "FORBIDDEN",
				message: "You are not an author of this course."
			});
		});

		it("should return 401 for unauthorized requests", async () => {
			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}/progress`,
				query: { usernames: "student1,student2" },
				headers: { "content-type": "application/json" }
				// No user provided at all
			});

			expect(response.statusCode).toBe(401);
		});

		it("should handle students with zero progress", async () => {
			// Override the completedLesson mock for this test
			(database.completedLesson.groupBy as jest.Mock).mockImplementationOnce(async () => {
				return []; // No completed lessons
			});

			const response = await callOpenApi({
				method: "GET",
				path: `/courses/${courseMock.slug}/progress`,
				query: { usernames: "student1" },
				headers: { "content-type": "application/json" },
				user: courseAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([
				{ username: "student1", progress: 0 } // 0/4 lessons = 0%
			]);
		});

		it("should return 404 for non-existent course", async () => {
			// Override the findUnique mock to return null (course doesn't exist)
			(database.course.findUnique as jest.Mock).mockImplementationOnce(async () => null);

			const response = await callOpenApi({
				method: "GET",
				path: `/courses/non-existent-course/progress`,
				query: { usernames: "student1,student2" },
				headers: { "content-type": "application/json" },
				user: courseAuthor1
			});

			expect(response.statusCode).toBe(404);
			expect(response.body).toMatchObject({
				code: "NOT_FOUND",
				message: "Course not found for slug: non-existent-course"
			});
		});
	});
});
