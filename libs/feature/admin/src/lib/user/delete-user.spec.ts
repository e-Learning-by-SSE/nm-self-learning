import { DeletedEntities, deleteUserAndDependentData } from "./delete-user";
import { database } from "@self-learning/database";

describe('deleteUserAndDependentData Integration Test', () => {
    const testUsername = 'testUser';
    const deletedEntities: DeletedEntities[] = [];
  
    beforeAll(async () => {
        const user = await database.user.create({
        data: {
            name: testUsername,
            displayName: 'Test User',
            email: 'testuser@example.com',
          },
      });

      await database.student.create({
        data: {
          userId: user.id,
          username: user.name,
        },
      });

      const author = await database.author.create({
        data: {
          username: user.name,
          displayName: 'Test Author',
          slug: 'test-author',
        },
      });
      await database.course.create({
        data: {
          courseId: 'testCourse',
          slug: 'test-course',
          title: 'Test Course',
          content: 'This is a test course',
          meta: {},
          subtitle: 'A test course',
          authors: {
            connect: { username: author.username },
          },
        },
      });
      await database.lesson.create({
        data: {
          lessonId: 'testLesson',
          slug: 'test-lesson',
          title: 'Test Lesson',
          content: 'This is a test lesson',
          meta: {},
          authors: {
            connect: { username: author.username },
          },
        },
      });

      await database.uploadedAssets.create({
        data: {
            objectName: 'testObject',
            fileName: 'testFile.jpg',
            fileType: 'image/jpeg',
            publicUrl: 'http://example.com/testFile.jpg',
            username: user.name,
          },
      });
    });
  
    it('should delete the user and all dependent data', async () => {
        await deleteUserAndDependentData(testUsername, deletedEntities, database);

    const user = await database.user.findUnique({
      where: { name: testUsername },
    });
    expect(user).toBeNull();

    const assets = await database.uploadedAssets.findMany({
      where: { username: testUsername },
    });
    expect(assets).toHaveLength(0);

    const author = await database.author.findUnique({
      where: { username: testUsername },
    });
    expect(author).toBeNull();

    const courses = await database.course.findMany({
      where: {
        authors: {
          some: { username: testUsername },
        },
      },
    });
    expect(courses).toHaveLength(0);

    const lessons = await database.lesson.findMany({
      where: {
        authors: {
          some: { username: testUsername },
        },
      },
    });
    expect(lessons).toHaveLength(0);

    const student = await database.student.findUnique({
      where: { username: testUsername },
    });
    expect(student).toBeNull();

    expect(deletedEntities.length).toBeGreaterThan(0); 
    expect(deletedEntities).toContainEqual(expect.objectContaining({ entityType: 'User', entityId: testUsername }));
      });
    });
    