import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";

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
		const totalDuration = lessonIds
			.map(lessonId => {
				const lessonEvents = events.filter(e => e.resourceId === lessonId);
				const duration =
					lessonEvents.length > 0
						? lessonEvents[lessonEvents.length - 1].createdAt.getTime() -
							lessonEvents[0].createdAt.getTime()
						: 0;
				return duration;
			})
			.reduce((acc, duration) => acc + duration, 0);

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
	await database.learningDiaryPage.update({
		where: { id: ltbId },
		data: {
			hasRead: true
		}
	});
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
				select: {
					id: true,
					description: true,
					status: true,
					lastProgressUpdate: true,
					learningSubGoals: {
						select: {
							id: true,
							description: true,
							status: true,
							priority: true
						}
					}
				}
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
							id: true
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
			techniques: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});
}

export type Strategy = ResolvedValue<typeof getAllStrategies>[number];
export type Location = ResolvedValue<typeof getUserLocations>[number];
