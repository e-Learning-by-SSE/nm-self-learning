import { CheckIcon, CogIcon } from "@heroicons/react/24/solid";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { EnableLearningDiaryDialog, LearningDiaryEntryStatusBadge } from "@self-learning/diary";
import {
	DashboardAchievementsSection,
	StreakIndicatorCircle,
	StreakSlotMachineDialog
} from "@self-learning/profile";
import { Flames, LoginStreak } from "@self-learning/types";
import {
	Divider,
	ImageCard,
	ImageCardBadge,
	ImageOrPlaceholder,
	ProgressBar
} from "@self-learning/ui/common";
import { DashboardSidebarLayout } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";
import {
	formatDateAgo,
	formatDateStringShort,
	formatTimeIntervalToString
} from "@self-learning/util/common";
import { NextComponentType, NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";

type Student = Awaited<ReturnType<typeof getStudent>>;

type LearningDiaryEntryLessonWithDetails = {
	entryId: string;
	lessonId: string;
	title: string;
	slug: string;
	courseImgUrl?: string;
	courseSlug: string;
	touchedAt: Date;
	completed: boolean;
};

type Props = {
	student: Student;
	recentLessons: LearningDiaryEntryLessonWithDetails[];
};

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
							flames: true
						}
					},
					featureFlags: true
				}
			},
			completedLessons: {
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					createdAt: true,
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
							slug: true,
							title: true,
							subtitle: true,
							imgUrl: true
						}
					}
				}
			},
			learningDiaryEntrys: {
				orderBy: { createdAt: "desc" },
				take: 5,
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
				loginStreak: student.user.gamificationProfile
					?.loginStreak as unknown as LoginStreak,
				flames: student.user.gamificationProfile?.flames as unknown as Flames
			}
		}
	};
}

export type DiaryLessonSchema = {
	id: string;
	courseSlug: string;
	courseImgUrl: string | null;
	entryId: string;
	lessonId: string;
	createdAt: Date;
};

async function loadMostRecentLessons({
	student,
	lessonLimit
}: {
	student: Student;
	lessonLimit: number;
}) {
	const lessonsFromDiary: DiaryLessonSchema[] = student.learningDiaryEntrys.flatMap(entry =>
		entry.lessonsLearned.map(lesson => ({
			...lesson,
			courseSlug: entry.courseSlug,
			courseImgUrl: entry.course?.imgUrl,
			entryId: lesson.id,
			createdAt: entry.createdAt
		}))
	);

	const sortedLessons = lessonsFromDiary.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	const newestLessons = sortedLessons.slice(0, lessonLimit);
	const lessonIds = newestLessons.map(lesson => lesson.lessonId);

	const lessonsArray = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			title: true,
			slug: true,
			completions: true
		}
	});

	const lessonDetailsMap = new Map(lessonsArray.map(detail => [detail.lessonId, detail]));
	const lessonsWithDetails = newestLessons.map(lesson => {
		const lessonDetails = lessonDetailsMap.get(lesson.lessonId);

		return {
			lessonId: lesson.lessonId,
			title: lessonDetails?.title || "",
			slug: lessonDetails?.slug || "",
			courseImgUrl: lesson.courseImgUrl || "",
			courseSlug: lesson.courseSlug || "",
			touchedAt: lesson.createdAt || null,
			entryId: lesson.entryId || "",
			compeleted: false
		};
	});

	const completedLessonsTitleSet = new Set(
		student.completedLessons.map(lesson => lesson.lesson.title)
	);

	return lessonsWithDetails.map(lesson => ({
		...lesson,
		completed: completedLessonsTitleSet.has(lesson.title)
	}));
}

type LtbState = {
	enabled: boolean;
	dialogOpen: boolean;
};

type LtbFeatureAction =
	| { type: "TOGGLE_LTB"; enabled: boolean }
	| { type: "OPEN_DIALOG" }
	| { type: "CLOSE_DIALOG" };

function ltbReducer(state: LtbState, action: LtbFeatureAction): LtbState {
	switch (action.type) {
		case "TOGGLE_LTB":
			return { ...state, enabled: action.enabled };
		case "OPEN_DIALOG":
			return { ...state, dialogOpen: true };
		case "CLOSE_DIALOG":
			return { ...state, dialogOpen: false };
		default:
			return state;
	}
}

function DashboardLayout(
	Component: NextComponentType<NextPageContext, unknown, Props>,
	pageProps: Props
) {
	return (
		<DashboardSidebarLayout>
			<Component {...pageProps} />
		</DashboardSidebarLayout>
	);
}
DashboardPage.getLayout = DashboardLayout;

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<Props>(async (_, user) => {
		// TODO remove this check when gamification is fully enabled
		// const { isParticipating } = await getExperimentStatus(user.name);
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
		const recentLessons = await loadMostRecentLessons({ student, lessonLimit: 6 });

		return {
			props: {
				student,
				recentLessons
			}
		};
	})
);

export default function DashboardPage(props: Props) {
	const router = useRouter();
	const { mutateAsync: updateSettings } = trpc.me.updateSettings.useMutation();
	const [ltb, dispatch] = useReducer(ltbReducer, {
		dialogOpen: false,
		enabled: props.student.user.featureFlags?.learningDiary ?? false
	});

	const handleDialogSubmit: Parameters<
		typeof EnableLearningDiaryDialog
	>[0]["onSubmit"] = async update => {
		await updateSettings({ user: { featureFlags: { ...update } } });
		dispatch({ type: "TOGGLE_LTB", enabled: true });
		dispatch({ type: "CLOSE_DIALOG" });
	};

	const handleClickLtbToggle = async () => {
		if (ltb.enabled) {
			await updateSettings({ user: { featureFlags: { learningDiary: false } } });
			dispatch({ type: "TOGGLE_LTB", enabled: false });
		} else {
			dispatch({ type: "OPEN_DIALOG" });
		}
	};

	const openSettings = () => {
		router.push("/user-settings");
	};

	const { user, _count: completionCount, enrollments, learningDiaryEntrys } = props.student;
	const gamificationProfile = user.gamificationProfile;

	const [streakInfoOpen, setStreakInfoOpen] = useState(false);
	const { t } = useTranslation(["common", "pages/dashboard"]);

	return (
		// Updated grid to accommodate the new achievements section
		<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
			{/* First column - Profile and achievements */}
			<div className="xl:col-span-1 space-y-6">
				{/* Existing profile section */}
				<section className="relative rounded-lg bg-white shadow p-4 space-y-2">
					<div className="absolute -top-4 -right-4 h-14 w-14">
						<StreakIndicatorCircle
							streakCount={gamificationProfile.loginStreak.count}
							onClick={() => setStreakInfoOpen(true)}
						/>
					</div>
					<div className="flex justify-between items-center mb-4">
						<button
							onClick={openSettings}
							className="rounded-full p-2 hover:bg-gray-100"
							title="Einstellungen"
						>
							<CogIcon className="h-5 w-5 text-gray-500" />
						</button>
					</div>

					<div className="flex flex-col items-center text-center">
						<ImageOrPlaceholder
							src={user.image ?? undefined}
							className="h-20 w-20 rounded-full object-cover mb-2"
						/>
						<h1 className="text-lg font-bold">{user.name}</h1>
						<p className="text-sm text-gray-500">{user.email}</p>
					</div>

					<Divider />

					<div className="text-sm space-y-1">
						<p>
							<strong>{t("Units learned")}</strong> {completionCount.completedLessons}
						</p>
						<p>
							<strong>Kurse:</strong> {enrollments.length}
						</p>
						<p>
							<strong>Fachgebiet:</strong> {user.name ?? "–"}
						</p>
						<p>
							<strong>Tage in Folge aktiv:</strong>{" "}
							{gamificationProfile.loginStreak.count}
						</p>
					</div>
				</section>

				{/* Achievements Section */}
				<DashboardAchievementsSection />
			</div>

			{/* Second and third columns - Course and Diary Section */}
			<div className="xl:col-span-2 grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg bg-white p-6 shadow">
					<h2 className="mb-4 text-lg font-semibold">Letzter Kurs</h2>
					<LastCourseProgress
						lastEnrollment={
							enrollments.sort(
								(a, b) =>
									new Date(b.lastProgressUpdate).getTime() -
									new Date(a.lastProgressUpdate).getTime()
							)[0]
						}
					/>
				</div>

				<div className="rounded-lg bg-white p-6 shadow">
					<h2 className="mb-4 text-lg font-semibold">
						{ltb.enabled
							? "Letzter Lerntagebucheintrag"
							: "Zuletzt bearbeitete Lerneinheiten"}
					</h2>
					{ltb.enabled ? (
						<LastLearningDiaryEntry pages={learningDiaryEntrys} />
					) : (
						<LessonList lessons={props.recentLessons} />
					)}
				</div>
			</div>

			{/* Dialogs */}
			{ltb.dialogOpen && (
				<EnableLearningDiaryDialog
					onClose={() => dispatch({ type: "CLOSE_DIALOG" })}
					onSubmit={handleDialogSubmit}
				/>
			)}
			<StreakSlotMachineDialog
				flames={gamificationProfile.flames}
				loginStreak={gamificationProfile.loginStreak}
				open={streakInfoOpen}
				trigger="dashboard"
				onClose={() => setStreakInfoOpen(false)}
			/>
		</div>
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
					<ul className="flex max-h-80 flex-col gap-2 overflow-auto overflow-x-hidden">
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
										<span className="hidden text-sm text-light md:block">
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

function LessonList({ lessons }: { lessons: LearningDiaryEntryLessonWithDetails[] }) {
	return (
		<>
			{lessons.length === 0 ? (
				<span className="text-sm text-light">Du hast keine Lerneinheiten bearbeitet.</span>
			) : (
				<ul className="flex max-h-80 flex-col gap-2 overflow-auto overflow-x-hidden">
					{lessons.map((lesson, index) => (
						<Link
							className="text-sm font-medium"
							href={`/courses/${lesson.courseSlug}/${lesson.slug}`}
							key={"course-" + index}
						>
							<li
								className="hover: flex items-center rounded-lg border border-light-border
                            pl-3 transition-transform hover:scale-105 hover:bg-slate-100 hover:shadow-lg"
							>
								<ImageOrPlaceholder
									src={lesson.courseImgUrl}
									className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
								/>
								<div className="flex w-full grid-rows-2 justify-between gap-2 px-4">
									<span className="flex gap-3 ">
										<span className="truncate max-w-xs">{lesson.title}</span>

										{lesson.completed && (
											<CheckIcon className="icon h-5 text-green-500" />
										)}
									</span>

									<span className="hidden text-xs text-light md:block">
										{formatDateAgo(lesson.touchedAt)}
									</span>
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
						footer={<ProgressBar completionPercentage={lastEnrollment.progress} />}
					/>
				</Link>
			)}
		</div>
	);
}
