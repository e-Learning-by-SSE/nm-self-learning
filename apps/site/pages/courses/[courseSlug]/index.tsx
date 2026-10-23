import { PlayIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { CourseType, LessonType } from "@prisma/client";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { SmallGradeBadge, useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { useEnrollmentMutations, useEnrollments } from "@self-learning/enrollment";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	getLessonDuration,
	CourseContent,
	extractLessonIds,
	LessonInfo
} from "@self-learning/types";
import {
	AuthorsList,
	OnlineHelpLink,
	ButtonActions,
	Dialog,
	OnDialogCloseFn,
	showToast,
	Tooltip
} from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredContainer, CenteredSection, useAuthentication } from "@self-learning/ui/layouts";
import { handleEmailTracking } from "@self-learning/ui/notifications";
import { withAuth } from "@self-learning/util/auth";
import { authOptions } from "@self-learning/util/auth/server";
import { formatDateDistanceToNow, formatSeconds } from "@self-learning/util/common";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { MarkdownRemote as MDXRemote } from "@self-learning/markdown";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import {
	useAiTutor,
	AiTutor,
	FloatingTutorButton,
	I18N_NAMESPACE as NS_AI_TUTOR
} from "@self-learning/ai-tutor";
import { CourseData, getCourseData } from "@self-learning/course";

function mapToTocContent(
	content: CourseContent,
	lessonIdMap: Map<string, LessonInfo>
): ToC.Content {
	let lessonNr = 1;

	return content.map(chapter => ({
		title: chapter.title,
		description: chapter.description,
		content: chapter.content.map(({ lessonId }) => {
			const lesson: ToC.Content[0]["content"][0] = lessonIdMap.has(lessonId)
				? {
						...(lessonIdMap.get(lessonId) as LessonInfo),
						lessonNr: lessonNr++
					}
				: {
						lessonId: "removed",
						slug: "removed",
						meta: { hasQuiz: false, mediaTypes: {} },
						title: "",
						lessonType: LessonType.TRADITIONAL,
						performanceScore: null,
						lessonNr: -1
					};

			return lesson;
		})
	}));
}

async function mapCourseContent(content: CourseContent, username?: string): Promise<ToC.Content> {
	const lessonIds = extractLessonIds(content);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			meta: true,
			completions: {
				where: { username },
				orderBy: { performanceScore: "desc" },
				take: 1, // Nur den höchsten Score nehmen
				select: {
					performanceScore: true,
					username: true
				}
			}
		}
	});

	const map = new Map<string, LessonInfo>();

	for (const lesson of lessons) {
		const { completions, ...rest } = lesson;
		const performanceScore = completions.length > 0 ? completions[0].performanceScore : null;
		const mappedLesson = { ...rest, performanceScore } as LessonInfo;
		map.set(lesson.lessonId, mappedLesson);
	}

	return mapToTocContent(content, map);
}

type Summary = {
	/** Total number of lessons in this course. */
	lessons: number;
	/** Total number of chapters in this course. Includes subchapters (tbd). */
	chapters: number;
	/** Duration in seconds of video material. */
	duration: number;
};

function createCourseSummary(content: ToC.Content): Summary {
	const chapters = content.length;
	let lessons = 0;
	let duration = 0;

	for (const chapter of content) {
		for (const lesson of chapter.content) {
			lessons++;
			duration += getLessonDuration(lesson.meta);
		}
	}

	return { lessons, chapters, duration };
}

type CourseProps = {
	isStale: boolean;
	isGenerated: boolean;
	course: CourseData;
	summary: Summary;
	content: ToC.Content;
	markdownDescription: CompiledMarkdown | null;
};

export const getServerSideProps = withTranslations(
	Array.from(new Set(["common", "pages-course", ...NS_AI_TUTOR])),
	withAuth(async context => {
		const { req, res, params } = context;
		const courseSlug = params?.courseSlug as string | undefined;
		if (!courseSlug) {
			throw new Error("No slug provided.");
		}

		const trackingResult = await handleEmailTracking(context);
		if (trackingResult.shouldRedirect) {
			return {
				redirect: {
					destination: `/courses/${courseSlug}`,
					permanent: false
				}
			};
		}

		const session = await getServerSession(req, res, authOptions);
		const sessionUser = session?.user;

		const course = await getCourseData(courseSlug, sessionUser?.name);
		if (!course) {
			return { notFound: true };
		}
		// content, isGenerated and isStale are resolved in getCourseData.
		const content = await mapCourseContent((course.content ?? []) as CourseContent);
		let markdownDescription = null;

		if (course.description && course.description.length > 0) {
			markdownDescription = await compileMarkdown(course.description);
			course.description = null;
		}

		const summary = createCourseSummary(content);

		return {
			props: {
				isStale: course.isStale,
				isGenerated: course.isGenerated,
				course,
				summary,
				content,
				markdownDescription
			}
		};
	})
);

export default function Course({
	isStale,
	course,
	summary,
	content,
	markdownDescription,
	isGenerated
}: CourseProps) {
	const tutorState = useAiTutor();
	return (
		<div className="pb-32">
			<CenteredSection>
				<CourseHeader
					course={course}
					content={content}
					summary={summary}
					isStale={isStale}
					isGenerated={isGenerated}
				/>
			</CenteredSection>

			{markdownDescription && (
				<section className="bg-white py-16">
					<CenteredContainer>
						<Description content={markdownDescription} />
					</CenteredContainer>
				</section>
			)}

			<CenteredSection>
				<TableOfContents content={content} course={course} isGenerated={isGenerated} />
			</CenteredSection>
			<FloatingTutorButton
				onToggle={tutorState.toggleTutor}
				disabled={tutorState.isAnimating}
				hideToggle={tutorState.hideToggle || !tutorState.config}
			/>

			<AiTutor tutorState={tutorState} />
		</div>
	);
}

function CourseHeader({
	isGenerated,
	isStale,
	course,
	summary,
	content
}: {
	isGenerated: boolean;
	isStale: boolean;
	course: CourseProps["course"];
	summary: CourseProps["summary"];
	content: CourseProps["content"];
}) {
	const { t } = useTranslation("pages-course");
	const { withAuth, isAuthenticated } = useAuthentication();

	const isDynamic = course.type === CourseType.DYNAMIC;

	const enrollments = useEnrollments();
	const { enroll } = useEnrollmentMutations();
	const { data: completion, refetch: fetchCourseCompletion } =
		trpc.completion.getCourseCompletion.useQuery(
			{ courseSlug: course.slug },
			{ enabled: false }
		);

	const session = useSession();

	useEffect(() => {
		if (session.status === "authenticated" && !completion) {
			fetchCourseCompletion();
		}
	}, [session.status, fetchCourseCompletion, completion]);

	// A personal path (known from the server) or an enrollment means the student started the course.
	const isEnrolled = useMemo(
		() => isGenerated || !!enrollments?.some(e => e.course.slug === course.slug),
		[isGenerated, enrollments, course.slug]
	);

	const nextLessonSlug: string | null = useMemo(() => {
		if (!completion) return null;

		for (const chapter of content) {
			for (const lesson of chapter.content) {
				if (!completion.completedLessons[lesson.lessonId]) {
					return lesson.slug;
				}
			}
		}

		return null;
	}, [completion, content]);

	const firstLessonFromChapter = content[0]?.content[0] ?? null;
	const lessonCompletionCount = completion?.courseCompletion.completedLessonCount ?? 0;

	const shouldShowStartButton = isEnrolled && !!firstLessonFromChapter;

	const avgScore = useMemo(() => {
		const scores = content
			.flatMap(chapter => chapter.content.map(lesson => lesson.performanceScore))
			.filter(score => score != null);

		const sumScore = scores.reduce((acc, score) => acc + (score ?? 0), 0);
		if (scores.length === 0) return null;
		else return sumScore / scores.length;
	}, [content]);

	const isParticipant = session.data?.user.featureFlags.experimental ?? false;

	return (
		<section className="flex flex-col gap-16">
			<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
				<div className="flex flex-col justify-between gap-12">
					<div className="flex min-w-[50%] flex-col-reverse gap-12 md:flex-col">
						<div className="flex items-center gap-2">
							<h1 className="mb-12 text-4xl md:text-6xl">{course.title}</h1>
							<OnlineHelpLink relativePath="course-page.html#course-overview" />
						</div>
						{course.subtitle && (
							<div className="text-lg tracking-tight text-light">
								{course.subtitle}
							</div>
						)}
					</div>

					<div className="flex flex-col gap-4">
						<AuthorsList authors={course.authors} />
						<CreatedUpdatedDates
							createdAt={course.createdAt}
							updatedAt={course.updatedAt}
						/>
					</div>
				</div>

				<div className="flex w-full flex-col gap-4 rounded-lg">
					<div className="relative h-64 w-full shrink-0 grow">
						{course.imgUrl && (
							<Image
								priority
								className="shrink-0 rounded-lg bg-white object-cover"
								src={course.imgUrl}
								fill={true}
								sizes="600px"
								alt=""
							></Image>
						)}

						<ul
							className={`absolute bottom-0 grid w-full ${
								isParticipant ? "grid-cols-4" : "grid-cols-3"
							} divide-x divide-c-primary rounded-b-lg border border-c-border border-t-transparent bg-white bg-opacity-80 p-2 text-center`}
						>
							<li className="flex flex-col">
								<span className="font-semibold text-c-primary">
									{t("common:Lesson_other")}
								</span>
								<span className="text-c-text-muted">{summary.lessons}</span>
							</li>
							<li className="flex flex-col">
								<span className="font-semibold text-c-primary">{t("Chapters")}</span>
								<span className="text-c-text-muted">{summary.chapters}</span>
							</li>
							<li className="flex flex-col">
								<span className="font-semibold text-c-primary">{t("Duration")}</span>
								<span className="text-c-text-muted">
									{formatSeconds(summary.duration)}
								</span>
							</li>
							{isParticipant && (
								<li className="flex flex-col items-center">
									<span className="font-semibold text-c-primary">
										{t("Score")}{" "}
									</span>
									{avgScore != null ? (
										<div className="flex justify-center">
											<SmallGradeBadge rating={avgScore} />
										</div>
									) : (
										<span>{t("No_Score")}</span>
									)}
								</li>
							)}
						</ul>
					</div>

					{shouldShowStartButton && (
						<Link
							href={
								firstLessonFromChapter
									? `/courses/${course.slug}/${
											nextLessonSlug ?? firstLessonFromChapter.slug
										}`
									: `/courses/${course.slug}`
							}
							className="btn-primary"
						>
							<span>
								{nextLessonSlug
									? lessonCompletionCount === 0
										? t("Start_Course")
										: t("Continue_Course")
									: t("Open_Course")}
							</span>
							<PlayIcon className="h-5" />
						</Link>
					)}

					{isDynamic
						? // Generate a personal path, or refresh it when the course changed.
							(!isGenerated || isStale) && (
								<CoursePath course={course} isStale={isStale} />
							)
						: !isEnrolled && (
								<button
									className="btn-primary disabled:opacity-50"
									onClick={() => {
										withAuth(() => {
											enroll({ courseId: course.courseId });
										});
									}}
								>
									{isAuthenticated ? (
										<>
											<span>{t("Add_To_Learning_Plan")}</span>
											<PlusCircleIcon className="h-5" />
										</>
									) : (
										<span>{t("Learning_Plan_Available_After_Login")}</span>
									)}
								</button>
							)}
				</div>
			</div>
		</section>
	);
}

function TableOfContents({
	content,
	course,
	isGenerated
}: {
	content: ToC.Content;
	course: CourseData;
	isGenerated: boolean;
}) {
	const { t } = useTranslation("pages-course");
	const completion = useCourseCompletion(course.slug);
	const hasContent = content.some(chapter => chapter.content.length > 0);

	if (course.type === CourseType.DYNAMIC && !isGenerated && !hasContent) {
		return (
			<div className="flex flex-col gap-4 p-8 rounded-lg bg-c-surface-2">
				<h3 className="heading flex gap-4 text-2xl">
					<span className="text-c-primary">{t("No_Content_Available")}</span>
				</h3>
				<span className="mt-4 text-c-text-muted">
					{t("No_Course_Path_Generated")}
				</span>
			</div>
		);
	}

	if (isGenerated && !hasContent) {
		return (
			<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
				<span className="text-secondary">{t("No_Contents_Available")}</span>
				<span className="mt-4 text-light">
					{t("No_Learning_Content_Remaining")}
				</span>
			</div>
		);
	}

	return (
		<section className="flex flex-col gap-8">
			<h2 className="mb-4 text-4xl">{t("Content")}</h2>
			<ul className="flex flex-col gap-16">
				{content.map((chapter, index) => (
					<li key={index} className="flex flex-col rounded-lg bg-c-surface-2 p-8">
						{content.length > 1 && (
							<>
								<h3 className="heading flex gap-4 text-2xl">
									<span>{index + 1}.</span>
									<span className="text-c-primary">{chapter.title}</span>
								</h3>
								<span className="mt-4 text-c-text-muted">
									{chapter.description}
								</span>
							</>
						)}

						<ul className="mt-8 flex flex-col gap-1">
							{chapter.content.map(lesson => (
								<Lesson
									key={lesson.lessonId}
									href={`/courses/${course.slug}/${lesson.slug}`}
									lesson={lesson}
									isCompleted={!!completion?.completedLessons[lesson.lessonId]}
								/>
							))}
						</ul>
					</li>
				))}
			</ul>
		</section>
	);
}

function Lesson({
	lesson,
	href,
	isCompleted
}: {
	lesson: ToC.Content[0]["content"][0];
	href: string;
	isCompleted: boolean;
}) {
	const { isAuthenticated } = useAuthentication();

	if (!isAuthenticated) {
		return (
			<div className="flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm border-c-border-strong">
				<LessonEntry lesson={lesson} />
			</div>
		);
	}
	return (
		<Link
			href={href}
			className={`flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm ${
				isCompleted ? "border-c-primary" : "border-c-border-strong"
			}`}
		>
			<LessonEntry lesson={lesson} />
		</Link>
	);
}

function LessonEntry({ lesson }: { lesson: ToC.Content[0]["content"][0] }) {
	const { t } = useTranslation("pages-course");
	return (
		<span className="flex items-center justify-between w-full">
			<span className="flex items-center">
				<span className="w-8 shrink-0 self-center font-medium text-c-primary">
					{lesson.lessonNr}
				</span>
				<span>{lesson.lessonId === "removed" ? t("Removed_Lesson") : lesson.title}</span>
			</span>
			{/* Grade badge - klein und konsistent mit GradeDisplay */}
			{lesson.performanceScore != null && (
				<Tooltip content={t("Best_Previous_Rating_Tooltip")}>
					<SmallGradeBadge rating={lesson.performanceScore} />
				</Tooltip>
			)}
		</span>
	);
}

function CreatedUpdatedDates({ createdAt, updatedAt }: { createdAt: Date; updatedAt: Date }) {
	const { t, i18n } = useTranslation("pages-course");
	const locale = i18n.language.startsWith("de") ? "de" : "en";
	return (
		<div className="flex flex-wrap gap-2 text-xs text-c-text-muted">
			<span>
				{t("Created")}:{" "}
				<span suppressHydrationWarning>{formatDateDistanceToNow(createdAt, locale)}</span>
			</span>
			<span>|</span>
			<span>
				{t("Last_Changed")}:{" "}
				<span suppressHydrationWarning>{formatDateDistanceToNow(updatedAt, locale)}</span>
			</span>
		</div>
	);
}

function Description({ content }: { content: CompiledMarkdown }) {
	return (
		<div className="prose prose-emerald max-w-full">
			<MDXRemote {...content}></MDXRemote>
		</div>
	);
}

function RefreshGeneratedCourse({ onClick }: { onClick: () => void }) {
	const { t } = useTranslation("pages-course");
	return (
		<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
			<h3 className="heading flex gap-4 text-2xl">
				<span className="text-secondary">{t("Refresh_Course_Title")}</span>
			</h3>
			<span className="mt-4 text-light">
				{t("Refresh_Course_Description")}
			</span>
			<button
				className="btn-primary mt-4 w-full text-white p-3 rounded-lg flex items-center justify-center font-semibold"
				onClick={onClick}
			>
				{t("Refresh_Course_Button")}
			</button>
		</div>
	);
}

function CoursePath({ course, isStale }: { course: CourseData; isStale: boolean }) {
	const { t } = useTranslation("pages-course");
	const { mutateAsync } = trpc.course.createLessonPath.useMutation();
	const router = useRouter();
	const [jobId, setJobId] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const { data: status } = trpc.jobQueue.getStatus.useQuery(
		{ jobId: jobId ?? "" },
		{
			enabled: !!jobId,
			refetchInterval: query => {
				const status = query.state.data?.status;

				if (status === "FINISHED" || status === "ABORTED") {
					return false;
				}

				return 1000;
			}
		}
	);
	// The job result is not stored for path generation: FINISHED means the path was saved.
	const isComplete = status?.status === "FINISHED";
	const isFailed = status?.status === "ABORTED";

	// Report the failure
	useEffect(() => {
		if (isFailed) {
			showToast({
				type: "error",
				title: t("common:Error"),
				subtitle: t("Course_Generation_Failed")
			});
		}
	}, [isFailed, t]);

	const generateDynamicCourse = async () => {
		try {
			// Drop the previous job so its ABORTED status does not hide the new dialog.
			setJobId(null);
			setIsGenerating(true);

			const createdJobId = await mutateAsync({
				courseId: course.courseId
			});

			if (!createdJobId) {
				setIsGenerating(false);

				showToast({
					type: "error",
					title: t("common:Error"),
					subtitle: t("Course_Generation_Failed")
				});

				return;
			}

			setJobId(createdJobId);
		} catch (error) {
			setIsGenerating(false);

			console.error("Error generating course:", error);

			showToast({
				type: "error",
				title: t("common:Error"),
				subtitle: t("Course_Generation_Failed")
			});
		}
	};

	// The dialog closes on its own when the job failed.
	const isDialogOpen = isGenerating && !isFailed;
	// Reload re-reads content, isGenerated and isStale from getCourseData.
	const generationDialog = isDialogOpen ? (
		<GeneratingCourseDialog
			isComplete={isComplete}
			onClose={() => {
				setIsGenerating(false);
				if (isComplete) {
					router.reload();
				}
			}}
		/>
	) : null;

	if (isStale) {
		return (
			<>
				{generationDialog}
				<RefreshGeneratedCourse onClick={generateDynamicCourse} />
			</>
		);
	}

	return (
		<div>
			{generationDialog}
			<h3 className="font-semibold text-lg">{t("Generate_Course_Path")}</h3>
			<button
				className="btn-primary mt-4 w-full text-white p-3 rounded-lg flex items-center justify-center font-semibold"
				onClick={generateDynamicCourse}
				disabled={isDialogOpen}
			>
				{t("common:Generate")}
			</button>
		</div>
	);
}

function GeneratingCourseDialog({
	onClose,
	isComplete
}: {
	onClose: OnDialogCloseFn<string>;
	isComplete: boolean;
}) {
	const { t } = useTranslation("pages-course");
	return (
		<Dialog title={t("Generating_Course_Path_Title")} onClose={onClose} style={{ minWidth: 480 }}>
			<div className="flex flex-col items-center justify-center py-4">
				{!isComplete ? (
					<>
						<div className="mb-6 relative">
							<div className="w-24 h-24 rounded-full border-4 border-t-emerald-500 border-r-emerald-300 border-b-emerald-200 border-l-gray-200 animate-spin"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 animate-pulse"></div>
								</div>
							</div>
						</div>
						<p className="text-center text-lg font-medium">
							{t("Generating_Course_Path")}
						</p>
						<p className="text-center text-sm text-light mt-2">
							{t("Generating_Course_Path_Description")}
						</p>
					</>
				) : (
					<>
						<div className="mb-6 text-emerald-500">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-24 w-24"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<p className="text-center text-lg font-medium">
							{t("Course_Path_Generated_Successfully")}
						</p>
						<p className="text-center text-sm text-light mt-2">
							{t("Close_To_Start_Course")}
						</p>
						<button
							className="btn-primary mt-6 px-8 py-2"
							onClick={() => onClose(ButtonActions.OK)}
						>
							{t("common:Close")}
						</button>
					</>
				)}
			</div>
		</Dialog>
	);
}
