import { deleteUserAndDependentData } from "./delete-user";
import { database } from "@self-learning/database";
import { createTestUser } from "@self-learning/util/testing";

describe("deleteUserAndDependentData Integration Test", () => {
	const testUsername = "testUser";

	beforeAll(async () => {
		const user = await createTestUser(testUsername);
		await database.student.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                username: user.name
            }
        });

        const author = await database.author.upsert({
            where: { username: user.name },
            update: {},
            create: {
                username: user.name,
                displayName: "Test Author",
                slug: "test-author"
            }
        });

        await database.course.upsert({
            where: { courseId: "testCourse" },
            update: {},
            create: {
                courseId: "testCourse",
                slug: "test-course",
                title: "Test Course",
                content: "This is a test course",
                meta: {},
                subtitle: "A test course",
                authors: {
                    connect: { username: author.username }
                }
            }
        });

        await database.lesson.upsert({
            where: { lessonId: "testLesson" },
            update: {},
            create: {
                lessonId: "testLesson",
                slug: "test-lesson",
                title: "Test Lesson",
                content: "This is a test lesson",
                meta: {},
                authors: {
                    connect: { username: author.username }
                }
            }
        });

        await database.uploadedAssets.upsert({
            where: { objectName: "testObject" },
            update: {},
            create: {
                objectName: "testObject",
                fileName: "testFile.jpg",
                fileType: "image/jpeg",
                publicUrl: "http://example.com/testFile.jpg",
                username: user.name
            }
        });
	});

	it("should delete the user and all dependent data", async () => {
		await deleteUserAndDependentData(testUsername, database);

		const user = await database.user.findUnique({
			where: { name: testUsername }
		});
		expect(user).toBeNull();

		const assets = await database.uploadedAssets.findMany({
			where: { username: testUsername }
		});
		expect(assets).toHaveLength(0);

		const author = await database.author.findUnique({
			where: { username: testUsername }
		});
		expect(author).toBeNull();

		const courses = await database.course.findMany({
			where: {
				authors: {
					some: { username: testUsername }
				}
			}
		});
		expect(courses).toHaveLength(0);

		const lessons = await database.lesson.findMany({
			where: {
				authors: {
					some: { username: testUsername }
				}
			}
		});
		expect(lessons).toHaveLength(0);

		const student = await database.student.findUnique({
			where: { username: testUsername }
		});
		expect(student).toBeNull();
	});
});
