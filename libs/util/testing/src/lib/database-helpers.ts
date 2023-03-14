import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";

export async function createTestUser(username: string) {
	const user: Prisma.UserCreateInput = {
		name: username,
		id: username,
		displayName: username,
		accounts: {
			create: [
				{
					id: username,
					provider: "test",
					providerAccountId: username,
					type: "test-account"
				}
			]
		},
		student: {
			create: {
				username
			}
		}
	};

	await database.user.upsert({
		where: { id: username },
		create: user,
		update: {}
	});
}
