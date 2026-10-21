import { PrismaClient } from "@prisma/client";

export async function deleteUserAndDependentData(username: string, database: PrismaClient) {
	return await database.$transaction(async transaction => {
		await transaction.user.delete({
			where: { name: username }
		});

		await transaction.lesson.deleteMany({
			where: { authors: { some: { username: username } } }
		});
		await transaction.course.deleteMany({
			where: { authors: { some: { username: username } } }
		});

		return true;
	});
}

export async function deleteUser(username: string, database: PrismaClient) {
	return await database.user.delete({
		where: { name: username }
	});
}
