import { Prisma, PrismaClient } from "@prisma/client";
import { database } from "@self-learning/database";
import { Flames, GamificationProfile, LoginStreak } from "@self-learning/types";

export async function createNewProfile(
	username: string,
	tx: PrismaClient | Prisma.TransactionClient = database
) {
	const newStreak = {
		count: 1,
		status: "active",
		pausedUntil: null
	} satisfies LoginStreak;

	const newFlames = {
		count: 0,
		maxCount: 2
	} satisfies Flames;

	const data = await tx.gamificationProfile.create({
		data: {
			user: { connect: { id: username } },
			username,
			lastLogin: new Date(),
			flames: newFlames,
			loginStreak: newStreak
		}
	});
	return data as unknown as GamificationProfile;
}
