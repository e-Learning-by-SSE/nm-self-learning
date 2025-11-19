import { Prisma, PrismaClient } from "@prisma/client";
import { database } from "@self-learning/database";
import { GamificationProfile, LoginStreak } from "@self-learning/types";

export async function createNewProfile(
	username: string,
	tx: PrismaClient | Prisma.TransactionClient = database
) {
	const newStreak = {
		count: 1,
		status: "active",
		pausedUntil: null
	} satisfies LoginStreak;

	const data = await tx.gamificationProfile.create({
		data: {
			user: { connect: { name: username } },
			username,
			lastLogin: new Date(),
			// energy: 2, // default handles by prisma 
			loginStreak: newStreak
		}
	});
	return data as unknown as GamificationProfile;
}
