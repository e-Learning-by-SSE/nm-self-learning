import { NotificationChannel, NotificationType, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function getDefaultNotificationData(defaultValue?: boolean) {
	const types = Object.values(NotificationType);
	const channels = Object.values(NotificationChannel);
	return types.flatMap(type =>
		channels.map(channel => ({
			type,
			channel,
			enabled: defaultValue // if undefined -> prisma default
		}))
	);
}

export async function createInitialNotificationSettings(
	user: { id: string },
	client: Prisma.TransactionClient | PrismaClient
) {
	await client.userNotificationSetting.createMany({
		data: getDefaultNotificationData().map(setting => ({
			...setting,
			userId: user.id
		}))
	});
}

export async function createNewProfile(
	username: string,
	tx: PrismaClient | Prisma.TransactionClient
) {
	const newStreak = {
		count: 1,
		status: "active",
		pausedUntil: null
	};

	await tx.gamificationProfile.create({
		data: {
			user: { connect: { name: username } },
			username,
			lastLogin: new Date(),
			// energy: 2, // default handles by prisma
			loginStreak: newStreak
		}
	});
}

async function main() {
	try {
		await prisma.$transaction(async tx => {
			const userSettings = await tx.user.findMany({
				include: {
					gamificationProfile: true
				}
			});

			const promises = userSettings.map(async user => {
				if (!user.gamificationProfile) {
					// since we introduce this newly, users should never already have gamification profiles
					await createNewProfile(user.name, tx);
				}
				await createInitialNotificationSettings(user, tx);
				return tx.features.upsert({
					where: { userId: user.id },
					create: {
						userId: user.id,
						username: user.name,
						learningDiary: user.enabledFeatureLearningDiary,
						learningStatistics: user.enabledLearningStatistics
					},
					update: {
						learningDiary: user.enabledFeatureLearningDiary,
						learningStatistics: user.enabledLearningStatistics
					}
				});
			});

			await Promise.all(promises);
		});
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
