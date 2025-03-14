import { database } from "@self-learning/database";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

/**
 * Creates a user session based on the provided username (e.g., given by Auth provider or Bearer token).
 * @param username The username of the user, provided by Auth provider or Bearer token
 * @param token The JWT token if used inside the Next Auth provider
 * @returns The user session
 */
export async function createUserSession({
	username,
	token
}: {
	username: string;
	token?: JWT;
}): Promise<Session["user"]> {
	if (!username) throw new Error("Username is not defined.");

	let userFromDb = await database.user.findUniqueOrThrow({
		where: { name: username },
		select: {
			id: true,
			role: true,
			image: true,
			author: { select: { username: true } },
			enabledFeatureLearningDiary: true,
			enabledLearningStatistics: true
		}
	});

	if (userFromDb.role === "ADMIN" && token && token["isAdmin"] === false) {
		// DB: User is Admin, Auth-Server (Uni): User is no (longer) Admin -> Demote
		userFromDb = await database.user.update({
			where: { name: username },
			data: { role: "USER" },
			select: {
				id: true,
				role: true,
				image: true,
				author: { select: { username: true } },
				enabledFeatureLearningDiary: true,
				enabledLearningStatistics: true
			}
		});
	} else if (userFromDb.role !== "ADMIN" && token && token["isAdmin"] === true) {
		// DB: User is no Admin, Auth-Server (Uni): User is Admin -> Promote
		userFromDb = await database.user.update({
			where: { name: username },
			data: { role: "ADMIN" },
			select: {
				id: true,
				role: true,
				image: true,
				author: { select: { username: true } },
				enabledFeatureLearningDiary: true,
				enabledLearningStatistics: true
			}
		});
	}

	return {
		id: userFromDb.id,
		name: username,
		role: userFromDb.role,
		isAuthor: !!userFromDb.author,
		avatarUrl: userFromDb.image,
		enabledLearningStatistics: userFromDb.enabledLearningStatistics,
		enabledFeatureLearningDiary: userFromDb.enabledFeatureLearningDiary
	};
}
