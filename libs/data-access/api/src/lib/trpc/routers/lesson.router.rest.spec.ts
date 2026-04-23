import { restQuery, createLessonMock } from "@self-learning/util/testing";
import { database } from "@self-learning/database";
import { UserFromSession } from "../context";

// Mock the database
jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		lesson: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			findFirst: jest.fn(),
			count: jest.fn()
		},
		user: {
			findMany: jest.fn()
		},
		completedLesson: {
			findMany: jest.fn()
		},
		$transaction: jest.fn()
	}
}));

describe("REST API of Lesson Router", () => {
	const privilegedUser: UserFromSession = {
		id: "1",
		name: "user",
		role: "ADMIN",
		isAuthor: true,
		avatarUrl: null,
		enabledFeatureLearningDiary: false,
		enabledLearningStatistics: false
	};

	describe("[GET]: /lessons", () => {
		// Define proper types for our mock data
		type MockAuthorObject = {
			username: string;
			displayName?: string;
			slug?: string;
			imgUrl?: string | null;
		};

		type MockAuthor = string | MockAuthorObject;

		type MockLesson = {
			lessonId: string;
			title: string;
			slug: string;
			updatedAt: Date;
			authors: MockAuthor[];
		};

		const lessonsMock: MockLesson[] = Array(15)
			.fill(null)
			.map((_, index) => {
				const lesson = createLessonMock({
					title: `Lesson ${index}`,
					lessonId: `lesson${index}`,
					slug: `slug${index}`,
					authors: ["Author1"]
				});
				// Add updatedAt property manually since it's not in the mock type
				return {
					lessonId: lesson.lessonId,
					title: lesson.title || `Lesson ${index}`,
					slug: lesson.slug || `slug${index}`,
					updatedAt: new Date(`2024-01-${String(index + 1).padStart(2, "0")}T00:00:00Z`),
					authors: [{ username: "Author1" }] as MockAuthor[] // Use consistent object format
				};
			});

		// Modify some lessons to have different authors
		for (let i = 5; i < 10; i++) {
			lessonsMock[i] = {
				...lessonsMock[i],
				authors: [
					{
						username: "Author2",
						displayName: "Author Two",
						slug: "author-2",
						imgUrl: null
					}
				] as MockAuthor[]
			};
		}
		for (let i = 10; i < lessonsMock.length; i++) {
			lessonsMock[i] = {
				...lessonsMock[i],
				authors: [
					{
						username: "Author1",
						displayName: "Author One",
						slug: "author-1",
						imgUrl: null
					},
					{
						username: "Author2",
						displayName: "Author Two",
						slug: "author-2",
						imgUrl: null
					}
				] as MockAuthor[]
			};
		}

		beforeEach(() => {
			jest.clearAllMocks();

			// Mock the individual database methods
			(database.lesson.findMany as jest.Mock).mockImplementation(async query => {
				let lessons: MockLesson[] = [...lessonsMock];

				// Simulate filtering by title (WHERE query)
				if (query.where && query.where.title && query.where.title.contains) {
					const titleFilter: string = query.where.title.contains.toLowerCase();
					lessons = lessons.filter(lesson =>
						lesson.title.toLowerCase().includes(titleFilter)
					);
				}

				// Simulate filtering by author (WHERE query)
				if (query.where && query.where.authors) {
					const authorFilter: string = query.where.authors.some.username;
					lessons = lessons.filter(lesson =>
						lesson.authors.some(author => {
							if (typeof author === "string") {
								return author === authorFilter;
							} else {
								return author.username === authorFilter;
							}
						})
					);
				}

				// Simulate pagination
				const skip = query.skip || 0;
				const take = query.take || lessons.length;
				const paginatedLessons = lessons.slice(skip, skip + take);

				// Return lessons with the structure expected by the router
				return paginatedLessons.map(lesson => ({
					lessonId: lesson.lessonId,
					title: lesson.title,
					slug: lesson.slug,
					updatedAt: lesson.updatedAt,
					authors: lesson.authors.map((author: MockAuthor) => {
						if (typeof author === "string") {
							return {
								displayName: `Display ${author}`,
								slug: author.toLowerCase(),
								imgUrl: null
							};
						} else {
							return {
								displayName: author.displayName || `Display ${author.username}`,
								slug: author.slug || author.username.toLowerCase(),
								imgUrl: author.imgUrl || null
							};
						}
					})
				}));
			});

			(database.lesson.count as jest.Mock).mockImplementation(async query => {
				let lessons: MockLesson[] = [...lessonsMock];

				// Apply the same filtering logic as findMany
				if (query.where && query.where.title && query.where.title.contains) {
					const titleFilter: string = query.where.title.contains.toLowerCase();
					lessons = lessons.filter(lesson =>
						lesson.title.toLowerCase().includes(titleFilter)
					);
				}

				if (query.where && query.where.authors) {
					const authorFilter: string = query.where.authors.some.username;
					lessons = lessons.filter(lesson =>
						lesson.authors.some(author => {
							if (typeof author === "string") {
								return author === authorFilter;
							} else {
								return author.username === authorFilter;
							}
						})
					);
				}

				return lessons.length;
			});

			// Mock the transaction to call the individual methods
			(database.$transaction as jest.Mock).mockImplementation(async operations => {
				// Execute the operations and return their results
				const results = await Promise.all(operations);
				return results;
			});
		});

		it("should list all lessons (paginated) if no filter specified", async () => {
			const pageSize = 20;

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons"],
					page: JSON.stringify(1),
					pageSize: JSON.stringify(pageSize)
				},
				user: privilegedUser
			});

			const expected = {
				result: lessonsMock.slice(0, pageSize).map(lesson => ({
					lessonId: lesson.lessonId,
					title: lesson.title,
					slug: lesson.slug,
					updatedAt: lesson.updatedAt.toISOString(),
					authors: lesson.authors.map((author: MockAuthor) => {
						if (typeof author === "string") {
							return {
								displayName: `Display ${author}`,
								slug: author.toLowerCase(),
								imgUrl: null
							};
						} else {
							return {
								displayName: author.displayName || `Display ${author.username}`,
								slug: author.slug || author.username.toLowerCase(),
								imgUrl: author.imgUrl || null
							};
						}
					})
				})),
				pageSize,
				page: 1,
				totalCount: lessonsMock.length
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});

		it("should accept filter parameter: title", async () => {
			const pageSize = 20;
			const titleFilter = "5"; // Should match "Lesson 5"

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons"],
					page: JSON.stringify(1),
					pageSize: JSON.stringify(pageSize),
					title: titleFilter
				},
				user: privilegedUser
			});

			// Filter lessons that contain "5" in title
			const filteredLessons = lessonsMock.filter(lesson =>
				lesson.title.toLowerCase().includes(titleFilter)
			);

			const expected = {
				result: filteredLessons.map(lesson => ({
					lessonId: lesson.lessonId,
					title: lesson.title,
					slug: lesson.slug,
					updatedAt: lesson.updatedAt.toISOString(),
					authors: lesson.authors.map((author: MockAuthor) => {
						if (typeof author === "string") {
							return {
								displayName: `Display ${author}`,
								slug: author.toLowerCase(),
								imgUrl: null
							};
						} else {
							return {
								displayName: author.displayName || `Display ${author.username}`,
								slug: author.slug || author.username.toLowerCase(),
								imgUrl: author.imgUrl || null
							};
						}
					})
				})),
				pageSize,
				page: 1,
				totalCount: filteredLessons.length
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});

		it("should accept filter parameter: authorName", async () => {
			const pageSize = 20;

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons"],
					page: JSON.stringify(1),
					pageSize: JSON.stringify(pageSize),
					authorName: "Author1"
				},
				user: privilegedUser
			});

			// Filter lessons that have "Author1" (exclude indices 5-9 which only have Author2)
			const filteredLessons = lessonsMock.filter(lesson =>
				lesson.authors.some(author => {
					if (typeof author === "string") {
						return author === "Author1";
					} else {
						return author.username === "Author1";
					}
				})
			);

			const expected = {
				result: filteredLessons.map(lesson => ({
					lessonId: lesson.lessonId,
					title: lesson.title,
					slug: lesson.slug,
					updatedAt: lesson.updatedAt.toISOString(),
					authors: lesson.authors.map((author: MockAuthor) => {
						if (typeof author === "string") {
							return {
								displayName: `Display ${author}`,
								slug: author.toLowerCase(),
								imgUrl: null
							};
						} else {
							return {
								displayName: author.displayName || `Display ${author.username}`,
								slug: author.slug || author.username.toLowerCase(),
								imgUrl: author.imgUrl || null
							};
						}
					})
				})),
				pageSize,
				page: 1,
				totalCount: filteredLessons.length
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});

		it("should handle pagination correctly", async () => {
			const pageSize = 5;
			const page = 2;

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons"],
					page: JSON.stringify(page),
					pageSize: JSON.stringify(pageSize)
				},
				user: privilegedUser
			});

			const expected = {
				result: lessonsMock.slice(5, 10).map(lesson => ({
					lessonId: lesson.lessonId,
					title: lesson.title,
					slug: lesson.slug,
					updatedAt: lesson.updatedAt.toISOString(),
					authors: lesson.authors.map((author: MockAuthor) => {
						if (typeof author === "string") {
							return {
								displayName: `Display ${author}`,
								slug: author.toLowerCase(),
								imgUrl: null
							};
						} else {
							return {
								displayName: author.displayName || `Display ${author.username}`,
								slug: author.slug || author.username.toLowerCase(),
								imgUrl: author.imgUrl || null
							};
						}
					})
				})),
				pageSize,
				page: 2,
				totalCount: lessonsMock.length
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});
		it("should return 401 on unauthorized calls", async () => {
			const pageSize = 20;

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons"],
					page: JSON.stringify(1),
					pageSize: JSON.stringify(pageSize)
				}
			});

			expect(response.statusCode).toBe(401);
		});
	});

	describe("[GET]: /lessons/{slug}", () => {
		const lessonMock = {
			...createLessonMock({
				title: "Test Lesson",
				lessonId: "lesson1",
				slug: "test-lesson",
				authors: ["Author1"]
			}),
			description: "A comprehensive test lesson for students"
		};

		beforeEach(() => {
			jest.clearAllMocks();

			// Mock the database response
			(database.lesson.findUnique as jest.Mock).mockImplementation(async query => {
				if (query.where.slug === lessonMock.slug) {
					return {
						lessonId: lessonMock.lessonId,
						title: lessonMock.title,
						slug: lessonMock.slug,
						description: lessonMock.description
					};
				}
				return null;
			});
		});

		it("should return lesson information for valid slug", async () => {
			const response = await restQuery({
				method: "GET",
				query: { trpc: ["lessons", lessonMock.slug] },
				user: privilegedUser
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				title: lessonMock.title,
				slug: lessonMock.slug,
				lessonId: lessonMock.lessonId,
				description: lessonMock.description
			});
		});

		it("should return lesson information with null description", async () => {
			// Override mock to return null description
			(database.lesson.findUnique as jest.Mock).mockImplementationOnce(async () => ({
				lessonId: lessonMock.lessonId,
				title: lessonMock.title,
				slug: lessonMock.slug,
				description: null
			}));

			const response = await restQuery({
				method: "GET",
				query: { trpc: ["lessons", lessonMock.slug] },
				user: privilegedUser
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				title: lessonMock.title,
				slug: lessonMock.slug,
				lessonId: lessonMock.lessonId,
				description: null
			});
		});

		it("should return 404 for invalid slug", async () => {
			const response = await restQuery({
				method: "GET",
				query: { trpc: ["lessons", "invalid-slug-id"] },
				user: privilegedUser
			});

			expect(response.statusCode).toBe(404);
			expect(response.body).toMatchObject({
				code: "NOT_FOUND",
				message: "Lesson not found for slug: invalid-slug-id"
			});
		});

		it("should return 401 on unauthorized calls", async () => {
			const response = await restQuery({
				method: "GET",
				query: { trpc: ["lessons", lessonMock.slug] }
			});

			expect(response.statusCode).toBe(401);
		});
	});

	describe("[GET]: /lessons/{slug}/progress", () => {
		const lessonMock = createLessonMock({
			lessonId: "lesson1",
			slug: "test-lesson",
			title: "Test Lesson",
			authors: ["teacher1", "teacher2"]
		});

		// Test users
		const lessonAuthor1: UserFromSession = {
			id: "1",
			name: "teacher1", // First author - should have access
			role: "USER",
			isAuthor: true,
			avatarUrl: null,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};

		const lessonAuthor2: UserFromSession = {
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
			name: "teacher3", // Not an author of this lesson - should be blocked
			role: "USER",
			isAuthor: true,
			avatarUrl: null,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};

		const adminNonAuthor: UserFromSession = {
			id: "4",
			name: "admin1", // Admin but NOT author of this lesson - should be blocked
			role: "ADMIN",
			isAuthor: true,
			avatarUrl: null,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false
		};

		beforeEach(() => {
			jest.clearAllMocks();

			// Mock lesson.findUnique for 404 check
			(database.lesson.findUnique as jest.Mock).mockImplementation(async query => {
				if (query.where.slug === "test-lesson") {
					return { lessonId: lessonMock.lessonId };
				}
				return null; // Lesson doesn't exist
			});

			// Mock lesson.findFirst for authorization check
			(database.lesson.findFirst as jest.Mock).mockImplementation(async query => {
				// Check if the requesting user is one of the lesson authors
				const requestingUser = query.where.authors?.some?.username;
				const lessonAuthors = ["teacher1", "teacher2"]; // Multiple authors

				if (lessonAuthors.includes(requestingUser)) {
					return { lessonId: lessonMock.lessonId };
				}
				return null; // User is not an author (includes admins who aren't authors)
			});

			// Mock user.findMany for valid users check
			(database.user.findMany as jest.Mock).mockImplementation(async query => {
				const requestedUsernames = query.where.name.in || [];
				const allUsers = [
					{ name: "student1" },
					{ name: "student2" }
					// Note: student3 doesn't exist in system
				];

				return allUsers.filter(user => requestedUsernames.includes(user.name));
			});

			// Mock completedLesson.findMany for progress data
			(database.completedLesson.findMany as jest.Mock).mockImplementation(async query => {
				const requestedUsernames = query.where.username?.in || [];

				// Simulate completion data - student1 completed, student2 did not
				const completionData = [
					{ username: "student1" } // student1 completed the lesson
					// student2 has not completed the lesson
				];

				return completionData.filter(data => requestedUsernames.includes(data.username));
			});
		});

		it("should return progress for valid students only", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "student1,student2,student3" // student3 doesn't exist
				},
				user: lessonAuthor1 // First author
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([
				{ username: "student1", progress: 1 }, // Completed
				{ username: "student2", progress: 0 } // Not completed
				// student3 not in results (doesn't exist in system)
			]);
		});

		it("should allow access for second lesson author", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "student1,student2"
				},
				user: lessonAuthor2 // Second author should also have access
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([
				{ username: "student1", progress: 1 },
				{ username: "student2", progress: 0 }
			]);
		});

		it("should return empty array when no usernames provided", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"]
					// No usernames parameter
				},
				user: lessonAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([]);
		});

		it("should return empty array for empty usernames string", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "" // Empty string
				},
				user: lessonAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([]);
		});

		it("should handle usernames with whitespace correctly", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: " student1 , student2 " // Extra whitespace
				},
				user: lessonAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([
				{ username: "student1", progress: 1 },
				{ username: "student2", progress: 0 }
			]);
		});

		it("should return 403 for non-author users", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "student1,student2"
				},
				user: nonAuthor // This user is NOT an author of the lesson
			});

			expect(response.statusCode).toBe(403);
			expect(response.body).toMatchObject({
				code: "FORBIDDEN",
				message: "You are not an author of this lesson."
			});
		});

		it("should return 403 for admin users who are not lesson authors", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "student1,student2"
				},
				user: adminNonAuthor // Admin but NOT author of this lesson
			});

			expect(response.statusCode).toBe(403);
			expect(response.body).toMatchObject({
				code: "FORBIDDEN",
				message: "You are not an author of this lesson."
			});
		});

		it("should return 401 for unauthorized requests", async () => {
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "student1,student2"
				}
				// No user provided at all
			});

			expect(response.statusCode).toBe(401);
		});

		it("should handle students with no completion data", async () => {
			// Override the completedLesson mock for this test
			(database.completedLesson.findMany as jest.Mock).mockImplementationOnce(async () => {
				return []; // No completed lessons
			});

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "student1,student2"
				},
				user: lessonAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([
				{ username: "student1", progress: 0 }, // No completion
				{ username: "student2", progress: 0 } // No completion
			]);
		});

		it("should return 404 for non-existent lesson", async () => {
			// Override the findUnique mock to return null (lesson doesn't exist)
			(database.lesson.findUnique as jest.Mock).mockImplementationOnce(async () => null);

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "non-existent-lesson", "progress"],
					usernames: "student1,student2"
				},
				user: lessonAuthor1
			});

			expect(response.statusCode).toBe(404);
			expect(response.body).toMatchObject({
				code: "NOT_FOUND",
				message: "Lesson not found for slug: non-existent-lesson"
			});
		});

		it("should return empty array when no valid users found", async () => {
			// Override the user.findMany mock to return empty array
			(database.user.findMany as jest.Mock).mockImplementationOnce(async () => []);

			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["lessons", "test-lesson", "progress"],
					usernames: "nonexistent1,nonexistent2"
				},
				user: lessonAuthor1
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual([]);
		});
	});
});
