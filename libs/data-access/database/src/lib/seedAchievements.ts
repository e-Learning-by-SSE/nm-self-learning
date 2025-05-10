import { AchievementTrigger, PrismaClient } from "@prisma/client";

export async function seedAchievements(prisma: PrismaClient): Promise<void> {
	const achievements = [
		// 🧠 Perfect Lessons
		{
			code: "PERFECT_LESSON_1",
			title: "Perfekte Lektion I",
			description: "1 perfekte Lerneinheit abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			meta: {
				group: "perfect_lessons",
				level: 1,
				requiredCount: 1
			}
		},
		{
			code: "PERFECT_LESSON_5",
			title: "Perfekte Lektion II",
			description: "5 perfekte Lerneinheiten abgeschlossen",
			xpReward: 100,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			meta: {
				group: "perfect_lessons",
				level: 2,
				requiredCount: 5
			}
		},

		// 🔁 Streaks
		{
			code: "STREAK_5",
			title: "Lernserie I",
			description: "5 Tage in Folge gelernt",
			xpReward: 75,
			category: "Kontinuität",
			trigger: AchievementTrigger.daily_login,
			meta: {
				group: "streak",
				level: 1,
				requiredDays: 5
			}
		},
		{
			code: "STREAK_10",
			title: "Lernserie II",
			description: "10 Tage in Folge gelernt",
			xpReward: 150,
			category: "Kontinuität",
			trigger: AchievementTrigger.daily_login,
			meta: {
				group: "streak",
				level: 2,
				requiredDays: 10
			}
		},

		// ⏳ Focus
		{
			code: "FOCUS_30",
			title: "Fokussiert I",
			description: "30 Minuten am Stück gelernt",
			xpReward: 30,
			category: "Fokus",
			trigger: AchievementTrigger.session_time,
			meta: {
				group: "focus",
				level: 1,
				requiredMinutes: 30
			}
		},
		{
			code: "FOCUS_60",
			title: "Fokussiert II",
			description: "1 Stunde am Stück gelernt",
			xpReward: 60,
			category: "Fokus",
			trigger: AchievementTrigger.session_time,
			meta: {
				group: "focus",
				level: 2,
				requiredMinutes: 60
			}
		}
	];

	for (const achievement of achievements) {
		await prisma.achievement.upsert({
			where: { code: achievement.code },
			update: {},
			create: achievement
		});
	}

	// await prisma.achievement.createMany({ data: achievements });
}
