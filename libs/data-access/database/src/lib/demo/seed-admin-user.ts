import { Author, GroupRole, Prisma, PrismaClient, User } from "@prisma/client";
import { softwareentwicklungDemoGroup } from "../seedSpecializations";
import { getDefaultNotificationData } from "../seed-functions";
import { LoginStreak } from "@self-learning/types";

const prisma = new PrismaClient();

const adminUserInput: Prisma.UserCreateInput = {
	name: "dumbledore",
	displayName: "Albus Dumbledore",
	role: "ADMIN",
	image: "https://i.imgur.com/UWMVO8m.jpeg",
	accounts: {
		create: [{ provider: "demo", providerAccountId: "dumbledore", type: "demo-account" }]
	},
	student: { create: { username: "dumbledore" } },
	author: {
		create: {
			displayName: "Albus Dumbledore",
			slug: "albus-dumbledore",
			imgUrl: "https://i.imgur.com/UWMVO8m.jpeg"
		}
	},
	memberships: {
		create: {
			group: {
				connect: {
					name: softwareentwicklungDemoGroup.name
				}
			},
			role: GroupRole.ADMIN
		}
	},
	gamificationProfile: {
		create: {
			username: "dumbledore",
			lastLogin: new Date(2025, 5, 14),
			loginStreak: {
				count: 3,
				status: "broken"
			} satisfies LoginStreak,
			energy: 10
		}
	},
	notificationSettings: {
		createMany: {
			data: getDefaultNotificationData(false)
		}
	},
	featureFlags: {
		create: {
			username: "dumbledore",
			learningStatistics: true
		}
	}
};

export type AuthorUser = User & { author: Author };

export async function seedAdminUser() {
	// if author will be null - then there is a mistake here
	const admin = await prisma.user.create({
		data: adminUserInput,
		include: { author: true }
	});
	if (!admin.author) {
		throw new Error(
			`Seeding failed: Expected 'author' relation to be created for user "${adminUserInput.name}", but received null. Check your adminUserInput structure.`
		);
	}
	return admin as AuthorUser;
}
