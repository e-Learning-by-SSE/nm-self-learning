import { CogIcon, CheckIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthenticatedUser } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { StudentSettingsDialog } from "@self-learning/settings";
import {
	Card,
	Dialog,
	DialogActions,
	DialogHandler,
	dispatchDialog,
	freeDialog,
	ImageCard,
	ImageCardBadge,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	showToast,
	Toggle
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import {
	formatDateAgo,
	formatDateStringShort,
	formatTimeIntervalToString
} from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StudentSettings } from "@self-learning/types";
import { MarketingSvg, OverviewSvg, ProgressSvg, TargetSvg } from "@self-learning/ui/static";
import { LearningDiaryEntryStatusBadge } from "@self-learning/diary";

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

function getStudent(username: string) {
	return database.student.findUniqueOrThrow({
		where: { username },
		select: {
			_count: {
				select: {
					completedLessons: true
				}
			},
			settings: true,
			user: {
				select: {
					displayName: true,
					name: true,
					image: true
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

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
	const user = await getAuthenticatedUser(ctx);
	if (!user || !user.name) {
		return {
			redirect: {
				destination: "/login",
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
};

export default function Start(props: Props) {
	return <DashboardPage {...props} />;
}

function DashboardPage(props: Props) {
	const [editStudentDialog, setEditStudentDialog] = useState(false);
	const [studentSettings, setStudentSettings] = useState<StudentSettings>({
		hasLearningDiary: props.student.settings?.hasLearningDiary ?? false,
		learningStatistics: props.student.settings?.learningStatistics ?? false
	});
	const { mutateAsync: updateStudent } = trpc.me.updateStudent.useMutation();
	const router = useRouter();

	const onEditStudentClose: Parameters<
		typeof EditStudentDialog
	>[0]["onClose"] = async updated => {
		setEditStudentDialog(false);

		if (updated) {
			try {
				await updateStudent(updated);
				showToast({
					type: "success",
					title: "Informationen aktualisiert",
					subtitle: updated.user.displayName
				});
				router.replace(router.asPath);
			} catch (error) {
				console.error(error);

				if (error instanceof TRPCClientError) {
					showToast({ type: "error", title: "Fehler", subtitle: error.message });
				}
			}
		}
	};

	return (
		<div className="bg-gray-50">
			<CenteredSection>
				<div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-[2fr_1fr]">
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
								<span className="mx-1 font-semibold text-secondary">
									{props.student._count.completedLessons}
								</span>{" "}
								{props.student._count.completedLessons === 1
									? "Lerneinheit"
									: "Lerneinheiten"}{" "}
								abgeschlossen.
							</span>
						</div>

						{editStudentDialog && (
							<EditStudentDialog
								student={{ user: { displayName: props.student.user.displayName } }}
								onClose={onEditStudentClose}
							/>
						)}
					</section>

					<div className="grid grid-rows-2">
						<div className="flex justify-end items-start">
							<button
								className="rounded-full p-2 hover:bg-gray-100"
								title="Bearbeiten"
								onClick={() => setEditStudentDialog(true)}
							>
								<CogIcon className="h-6 text-gray-500" />
							</button>
						</div>

						<div className="flex items-end justify-end">
							<TagebuchToggle
								onChange={value => {
									setStudentSettings(value);
								}}
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
					<div className="rounded bg-white p-4 shadow">
						<h2 className="mb-4 text-xl">Letzter Kurs</h2>
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
						{studentSettings?.hasLearningDiary &&
						studentSettings?.learningStatistics ? (
							<>
								<h2 className="mb-4 text-xl">Letzter Lerntagebucheintrag</h2>
								<LastLearningDiaryEntry pages={props.student.learningDiaryEntrys} />
							</>
						) : (
							<>
								<h2 className="mb-4 text-xl">Zuletzt bearbeitete Lerneinheiten</h2>
								<LessonList lessons={props.recentLessons} />
							</>
						)}
					</div>
				</div>
				<div className="grid grid-cols-1 gap-8 pt-10 xl:grid-cols-2">
					<Card
						href="/dashboard/courseOverview"
						imageElement={<OverviewSvg />}
						title="Kursübersicht"
					/>
					{studentSettings?.hasLearningDiary && (
						<>
							<Card
								href="/learning-diary"
								imageElement={<MarketingSvg />}
								title="Lerntagebucheinträge verwalten"
							/>

							<Card
								href="/learning-diary"
								imageElement={<ProgressSvg />}
								title="Übersicht des Lerntagebuchs"
							/>

							<Card
								href="/learning-diary/goals"
								imageElement={<TargetSvg />}
								title="Lernziele verwalten"
							/>
						</>
					)}
				</div>
			</CenteredSection>
			<DialogHandler id="studentSettingsDialogDashboard" />
		</div>
	);
}

function TagebuchToggle({ onChange }: { onChange: (value: StudentSettings) => void }) {
	const { data: studentSettings, isLoading, refetch } = trpc.settings.getMySetting.useQuery();
	const hasLearningDiary = studentSettings?.hasLearningDiary || false;
	const hasLearningStatistics = studentSettings?.learningStatistics || false;

	return (
		<>
			{!isLoading && (
				<Toggle
					value={hasLearningDiary && hasLearningStatistics}
					onChange={() => {
						dispatchDialog(
							<StudentSettingsDialog
								initialSettings={{
									hasLearningDiary: false,
									learningStatistics: false,
									...studentSettings
								}}
								onClose={value => {
									refetch();
									onChange({
										hasLearningDiary: value.hasLearningDiary,
										learningStatistics: value.learningStatistics
									});
									freeDialog("studentSettingsDialogDashboard");
								}}
							/>,
							"studentSettingsDialogDashboard"
						);
					}}
					label="Lerntagebuch"
				/>
			)}
		</>
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

function ProgressFooter({ progress }: { progress: number }) {
	return (
		<span className="relative h-5 w-full rounded-lg bg-gray-200">
			<span
				className="absolute left-0 h-5 rounded-lg bg-secondary"
				style={{ width: `${progress}%` }}
			></span>
			<span
				className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
					progress === 0 ? "text-secondary" : "text-white"
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
						footer={<ProgressFooter progress={lastEnrollment.progress} />}
					/>
				</Link>
			)}
		</div>
	);
}

const editStudentSchema = z.object({
	user: z.object({ displayName: z.string().min(3).max(50) })
});

type EditStudent = z.infer<typeof editStudentSchema>;

function EditStudentDialog({
	student,
	onClose
}: {
	student: EditStudent;
	onClose: OnDialogCloseFn<EditStudent>;
}) {
	const form = useForm({
		defaultValues: student,
		resolver: zodResolver(editStudentSchema)
	});

	return (
		<Dialog title={student.user.displayName} onClose={onClose}>
			<form onSubmit={form.handleSubmit(onClose)}>
				<LabeledField label="Name" error={form.formState.errors.user?.displayName?.message}>
					<input
						{...form.register("user.displayName")}
						type="text"
						className="textfield"
					/>
				</LabeledField>

				<DialogActions onClose={onClose}>
					<button className="btn-primary" disabled={!form.formState.isValid}>
						Speichern
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
