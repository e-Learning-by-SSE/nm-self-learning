import { PrismaClient } from "@prisma/client";


export async function deleteUserAndDependentData(username: string,
     deletedEntities: DeletedEntities[],
      database: PrismaClient) {
	await database.$transaction(async (transaction) => {
		
        const deletedAssets = await transaction.uploadedAssets.deleteMany({
			where: { username: username },
		});
		if (deletedAssets.count > 0) {
			deletedEntities.push({ entityType: 'UploadedAssets', count: deletedAssets.count });
		}

		const author = await transaction.author.findUnique({
			where: { username: username },
			include: {
				courses: true,
				lessons: true,
			},
		});


		if (author) {
			for (const lesson of author.lessons) {
				await transaction.lesson.delete({
					where: { lessonId: lesson.lessonId },
				});
				deletedEntities.push({ entityType: 'Lesson', entityId: lesson.lessonId });
			}


			for (const course of author.courses) {
				await transaction.course.delete({
					where: { courseId: course.courseId },
				});
				deletedEntities.push({ entityType: 'Course', entityId: course.courseId });
			}


			await transaction.author.delete({
				where: { username: username },
			});
			deletedEntities.push({ entityType: 'Author', entityId: author.id.toString() });
		}


		const deletedStudents = await transaction.student.deleteMany({
			where: { username: username },
		});
		if (deletedStudents.count > 0) {
			deletedEntities.push({ entityType: 'Student', count: deletedStudents.count });
		}

		await transaction.user.delete({
			where: { name: username },
		});

		deletedEntities.push({ entityType: 'User', entityId: username });
	});
}


export type DeletedEntities = {
    entityType: string;
    entityId?: string;
    count?: number;
};
