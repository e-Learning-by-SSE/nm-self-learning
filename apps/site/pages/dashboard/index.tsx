import { CheckIcon, CogIcon } from "@heroicons/react/24/solid";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import {
	EnableLearningDiaryDialog,
	LearningDiaryEntryStatusBadge,
	StatusBadgeInfo
} from "@self-learning/diary";
import {
	Card,
	DialogHandler,
	ImageCard,
	ImageCardBadge,
	ImageOrPlaceholder,
	Toggle
} from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { MarketingSvg, OverviewSvg, TargetSvg } from "@self-learning/ui/static";
import { withAuth } from "@self-learning/util/auth";
import {
	formatDateAgo,
	formatDateStringShort,
	formatTimeIntervalToString
} from "@self-learning/util/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useReducer } from "react";

type Student = Awaited<ReturnType<typeof getStudent>>;

type RecentLesson = {
	title: string;
	slug: string;
	courseSlug: string;
	courseImgUrl?: string | null;
	touchedAt: Date;
	completed: boolean;
};

type Props = {
	student: Student;
	recentLessons: RecentLesson[];
};

function getStudent(username: string) {
	return database.student.findUniqueOrThrow({
		where: { username },
		select: {
			_count: {
				select: {
					completedLessons: true
				}
			},
			user: {
				select: {
					displayName: true,
					name: true,
					image: true,
					featureFlags: true
				}
			},
			completedLessons: {
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					lessonId: true,
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
}

export type DiaryLessonSchema = {
	id: string;
	courseSlug: string;
	courseImgUrl: string | null;
	entryId: string;
	lessonId: string;
	createdAt: Date;
};

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
			completed: !!completedLesson
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
			completed: true
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

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<Props>(async (_, user) => {
		// TODO: remove this when in case gamification is fully enabled
		const isParticipant = user.featureFlags.experimental;
		if (isParticipant) {
			return {
				redirect: {
					destination: "/profile",
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

export default function Start(props: Props) {
	return <DashboardPage {...props} />;
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

function DashboardPage(props: Props) {
	const { mutateAsync: updateSettings } = trpc.me.updateFeatureFlags.useMutation();
	const router = useRouter();
	const [ltb, dispatch] = useReducer(ltbReducer, {
		dialogOpen: false,
		enabled: props.student.user.featureFlags?.learningDiary ?? false
	});

	const openSettings = () => {
		router.push("/user-settings");
	};

	const handleClickLtbToggle = async () => {
		if (ltb.enabled) {
			await updateSettings({ learningDiary: true });
			dispatch({ type: "TOGGLE_LTB", enabled: false });
		} else {
			dispatch({ type: "OPEN_DIALOG" });
		}
	};

	const handleDialogSubmit: Parameters<
		typeof EnableLearningDiaryDialog
	>[0]["onSubmit"] = async update => {
		if (!update) return;
		await updateSettings(update);
		dispatch({ type: "TOGGLE_LTB", enabled: true });
		dispatch({ type: "CLOSE_DIALOG" });
	};

	return (
		<div>
			<CenteredSection>
				<div className="grid grid-cols-1 gap-8 lg:pt-10 lg:grid-cols-[2fr_1fr]">
					<section className="flex items-center">
						<ImageOrPlaceholder
							src={props.student.user.image ?? undefined}
							className="h-24 w-24 rounded-lg object-cover"
						/>
						<div className="flex flex-col gap-4 pl-8 pr-4">
							<h1 className=" text-3xl lg:text-6xl">
								{props.student.user.displayName}
							</h1>
							<span>
								Du hast bereits{" "}
								<span className="mx-1 font-semibold text-c-primary">
									{props.student._count.completedLessons}
								</span>{" "}
								{props.student._count.completedLessons === 1
									? "Lerneinheit"
									: "Lerneinheiten"}{" "}
								abgeschlossen.
							</span>
						</div>
					</section>

					<div className="grid grid-rows-2">
						<div className="flex justify-end items-start">
							<button
								className="rounded-full p-2 hover:bg-c-hover-muted"
								title="Bearbeiten"
								onClick={openSettings}
							>
								<CogIcon className="h-6 text-c-text-muted" />
							</button>
						</div>

						<div className="flex items-end justify-end">
							<Toggle
								label="Lerntagebuch"
								value={ltb.enabled}
								onChange={handleClickLtbToggle}
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
					<div className="rounded bg-white p-4 shadow">
						<h2 className="text-xl py-2 px-2">Letzter Kurs</h2>
						<div className="mb-4 border-b border-c-border h-[6px]"></div>
						<LastCourseProgress
							lastEnrollment={
								props.student.enrollments.sort(
									(a, b) =>
										new Date(a.lastProgressUpdate).getTime() -
										new Date(b.lastProgressUpdate).getTime()
								)[0]
							}
						/>
					</div>

					<div className="rounded bg-white p-4 shadow">
						{ltb.enabled ? (
							<>
								<StatusBadgeInfo
									header="Letzter Lerntagebucheintrag"
									className="mb-4"
								/>
								<LastLearningDiaryEntry pages={props.student.learningDiaryEntrys} />
							</>
						) : (
							<>
								<h2 className="text-xl py-2 px-2">
									Zuletzt bearbeitete Lerneinheiten
								</h2>
								<div className="mb-4 border-b border-c-border h-[6px]"></div>
								<LessonList lessons={props.recentLessons} />
							</>
						)}
					</div>
				</div>
				<div className="grid grid-cols-1 gap-8 pt-10 xl:grid-cols-2">
					<Card
						href="/dashboard/courseOverview"
						imageElement={<OverviewSvg />}
						title="Meine Kurse"
					/>
					{ltb.enabled && (
						<>
							<Card
								href="/learning-diary"
								imageElement={<MarketingSvg />}
								title="Mein Lerntagebuch"
							/>

							<Card
								href="/learning-diary/goals"
								imageElement={<TargetSvg />}
								title="Meine Lernziele"
							/>
						</>
					)}
				</div>
			</CenteredSection>
			<DialogHandler id="studentSettingsDialogDashboard" />
			{ltb.dialogOpen && (
				<EnableLearningDiaryDialog
					onClose={() => dispatch({ type: "CLOSE_DIALOG" })}
					onSubmit={handleDialogSubmit}
				/>
			)}
		</div>
	);
}

function LastLearningDiaryEntry({ pages }: { pages: Student["learningDiaryEntrys"] }) {
	return (
		<>
			{pages.length == 0 ? (
				<span className="text-sm text-c-text-muted">
					Keine Lerntagebucheinträge vorhanden. Einträge werden erstellt, wenn du mit dem
					Lernen beginnst.
				</span>
			) : (
				<>
					<ul className="flex max-h-80 flex-col gap-2 overflow-auto overflow-x-hidden p-3">
						{pages.map((page, _) => (
							<Link
								className="text-sm font-medium"
								href={`/learning-diary/page/${page.id}/`}
								key={page.id}
							>
								<li
									className="hover: flex items-center rounded-lg border border-c-border
							p-3 transition-transform hover:bg-c-hover-muted hover:scale-105"
								>
									<div className="flex w-full flex-col lg:flex-row items-center justify-between gap-2 pl-5 pr-2">
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
										<span className="hidden text-xs text-c-text-muted md:block">
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
				<span className="text-sm text-c-text-muted">
					Du hast noch keine Lerneinheiten bearbeitet.
				</span>
			) : (
				<ul className="flex max-h-80 flex-col gap-2 overflow-auto overflow-x-hidden p-3">
					{lessons.map((lesson, index) => (
						<Link
							className="text-sm font-medium"
							href={`/courses/${lesson.courseSlug}/${lesson.slug}`}
							key={"course-" + index}
						>
							<li
								className="hover: flex items-center rounded-lg border border-c-border
							px-3 transition-transform hover:bg-c-hover-muted hover:scale-105"
							>
								<ImageOrPlaceholder
									src={lesson.courseImgUrl ?? undefined}
									className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
								/>
								<div className="flex w-full grid-rows-2 justify-between gap-2 px-4">
									<span className="flex gap-3 ">
										<span className="truncate max-w-xs">{lesson.title}</span>

										{lesson.completed && (
											<CheckIcon className="icon h-5 text-green-500" />
										)}
									</span>

									<span className="hidden text-xs text-c-text-muted md:block">
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

function ProgressFooter({ progress }: { progress: number }) {
	return (
		<span className="relative h-5 w-full rounded-lg bg-c-surface-3">
			<span
				className="absolute left-0 h-5 rounded-lg bg-c-primary"
				style={{ width: `${progress}%` }}
			></span>
			<span
				className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
					progress === 0 ? "text-c-primary" : "text-white"
				}`}
			>
				{progress}%
			</span>
		</span>
	);
}

function LastCourseProgress({ lastEnrollment }: { lastEnrollment?: Student["enrollments"][0] }) {
	if (!lastEnrollment) {
		return (
			<div>
				<span className="text-sm text-c-text-muted">
					Du bist momentan in keinem Kurs eingeschrieben.
				</span>
				<Link
					href="/subjects"
					className="text-sm ml-1 text-c-text-muted underline hover:text-c-primary"
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
									className="bg-c-primary text-white"
									text="Abgeschlossen"
								/>
							) : (
								<></>
							)
						}
						footer={<ProgressFooter progress={lastEnrollment.progress} />}
					/>
				</Link>
			)}
		</div>
	);
}
