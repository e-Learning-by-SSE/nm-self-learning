import { BookOpenIcon, ChartBarIcon, LinkIcon } from "@heroicons/react/24/outline";
import { CheckIcon, CogIcon } from "@heroicons/react/24/solid";
import { withTranslations } from "@self-learning/api";
import { SmallGradeBadge } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { LearningDiaryEntryStatusBadge, StatusBadgeInfo } from "@self-learning/diary";
import { EnrollmentDetails, getEnrollmentDetails } from "@self-learning/enrollment";
import {
	CourseEnrollmentOverview,
	PlatformStats,
	PlatformStatsAchievementsSection,
	StreakIndicatorCircle,
	StreakSlotMachineDialog
} from "@self-learning/profile";
import { EventTypeMap, LoginStreak } from "@self-learning/types";
import {
	ImageCard,
	ImageCardBadge,
	ImageOrPlaceholder,
	ProgressBar
} from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";
import {
	formatDateAgo,
	formatDateStringShort,
	formatTimeIntervalToString
} from "@self-learning/util/common";
import { startOfToday } from "date-fns";
import { NextComponentType, NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type Student = Awaited<ReturnType<typeof getStudent>>;

type RecentLesson = {
	title: string;
	slug: string;
	courseSlug: string;
	courseImgUrl?: string | null;
	touchedAt: Date;
	completed: boolean;
	performanceScore?: number;
};

type Submission = {
	username: string;
	payload: {
		lessonAttemptId: string;
		completionState: "completed" | "failed";
		effectiveTimeLearned: number;
	};
};

async function getPlattformCompetitionStats(
	loggedInUsername: string
): Promise<Omit<PlatformStats, "own">> {
	const achievements = await database.achievementProgress.findMany({
		where: {
			redeemedAt: {
				gte: startOfToday()
			}
		},
		select: {
			achievement: {
				select: {
					title: true,
					id: true
				}
			}
		},
		orderBy: {
			redeemedAt: "desc"
		},
		take: 5
	});

	const learningSubmissions = await database.eventLog.findMany({
		where: {
			createdAt: {
				gte: startOfToday()
			},
			type: {
				equals: "LESSON_LEARNING_SUBMIT"
			}
		},
		select: {
			type: true,
			payload: true,
			createdAt: true,
			username: true
		},
		orderBy: {
			createdAt: "desc"
		},
		take: 1000 // increase to get more data for stats
	});
	const formattedLearningSubmissions = learningSubmissions.map(submission => ({
		...submission,
		payload: submission.payload as EventTypeMap["LESSON_LEARNING_SUBMIT"]
	}));
	const longestLearningSession = getUserWithHighestLearnedTime(formattedLearningSubmissions);

	const learningUnitsLearned = await database.completedLesson.groupBy({
		by: ["username"],
		where: {
			createdAt: {
				gte: startOfToday()
			}
		},
		_count: {
			lessonId: true
		}
	});

	const topUser = await database.user.findFirst({
		select: {
			name: true,
			student: {
				select: {
					completedLessons: {
						select: {
							performanceScore: true
						}
					}
				}
			},
			gamificationProfile: {
				select: {
					loginStreak: true,
					xp: true,
					achievementProgress: {
						select: {
							achievement: {
								select: {
									id: true
								}
							}
						},
						where: {
							redeemedAt: {
								not: null
							}
						}
					}
				}
			}
		},
		where: {
			gamificationProfile: {
				// This ensures only users with a gamificationProfile are considered // should not happen
				isNot: null
			}
		},
		orderBy: {
			gamificationProfile: {
				xp: "desc"
			}
		}
	});

	const topUserLoginStreak = topUser?.gamificationProfile?.loginStreak as LoginStreak;
	const topUsersCompletions = topUser?.student?.completedLessons ?? [];
	const topUserAverageScore = calculateAverage(
		topUsersCompletions.map(lesson => lesson.performanceScore)
	);

	return {
		topUser: {
			currentStreak: topUserLoginStreak?.count ?? 0,
			achievementCount: topUser?.gamificationProfile?.achievementProgress?.length ?? 0,
			averageRating: topUserAverageScore,
			isCurrentUser: topUser?.name === loggedInUsername
		},
		today: {
			newAchievements: achievements.map(a => ({
				id: a.achievement.id,
				title: a.achievement.title
			})),
			longestLearningSession: longestLearningSession.highest.totalLearned,
			mostLessonsCompleted: Math.max(
				...(learningUnitsLearned.map(u => u._count.lessonId).filter(Boolean) as number[]),
				0
			)
		}
	};
}

function getUserWithHighestLearnedTime(submissions: Submission[]) {
	// 1. Nur "completed" Events
	const completed = submissions.filter(s => s.payload.completionState === "completed");
	// 2. Gruppieren: user -> lessonAttemptId -> [submissions]
	const userLessonMap = new Map<string, Map<string, Submission>>();

	for (const sub of completed) {
		if (!userLessonMap.has(sub.username)) {
			userLessonMap.set(sub.username, new Map());
		}
		const lessonMap = userLessonMap.get(sub.username)!;
		const existing = lessonMap.get(sub.payload.lessonAttemptId);

		// 3. Nur den mit dem höchsten effectiveTimeLearned behalten
		if (!existing || sub.payload.effectiveTimeLearned > existing.payload.effectiveTimeLearned) {
			lessonMap.set(sub.payload.lessonAttemptId, sub);
		}
	}

	// 4. Pro User: Summe der höchsten effectiveTimeLearned pro lessonAttemptId
	const userTotals: { username: string; totalLearned: number }[] = [];
	for (const [username, lessonMap] of userLessonMap.entries()) {
		const total = Array.from(lessonMap.values()).reduce(
			(sum, sub) => sum + sub.payload.effectiveTimeLearned,
			0
		);
		userTotals.push({ username, totalLearned: total });
	}

	// 5. User mit dem höchsten Wert finden
	const highest = userTotals.reduce(
		(max, curr) => (curr.totalLearned > max.totalLearned ? curr : max),
		{ username: "", totalLearned: 0 }
	);
	return { userTotals, highest };
}

async function getStudent(username: string) {
	const student = await database.student.findUniqueOrThrow({
		where: { username },
		select: {
			_count: {
				select: {
					completedLessons: true,
					enrollments: true,
					learningDiaryEntrys: true
				}
			},
			user: {
				select: {
					displayName: true,
					name: true,
					image: true,
					email: true,
					gamificationProfile: {
						select: {
							loginStreak: true,
							energy: true,
							longestStreak: true
						}
					},
					featureFlags: true
				}
			},
			completedLessons: {
				orderBy: { performanceScore: "desc" },
				select: {
					lessonId: true,
					createdAt: true,
					performanceScore: true,
					lesson: {
						select: {
							slug: true,
							title: true
						}
					},
					course: {
						select: {
							slug: true,
							title: true,
							imgUrl: true
						}
					}
				}
			},
			enrollments: {
				orderBy: { createdAt: "desc" },
				select: {
					progress: true,
					status: true,
					lastProgressUpdate: true,
					course: {
						select: {
							title: true,
							slug: true,
							subtitle: true,
							imgUrl: true,
							authors: {
								select: {
									displayName: true
								}
							}
						}
					}
				}
			},
			learningDiaryEntrys: {
				orderBy: { createdAt: "desc" },
				take: 8,
				select: {
					createdAt: true,
					id: true,
					totalDurationLearnedMs: true,
					hasRead: true,
					isDraft: true,
					course: {
						select: {
							courseId: true,
							title: true,
							imgUrl: true
						}
					},
					lessonsLearned: true,
					courseSlug: true
				}
			}
		}
	});

	// add default values and type schema for meta
	return {
		...student,
		user: {
			...student.user,
			gamificationProfile: {
				...student.user.gamificationProfile,
				loginStreak: student.user.gamificationProfile?.loginStreak as unknown as LoginStreak
			}
		}
	};
}

// Method 1: Get lessons from diary entries
function getRecentLessonsFromDiary({
	student,
	lessonLimit
}: {
	student: Student;
	lessonLimit: number;
}): RecentLesson[] {
	// Get recent diary lessons
	const recentDiaryLessons = student.learningDiaryEntrys
		.flatMap(entry =>
			entry.lessonsLearned.map(lesson => ({
				lessonId: lesson.lessonId,
				courseSlug: entry.courseSlug,
				courseImgUrl: entry.course?.imgUrl,
				touchedAt: entry.createdAt
			}))
		)
		.sort((a, b) => new Date(b.touchedAt).getTime() - new Date(a.touchedAt).getTime())
		.slice(0, lessonLimit);

	// Enrich with completion data
	const completedLessonsMap = new Map(
		student.completedLessons.map(lesson => [lesson.lessonId, lesson])
	);

	return recentDiaryLessons.map(diaryLesson => {
		const completedLesson = completedLessonsMap.get(diaryLesson.lessonId);

		return {
			title: completedLesson?.lesson.title || "HALLO",
			slug: completedLesson?.lesson.slug || "",
			courseSlug: diaryLesson.courseSlug,
			courseImgUrl: diaryLesson.courseImgUrl,
			touchedAt: diaryLesson.touchedAt,
			completed: !!completedLesson,
			performanceScore: completedLesson?.performanceScore
		};
	});
}

// Method 2: Get lessons from completions only
function getRecentLessonsFromCompletions({
	student,
	lessonLimit
}: {
	student: Student;
	lessonLimit: number;
}): RecentLesson[] {
	return student.completedLessons
		.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
		.slice(0, lessonLimit)
		.map(completedLesson => ({
			title: completedLesson.lesson.title,
			slug: completedLesson.lesson.slug,
			courseSlug: completedLesson.course?.slug || "",
			courseImgUrl: completedLesson.course?.imgUrl,
			touchedAt: completedLesson.createdAt,
			completed: true,
			performanceScore: completedLesson.performanceScore
		}));
}

async function loadMostRecentLessons({
	student,
	lessonLimit
}: {
	student: Student;
	lessonLimit: number;
}): Promise<RecentLesson[]> {
	if (student.user.featureFlags?.learningDiary ?? false) {
		return getRecentLessonsFromDiary({ student, lessonLimit });
	} else {
		return getRecentLessonsFromCompletions({ student, lessonLimit });
	}
}

type Props = {
	student: Student;
	recentLessons: RecentLesson[];
	enrollments: EnrollmentDetails[];
	competitionStats: PlatformStats;
};

function ProfilLayout(
	Component: NextComponentType<NextPageContext, unknown, Props>,
	pageProps: Props
) {
	return (
		<CenteredSection className="bg-gray-50">
			<Component {...pageProps} />
		</CenteredSection>
		// <DashboardSidebarLayout>
		// 	<Component {...pageProps} />
		// </DashboardSidebarLayout>
	);
}
ProfilPage.getLayout = ProfilLayout;

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<Props>(async (_, user) => {
		// TODO remove this check when gamification is fully enabled
		const isParticipant = user.featureFlags.experimental;
		if (!isParticipant) {
			return {
				redirect: {
					destination: "/dashboard",
					permanent: false
				}
			};
		}

		const student = await getStudent(user.name);
		const recentLessons = await loadMostRecentLessons({ student, lessonLimit: 8 });
		const competitionStatsPartial = await getPlattformCompetitionStats(user.name);
		const competitionStats = {
			...competitionStatsPartial,
			own: {
				currentStreak: student.user.gamificationProfile.loginStreak.count,
				averageRating: calculateAverage(
					student.completedLessons.map(lesson => lesson.performanceScore)
				)
			}
		};

		const enrollments = await getEnrollmentDetails(user.name);

		return {
			props: {
				student,
				recentLessons,
				enrollments,
				competitionStats
				// refactor this to load the data in the student function to have a single query
			}
		};
	})
);

export default function ProfilPage({
	student,
	recentLessons,
	enrollments,
	competitionStats
}: Props) {
	const { user, learningDiaryEntrys } = student;

	const router = useRouter();

	const openSettings = () => {
		router.push("/user-settings");
	};

	const ltbEnabled = user.featureFlags?.learningDiary ?? false;
	const gamificationProfile = user.gamificationProfile;
	const [streakInfoOpen, setStreakInfoOpen] = useState(false);

	return (
		<div className="space-y-6">
			{/* Top row - Profile Card links, Stats/Achievements rechts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left column - Profile Card und Meine Funktionen */}
				<div className="lg:col-span-1 flex flex-col space-y-6 h-full">
					{/* Profile Card */}
					<div className="flex-shrink-0">
						<ProfileCard
							student={student}
							openSettings={openSettings}
							setStreakInfoOpen={setStreakInfoOpen}
						/>
					</div>

					{/* Meine Funktionen - nimmt den verbleibenden Platz */}
					<div className="flex-1">
						<MyFunctionsCard />
					</div>
				</div>

				{/* Platform Stats & Achievements - nimmt die rechten 2 Spalten ein */}
				<div className="lg:col-span-2">
					<PlatformStatsAchievementsSection
						stats={competitionStats}
						completedLessons={student.completedLessons}
						className="h-full"
					/>
				</div>
			</div>

			{/* Rest of your existing content remains unchanged */}
			{/* Second row - Letzter Kurs und Zuletzt bearbeitete Lerneinheiten */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Last Course */}
				<div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 h-full flex flex-col">
					<h2 className="mb-4 text-lg font-semibold text-gray-900">Letzter Kurs</h2>
					<LastCourseProgress
						lastEnrollment={
							student.enrollments.sort(
								(a, b) =>
									new Date(b.lastProgressUpdate).getTime() -
									new Date(a.lastProgressUpdate).getTime()
							)[0]
						}
					/>
				</div>

				{/* Recent Lessons / Learning Diary */}
				<div className="rounded-xl  bg-white shadow-sm border border-gray-100 p-6 h-full flex flex-col">
					<h2 className="mb-4 text-lg font-semibold text-gray-900">
						{ltbEnabled ? "Lerntagebuch Einträge" : "Zuletzt bearbeitete Lerneinheiten"}
					</h2>
					{ltbEnabled ? (
						<>
							<StatusBadgeInfo
								header="Letzter Lerntagebucheintrag"
								className="mb-4"
							/>
							<LastLearningDiaryEntry pages={learningDiaryEntrys} />
						</>
					) : (
						<LessonList lessons={recentLessons} />
					)}
				</div>
			</div>

			{/* Third row - Course Enrollment Overview (full width) */}
			<div className="w-full">
				<div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
					<h2 className="mb-4 text-lg font-semibold text-gray-900">Mein Lernplan</h2>
					<CourseEnrollmentOverview enrollments={enrollments} />
				</div>
			</div>

			{/* Dialogs */}
			<StreakSlotMachineDialog
				energy={gamificationProfile.energy ?? 0}
				loginStreak={gamificationProfile.loginStreak}
				open={streakInfoOpen}
				trigger="dashboard"
				onClose={() => setStreakInfoOpen(false)}
			/>
		</div>
	);
}

function MyFunctionsCard() {
	const session = useRequiredSession();
	const functions = [
		{
			title: "Lernplan",
			description: "Erstelle und bearbeite deine Kurse",
			href: "/dashboard/courseOverview",
			icon: BookOpenIcon,
			condition: true
		},

		{
			title: "Statistiken",
			description: "Verfolge deinen Lernfortschritt",
			href: "/statistics",
			icon: ChartBarIcon,
			condition: false
		},
		{
			title: "Lerntagebuch",
			description: "Dokumentiere deine Lernfortschritte",
			href: "/learning-diary",
			icon: BookOpenIcon,
			condition: session.data?.user.featureFlags?.learningDiary
		},
		{
			title: "Lernziele",
			description: "Setze dir individuelle Lernziele",
			href: "/learning-diary/goals",
			icon: ChartBarIcon,
			condition: session.data?.user.featureFlags?.learningDiary
		},
		{
			title: "Einstellungen",
			description: "Personalisiere dein Profil",
			href: "/user-settings",
			icon: CogIcon,
			condition: true
		}
	];

	return (
		<div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 h-full">
			<h2 className="mb-4 text-lg font-semibold text-gray-900">Meine Funktionen</h2>
			<div className="space-y-1">
				{functions
					.filter(f => !!f.condition)
					.map((func, index) => (
						<div key={index}>
							<a
								href={func.href}
								className="group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
							>
								<div className="flex-shrink-0 mr-3">
									<func.icon className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
											{func.title}
										</p>
										<LinkIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 ml-2 flex-shrink-0 transition-colors" />
									</div>
									<p className="text-xs text-gray-500 mt-1">{func.description}</p>
								</div>
							</a>
							{/* Trenner - außer beim letzten Element */}
							{index < functions.length - 1 && (
								<div className="border-b border-gray-100 mx-3"></div>
							)}
						</div>
					))}
			</div>
		</div>
	);
}

function calculateAverage(scores: number[]) {
	if (scores.length === 0) return 0;
	const sum = scores.reduce((acc, val) => acc + val, 0);
	return sum / scores.length;
}

function ProfileCard({
	student,
	openSettings,
	setStreakInfoOpen
}: {
	student: Student;
	openSettings: () => void;
	setStreakInfoOpen: (open: boolean) => void;
}) {
	const { user, _count: completionCount, enrollments, completedLessons } = student;
	const gamificationProfile = user.gamificationProfile;
	const longestStreak =
		gamificationProfile.longestStreak || gamificationProfile.loginStreak.count;

	// Calculate additional metrics
	const totalLearningTime = 1232;
	// const averageScore = calculateAverage(completedLessons.map(lesson => lesson.performanceScore));

	const completedCourses = enrollments.filter(e => e.status === "COMPLETED").length;

	return (
		<section className="relative rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-100 p-6 space-y-6">
			<div className="absolute -top-3 -right-3 h-16 w-16 z-10">
				<StreakIndicatorCircle
					count={gamificationProfile.loginStreak.count}
					status={gamificationProfile.loginStreak.status}
					onClick={() => setStreakInfoOpen(true)}
				/>
			</div>
			<div className="flex justify-start">
				<button
					onClick={openSettings}
					className="rounded-full p-2 hover:bg-gray-100 transition-colors"
					title="Einstellungen"
				>
					<CogIcon className="h-5 w-5 text-gray-500" />
				</button>
			</div>
			{/* User Info */}
			<div className="flex flex-col items-center text-center space-y-3">
				<div className="relative">
					<ImageOrPlaceholder
						src={user.image ?? undefined}
						className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
					/>
					<div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
				</div>
				<div>
					<h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
					<p className="text-sm text-gray-600 mt-1">{user.email}</p>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="bg-white rounded-lg p-5 space-y-4 border border-gray-100">
				{/* Completion Stats */}
				<div>
					<h3 className="text-sm font-semibold text-gray-700 mb-3">Abgeschlossen</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-emerald-600">
								{completedCourses}
							</div>
							<div className="text-xs text-gray-500 uppercase tracking-wide">
								Kurse
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{completionCount.completedLessons}
							</div>
							<div className="text-xs text-gray-500 uppercase tracking-wide">
								Lerneinheiten
							</div>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-100 pt-4 space-y-3">
					{/* Learning Time */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-600">Insgesamt Zeit gelernt</span>
						<span className="text-sm font-semibold text-emerald-600">
							{formatTimeIntervalToString(totalLearningTime)}
						</span>
					</div>

					{/* Longest Streak */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-600">Längster Streak</span>
						<span className="text-sm font-semibold  text-emerald-600">
							{longestStreak} Tage
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function LastLearningDiaryEntry({ pages }: { pages: Student["learningDiaryEntrys"] }) {
	return (
		<>
			{pages.length == 0 ? (
				<span className="text-sm text-light">
					Du hast noch keinen Lerntagebucheintrag erstellt.
				</span>
			) : (
				<>
					<ul className="flex max-h-96 flex-col gap-2 overflow-auto overflow-x-hidden">
						{pages.map((page, _) => (
							<Link
								className="text-sm font-medium"
								href={`/learning-diary/page/${page.id}/`}
								key={page.id}
							>
								<li
									className="hover: flex items-center rounded-lg border border-light-border
                            p-3 transition-transform hover:bg-slate-100"
								>
									<div className="flex w-full flex-col lg:flex-row items-center justify-between gap-2 px-4">
										<div className="flex items-center gap-2">
											<LearningDiaryEntryStatusBadge
												isDraft={page.isDraft}
												hasRead={page.hasRead}
											/>
											<div className="flex flex-col">
												<span className="truncate max-w-full inline-block align-middle">
													{page.course.title}
												</span>
												<span className="text-xs text-gray-400 truncate block max-w-full">
													Verbrachte Zeit:{" "}
													{formatTimeIntervalToString(
														page.totalDurationLearnedMs ?? 0
													)}
												</span>
											</div>
										</div>
										<span className="hidden text-xs text-light md:block">
											{formatDateStringShort(page.createdAt)}
										</span>
									</div>
								</li>
							</Link>
						))}
					</ul>
				</>
			)}
		</>
	);
}

function LessonList({ lessons }: { lessons: RecentLesson[] }) {
	return (
		<>
			{lessons.length === 0 ? (
				<span className="text-sm text-light">Du hast keine Lerneinheiten bearbeitet.</span>
			) : (
				<ul className="flex max-h-96 flex-col gap-3 overflow-auto overflow-x-visible">
					{lessons.map((lesson, index) => (
						<Link
							className="text-sm font-medium"
							href={`/courses/${lesson.courseSlug}/${lesson.slug}`}
							key={"course-" + index}
						>
							<li className="flex items-center rounded-lg border border-light-border overflow-hidden transition-all hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md hover:border-gray-200">
								{/* Course Image */}
								<ImageOrPlaceholder
									src={lesson.courseImgUrl ?? undefined}
									className="h-16 w-16 shrink-0 object-cover rounded-l-lg"
								/>

								{/* Content Area */}
								<div className="flex-1 flex items-center justify-between p-4 min-w-0">
									{/* Left side: Title and Date */}
									<div className="flex flex-col min-w-0 flex-1">
										<span className="font-medium text-gray-900 truncate">
											{lesson.title}
										</span>
										<span className="text-xs text-gray-500 mt-1">
											{formatDateAgo(lesson.touchedAt)}
										</span>
									</div>

									{/* Right side: Completion Status */}
									<div className="flex items-center gap-2 ml-4 flex-shrink-0">
										{lesson.completed ? (
											<>
												<CheckIcon className="h-5 w-5 text-green-500" />
												{
													<SmallGradeBadge
														rating={lesson.performanceScore ?? 0}
													/>
												}
											</>
										) : (
											<div className="h-5 w-5 rounded-full border-2 border-gray-300" />
										)}
									</div>
								</div>
							</li>
						</Link>
					))}
				</ul>
			)}
		</>
	);
}

function LastCourseProgress({ lastEnrollment }: { lastEnrollment?: Student["enrollments"][0] }) {
	if (!lastEnrollment) {
		return (
			<div>
				<span className="text-sm text-light">
					Du bist momentan in keinem Kurs eingeschrieben.
				</span>
				<Link
					href="/subjects"
					className="text-sm ml-1 text-light underline hover:text-secondary"
				>
					Leg los
				</Link>
			</div>
		);
	}
	return (
		<div>
			{lastEnrollment && lastEnrollment.course && (
				<Link
					key={lastEnrollment.course.slug}
					href={`/courses/${lastEnrollment.course.slug}`}
				>
					<ImageCard
						slug={lastEnrollment.course.slug}
						title={lastEnrollment.course.title}
						subtitle={lastEnrollment.course.subtitle}
						imgUrl={lastEnrollment.course.imgUrl}
						badge={
							lastEnrollment.status === "COMPLETED" ? (
								<ImageCardBadge
									className="bg-emerald-500 text-white"
									text="Abgeschlossen"
								/>
							) : (
								<></>
							)
						}
						footer={
							<ProgressBar
								progressPercentage={lastEnrollment.progress}
								text={`${lastEnrollment.progress}%`}
							/>
						}
					/>
				</Link>
			)}
		</div>
	);
}
