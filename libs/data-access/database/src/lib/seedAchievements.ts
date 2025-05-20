import { PrismaClient } from "@prisma/client";
import { AchievementFormInput } from "@self-learning/types";

export async function seedAchievements(prisma: PrismaClient): Promise<void> {
	const achievements: AchievementFormInput[] = [
		/* ────────────────────────────── 🧠 Perfect Lessons ────────────────────────────── */
		/* inRow (consecutive “perfect” grades) */
		{
			code: "GRADE_LESSON_SERIAL_PERFECT_1",
			title: "Perfekte Lektion I",
			description: "1 Lerneinheit hintereinander mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 1,
			meta: { group: "grade_lessons_serial", grade: "PERFECT", level: 1 }
		},
		{
			code: "GRADE_LESSON_SERIAL_PERFECT_5",
			title: "Perfekte Lektion II",
			description: "5 aufeinanderfolgende Lerneinheiten mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 100,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 5,
			meta: { group: "grade_lessons_serial", grade: "PERFECT", level: 2 }
		},
		{
			code: "GRADE_LESSON_SERIAL_PERFECT_10",
			title: "Perfekte Lektion III",
			description: "10 aufeinanderfolgende Lerneinheiten mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 150,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 10,
			meta: { group: "grade_lessons_serial", grade: "PERFECT", level: 3 }
		},

		/* inTotal (overall “perfect” grades) */
		{
			code: "GRADE_LESSONS_PERFECT_TOTAL_1",
			title: "Meister*in der Perfektion I",
			description: "1 Lerneinheit mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 1,
			meta: { group: "grade_lessons_total", grade: "PERFECT", level: 1 }
		},
		{
			code: "GRADE_LESSONS_PERFECT_TOTAL_5",
			title: "Meister*in der Perfektion II",
			description: "5 Lerneinheiten mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 100,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 5,
			meta: { group: "grade_lessons_total", grade: "PERFECT", level: 2 }
		},
		{
			code: "GRADE_LESSONS_PERFECT_TOTAL_10",
			title: "Meister*in der Perfektion III",
			description: "10 Lerneinheiten mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 150,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 10,
			meta: { group: "grade_lessons_total", grade: "PERFECT", level: 3 }
		},
		{
			code: "GRADE_LESSONS_PERFECT_TOTAL_20",
			title: "Meister*in der Perfektion IV",
			description: "20 Lerneinheiten mit PERFEKT-Bewertung abgeschlossen",
			xpReward: 200,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 20,
			meta: { group: "grade_lessons_total", grade: "PERFECT", level: 4 }
		},

		/* ─────────────────────── 🧠 Very-Good Lessons (Grade “A”) ─────────────────────── */
		/* inRow */
		{
			code: "GRADE_LESSON_SERIAL_VERY_GOOD_1",
			title: "Sehr gute Lektion I",
			description: "1 Lerneinheit hintereinander mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 25,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 1,
			meta: { group: "grade_lessons_serial", grade: "VERY_GOOD", level: 1 }
		},
		{
			code: "GRADE_LESSON_SERIAL_VERY_GOOD_5",
			title: "Sehr gute Lektion II",
			description: "5 aufeinanderfolgende Lerneinheiten mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 5,
			meta: { group: "grade_lessons_serial", grade: "VERY_GOOD", level: 2 }
		},
		{
			code: "GRADE_LESSON_SERIAL_VERY_GOOD_10",
			title: "Sehr gute Lektion III",
			description:
				"10 aufeinanderfolgende Lerneinheiten mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 75,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 10,
			meta: { group: "grade_lessons_serial", grade: "VERY_GOOD", level: 3 }
		},

		/* inTotal */
		{
			code: "GRADE_LESSONS_VERY_GOOD_TOTAL_1",
			title: "A-Meister*in I",
			description: "1 Lerneinheit mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 25,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 1,
			meta: { group: "grade_lessons_total", grade: "VERY_GOOD", level: 1 }
		},
		{
			code: "GRADE_LESSONS_VERY_GOOD_TOTAL_5",
			title: "A-Meister*in II",
			description: "5 Lerneinheiten mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 50,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 5,
			meta: { group: "grade_lessons_total", grade: "VERY_GOOD", level: 2 }
		},
		{
			code: "GRADE_LESSONS_VERY_GOOD_TOTAL_10",
			title: "A-Meister*in III",
			description: "10 Lerneinheiten mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 75,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 10,
			meta: { group: "grade_lessons_total", grade: "VERY_GOOD", level: 3 }
		},
		{
			code: "GRADE_LESSONS_VERY_GOOD_TOTAL_20",
			title: "A-Meister*in IV",
			description: "20 Lerneinheiten mit SEHR-GUT-Bewertung abgeschlossen",
			xpReward: 100,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 20,
			meta: { group: "grade_lessons_total", grade: "VERY_GOOD", level: 4 }
		},

		/* ───────────────────────────── 🧠 Good Lessons (Grade “B”) ───────────────────────────── */
		/* inRow */
		{
			code: "GRADE_LESSON_SERIAL_GOOD_1",
			title: "Gute Lektion I",
			description: "1 Lerneinheit hintereinander mit GUT-Bewertung abgeschlossen",
			xpReward: 10,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 1,
			meta: { group: "grade_lessons_serial", grade: "GOOD", level: 1 }
		},
		{
			code: "GRADE_LESSON_SERIAL_GOOD_5",
			title: "Gute Lektion II",
			description: "5 aufeinanderfolgende Lerneinheiten mit GUT-Bewertung abgeschlossen",
			xpReward: 20,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 5,
			meta: { group: "grade_lessons_serial", grade: "GOOD", level: 2 }
		},
		{
			code: "GRADE_LESSON_SERIAL_GOOD_10",
			title: "Gute Lektion III",
			description: "10 aufeinanderfolgende Lerneinheiten mit GUT-Bewertung abgeschlossen",
			xpReward: 30,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 10,
			meta: { group: "grade_lessons_serial", grade: "GOOD", level: 3 }
		},

		/* inTotal */
		{
			code: "GRADE_LESSONS_GOOD_TOTAL_1",
			title: "B-Meister*in I",
			description: "1 Lerneinheit mit GUT-Bewertung abgeschlossen",
			xpReward: 10,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 1,
			meta: { group: "grade_lessons_total", grade: "GOOD", level: 1 }
		},
		{
			code: "GRADE_LESSONS_GOOD_TOTAL_5",
			title: "B-Meister*in II",
			description: "5 Lerneinheiten mit GUT-Bewertung abgeschlossen",
			xpReward: 20,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 5,
			meta: { group: "grade_lessons_total", grade: "GOOD", level: 2 }
		},
		{
			code: "GRADE_LESSONS_GOOD_TOTAL_10",
			title: "B-Meister*in III",
			description: "10 Lerneinheiten mit GUT-Bewertung abgeschlossen",
			xpReward: 30,
			category: "Lernen",
			trigger: "lesson_completed",
			requiredValue: 10,
			meta: { group: "grade_lessons_total", grade: "GOOD", level: 3 }
		},

		/* ─────────────────────────── 🔁 Learning Streaks ─────────────────────────── */
		{
			code: "STREAK_5",
			title: "Lernserie I",
			description: "5 Tage in Folge gelernt",
			xpReward: 75,
			category: "Kontinuität",
			trigger: "daily_login",
			requiredValue: 5,
			meta: { group: "streak", level: 1 }
		},
		{
			code: "STREAK_10",
			title: "Lernserie II",
			description: "10 Tage in Folge gelernt",
			xpReward: 150,
			category: "Kontinuität",
			trigger: "daily_login",
			requiredValue: 10,
			meta: { group: "streak", level: 2 }
		},
		{
			code: "STREAK_20",
			title: "Lernserie III",
			description: "20 Tage in Folge gelernt",
			xpReward: 300,
			category: "Kontinuität",
			trigger: "daily_login",
			requiredValue: 20,
			meta: { group: "streak", level: 3 }
		},
		{
			code: "STREAK_30",
			title: "Lernserie IV",
			description: "30 Tage in Folge gelernt",
			xpReward: 450,
			category: "Kontinuität",
			trigger: "daily_login",
			requiredValue: 30,
			meta: { group: "streak", level: 4 }
		},

		/* ─────────────────────────────── ⏳ Focus ─────────────────────────────── */
		{
			code: "FOCUS_30",
			title: "Fokussiert I",
			description: "30 Minuten am Stück gelernt",
			xpReward: 30,
			category: "Fokus",
			trigger: "session_time",
			requiredValue: 30,
			meta: { group: "focus", level: 1 }
		},
		{
			code: "FOCUS_60",
			title: "Fokussiert II",
			description: "60 Minuten am Stück gelernt",
			xpReward: 60,
			category: "Fokus",
			trigger: "session_time",
			requiredValue: 60,
			meta: { group: "focus", level: 2 }
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
