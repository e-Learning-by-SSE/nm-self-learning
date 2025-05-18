import { AchievementTrigger, PrismaClient } from "@prisma/client";
import { AchievementFormInput } from "@self-learning/types";

export async function seedAchievements(prisma: PrismaClient): Promise<void> {
	const achievements: AchievementFormInput[] = [
		// 🧠 Perfect Lessons
		// inRow (serial)
		{
			code: "PERFECT_LESSON_SERIAL_VERY_GOOD_1",
			title: "Perfekte Lektion I",
			description: "1 Lerneinheiten mit mindestens einer A oder S Bewertung abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			requiredValue: 1,
			meta: {
				group: "perfect_lessons_serial",
				level: 1
			}
		},
		{
			code: "GRADE_LESSON_SERIAL_VERY_GOOD_5",
			title: "Perfekte Lektion II",
			description: "5 Lerneinheiten mit mindestens einer A- oder S-Bewertung abgeschlossen",
			xpReward: 100,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			requiredValue: 5,
			meta: {
				group: "perfect_lessons_serial",
				level: 2
			}
		},
		// inTotal
		{
			code: "GRADE_LESSONS_PERFECT_TOTAL_1",
			title: "S-Meister I",
			description: "1 Lerneinheit mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			requiredValue: 1,
			meta: {
				group: "grade_lessons_total",
				level: 1,
				grade: "PERFECT"
			}
		},
		{
			code: "GRADE_LESSONS_PERFECT_TOTAL_5",
			title: "S-Meister II",
			description: "5 Lerneinheiten mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 100,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			requiredValue: 5,
			meta: {
				group: "grade_lessons_total",
				level: 2,
				grade: "PERFECT"
			}
		},
		{
			code: "GRADE_LESSONS_VERY_GOOD_TOTAL_1",
			title: "A-Meister I",
			description: "1 Lerneinheit mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 25,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			requiredValue: 1,
			meta: {
				group: "grade_lessons_total",
				level: 1,
				grade: "VERY_GOOD"
			}
		},
		{
			code: "GRADE_LESSONS_VERY_GOOD_TOTAL_5",
			title: "A-Meister II",
			description: "5 Lerneinheiten mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: AchievementTrigger.lesson_completed,
			requiredValue: 5,
			meta: {
				group: "grade_lessons_total",
				level: 2,
				grade: "VERY_GOOD"
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
			requiredValue: 5,
			meta: {
				group: "streak",
				level: 1
			}
		},
		{
			code: "STREAK_10",
			title: "Lernserie II",
			description: "10 Tage in Folge gelernt",
			xpReward: 150,
			category: "Kontinuität",
			trigger: AchievementTrigger.daily_login,
			requiredValue: 10,
			meta: {
				group: "streak",
				level: 2
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
			requiredValue: 30,
			meta: {
				group: "focus",
				level: 1
			}
		},
		{
			code: "FOCUS_60",
			title: "Fokussiert II",
			description: "1 Stunde am Stück gelernt",
			xpReward: 60,
			category: "Fokus",
			trigger: AchievementTrigger.session_time,
			requiredValue: 60,
			meta: {
				group: "focus",
				level: 2
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
}
