import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import { computeTotalDuration } from "@self-learning/analysis";
import { hoursToMilliseconds, addMilliseconds } from "date-fns";
import { goalSelectClause } from "./goals/access-learning-goal";

export async function allPages(username: string) {
	let pages = await database.learningDiaryPage.findMany({
		select: {
			id: true,
			createdAt: true,
			hasRead: true,
			isDraft: true,
			course: { select: { title: true } },
			totalDurationLearnedMs: true
		},
		where: {
			studentName: username
		},
		orderBy: { createdAt: "asc" }
	});

	// Identify & update pages that are incomplete (no duration computed)
	const incompletePages = pages.filter(
		page =>
			!page.hasRead &&
			(page.totalDurationLearnedMs === null || page.totalDurationLearnedMs === 0)
	);
	if (incompletePages.length > 0) {
		for (const page of incompletePages) {
			const index = pages.findIndex(p => p.id === page.id);
			const nextPage = index >= 0 && index < pages.length - 1 ? pages[index + 1] : null;
			const endDate = nextPage ? nextPage.createdAt : new Date();
			await updateDiaryDetails(username, page.id, endDate);
		}
		pages = await database.learningDiaryPage.findMany({
			select: {
				id: true,
				createdAt: true,
				hasRead: true,
				isDraft: true,
				course: { select: { title: true } },
				totalDurationLearnedMs: true
			},
			where: {
				studentName: username
			},
			orderBy: { createdAt: "asc" }
		});
	}

	return pages;
}

export type PagesMeta = ResolvedValue<typeof allPages>;

async function updateDiaryDetails(username: string, id: string, endDate: Date) {
	return database.$transaction(async tx => {
		// Retrieve the learning diary page
		const diaryMeta = await tx.learningDiaryPage.findUnique({
			where: {
				studentName: username,
				id: id
			},
			select: {
				id: true,
				createdAt: true,
				course: { select: { courseId: true } },
				lessonsLearned: {
					select: {
						lesson: { select: { lessonId: true } }
					}
				}
			}
		});

		if (!diaryMeta) {
			return;
		}

		// Diary should span at max 6 hours
		// Maybe there are single events (visits) of a lesson for which no diary page was created,
		// i.e., visit was shorter than 1 minute. We do not want to consider these events.
		const MAX_DIARY_SPAN = hoursToMilliseconds(6);
		const start = diaryMeta.createdAt.getTime();
		const end = endDate.getTime();
		if (end - start > MAX_DIARY_SPAN) {
			endDate = addMilliseconds(diaryMeta.createdAt, MAX_DIARY_SPAN);
		}

		// Compute duration per lesson
		const lessonIds = diaryMeta.lessonsLearned.map(l => l.lesson.lessonId);
		if (lessonIds.length === 0) {
			return;
		}
		// No transaction needed -> do not block other transactions

		const events = await database.eventLog.findMany({
			where: {
				// courseId: diaryMeta.course.courseId,
				createdAt: {
					gte: diaryMeta.createdAt,
					lt: endDate
				},
				resourceId: { in: lessonIds },
				username: username
			},
			orderBy: { createdAt: "asc" }
		});

		const totalDuration = computeTotalDuration(events);

		return await tx.learningDiaryPage.update({
			where: {
				id: diaryMeta.id
			},
			data: {
				totalDurationLearnedMs: totalDuration
			}
		});
	});
}

export async function getDiaryPage(ltbId: string) {
	const ltbPage = await database.learningDiaryPage.findUnique({
		where: { id: ltbId },
		select: {
			id: true,
			course: {
				select: {
					courseId: true,
					slug: true,
					title: true
				}
			},
			notes: true,
			scope: true,
			distractionLevel: true,
			studentName: true,
			effortLevel: true,
			totalDurationLearnedMs: true,
			learningLocation: {
				select: {
					id: true,
					name: true,
					iconURL: true
				}
			},
			learningGoals: {
				select: goalSelectClause
			},
			createdAt: true,
			lessonsLearned: {
				select: {
					lesson: {
						select: {
							lessonId: true,
							title: true,
							slug: true
						}
					},
					createdAt: true
				},
				orderBy: {
					createdAt: "asc"
				}
			},
			techniqueRatings: {
				select: {
					score: true,
					technique: {
						select: {
							id: true,
							name: true,
							description: true,
							learningStrategieId: true
						}
					}
				}
			}
		}
	});
	return ltbPage;
}

export type LearningDiaryPageDetail = ResolvedValue<typeof getDiaryPage>;

export async function getUserLocations(username: string) {
	return database.learningLocation.findMany({
		where: { OR: [{ creatorName: username }, { defaultLocation: true }] },
		select: { id: true, name: true, iconURL: true, defaultLocation: true }
	});
}
export async function getAllStrategies() {
	return database.learningStrategy.findMany({
		select: {
			id: true,
			name: true,
			description: true,
			techniques: {
				where: { creatorName: null },
				select: {
					id: true,
					description: true,
					name: true
				}
			}
		}
	});
}
export type Strategy = ResolvedValue<typeof getAllStrategies>[number];
export type Location = ResolvedValue<typeof getUserLocations>[number];
