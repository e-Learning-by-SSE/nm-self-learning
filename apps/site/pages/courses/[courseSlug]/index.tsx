import { PlayIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { useEnrollmentMutations, useEnrollments } from "@self-learning/enrollment";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { CourseContent, Defined, extractLessonIds, LessonInfo } from "@self-learning/types";
import { AuthorsList, showToast, ButtonActions, OnDialogCloseFn } from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredContainer, CenteredSection, useAuthentication } from "@self-learning/ui/layouts";
import { formatDateAgo, formatSeconds } from "@self-learning/util/common";
import { useCourseGenerationSSE } from "@self-learning/util/common";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useRouter } from "next/router";
import { Dialog } from "@self-learning/ui/common";
import { CombinedCourseResult, getCombinedCourses } from "@self-learning/course";

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
						title: "Removed",
						lessonType: LessonType.TRADITIONAL,
						lessonNr: -1
					};

			return lesson;
		})
	}));
}

async function mapCourseContent(content: CourseContent): Promise<ToC.Content> {
	const lessonIds = extractLessonIds(content);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			meta: true
		}
	});

	const map = new Map<string, LessonInfo>();

	for (const lesson of lessons) {
		map.set(lesson.lessonId, lesson as LessonInfo);
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
			duration +=
				lesson.meta?.mediaTypes.video?.duration ??
				lesson.meta?.mediaTypes.article?.estimatedDuration ??
				0;
		}
	}

	return { lessons, chapters, duration };
}

type CourseProps = {
	needsARefresh: boolean;
	isGenerated: boolean;
	course: CombinedCourseResult;
	summary: Summary;
	content: ToC.Content;
	markdownDescription: CompiledMarkdown | null;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<CourseProps>(async (req, ctx) => {
		const courseSlug = req.params?.courseSlug as string | undefined;
		if (!courseSlug) {
			throw new Error("No slug provided.");
		}

		let isGenerated = false;
		let needsARefresh = false;

		const result = await getCombinedCourses({
			slug: courseSlug,
			username: ctx.name,
			includeContent: true
		});

		let course = result[0];

		if (!course) {
			return { notFound: true };
		}

		if (
			course.courseType === "DYNAMIC" &&
			course.localCourseVersion !== undefined &&
			course.globalCourseVersion !== undefined
		) {
			isGenerated = true;
			needsARefresh = course?.localCourseVersion < course?.globalCourseVersion;
			if (course.content === undefined) {
				course = {
					...course,
					content: []
				};
			}
		}

		const content = await mapCourseContent(course.content as CourseContent);
		let markdownDescription = null;

		if (course.description && course.description.length > 0) {
			markdownDescription = await compileMarkdown(course.description);
			course.description = null;
		}

		const summary = createCourseSummary(content);

		return {
			props: {
				needsARefresh,
				isGenerated,
				course: JSON.parse(JSON.stringify(course)) as Defined<typeof course>,
				summary,
				content,
				markdownDescription
			},
			notFound: !course
		};
	})
);

export default function Course({
	needsARefresh,
	course,
	summary,
	content,
	markdownDescription,
	isGenerated
}: CourseProps) {
	return (
		<div className="bg-gray-50 pb-32">
			<CenteredSection className="bg-gray-50">
				<CourseHeader
					course={course}
					content={content}
					summary={summary}
					needsARefresh={needsARefresh}
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

			<CenteredSection className="bg-gray-50">
				<TableOfContents content={content} course={course} isGenerated={isGenerated} />
			</CenteredSection>
		</div>
	);
}

function CourseHeader({
	isGenerated,
	needsARefresh,
	course,
	summary,
	content
}: {
	isGenerated: boolean;
	needsARefresh: boolean;
	course: CourseProps["course"];
	summary: CourseProps["summary"];
	content: CourseProps["content"];
}) {
	const { withAuth, isAuthenticated } = useAuthentication();

	const enrollments = useEnrollments();
	const { enroll } = useEnrollmentMutations();
	const completion = useCourseCompletion(course.slug);

	const isEnrolled = useMemo(() => {
		if (!enrollments) return false;
		return !!enrollments.find(e => e.course.slug === course.slug);
	}, [enrollments, course]);

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

	const shouldShowStartButton =
		isEnrolled &&
		(!isGenerated ||
			(isGenerated && Array.isArray(course.content) && course.content.length !== 0));

	return (
		<section className="flex flex-col gap-16 bg-red-300">
			<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
				<div className="flex flex-col justify-between gap-12">
					<div className="flex min-w-[50%] flex-col-reverse gap-12 md:flex-col">
						<div>
							<h1 className="mb-12 text-4xl md:text-6xl">{course.title}</h1>
							{course.subtitle && (
								<div className="text-lg tracking-tight text-light">
									{course.subtitle}
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<AuthorsList authors={course.authors} />
						<CreatedUpdatedDates
							createdAt={formatDateAgo(course.createdAt)}
							updatedAt={formatDateAgo(course.updatedAt)}
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

						<ul className="absolute bottom-0 grid w-full grid-cols-3 divide-x divide-secondary rounded-b-lg border border-light-border border-t-transparent bg-white bg-opacity-80 p-2 text-center">
							<li className="flex flex-col">
								<span className="font-semibold text-secondary">Lerneinheiten</span>
								<span className="text-light">{summary.lessons}</span>
							</li>
							<li className="flex flex-col">
								<span className="font-semibold text-secondary">Kapitel</span>
								<span className="text-light">{summary.chapters}</span>
							</li>
							<li className="flex flex-col">
								<span className="font-semibold text-secondary">Dauer</span>
								<span className="text-light">
									{formatSeconds(summary.duration)}
								</span>
							</li>
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
										? "Starten"
										: "Fortfahren"
									: "Öffnen"}
							</span>
							<PlayIcon className="h-5" />
						</Link>
					)}
					{!isEnrolled && (
						<button
							className="btn-primary disabled:opacity-50"
							onClick={() => {
								withAuth(() => {
									enroll({ courseId: course.courseId });
								});
							}}
						>
							{isAuthenticated && (
								<>
									<span>Zum Lernplan hinzufügen</span>
									<PlusCircleIcon className="h-5" />
								</>
							)}
							{!isAuthenticated && <span>Lernplan nach Login verfügbar</span>}
						</button>
					)}
					{isGenerated && <CoursePath course={course} needsARefresh={needsARefresh} />}
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
	course: CombinedCourseResult;
	isGenerated: boolean;
}) {
	const completion = useCourseCompletion(course.slug);
	const hasContent = content.length > 0;

	if (!hasContent) {
		return (
			<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
				<h3 className="heading flex gap-4 text-2xl">
					<span className="text-secondary">Kein Inhalt verfügbar</span>
				</h3>
				<span className="mt-4 text-light">
					Du hast dir noch keinen Kurspfad generiert. Bitte wähle einen Kurspfad aus.
				</span>
			</div>
		);
	}

	if (isGenerated && !hasContent) {
		return (
			<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
				<span className="text-secondary">Keine Inhalte verfügbar</span>
				<span className="mt-4 text-light">
					Du hast entweder alle Skills schon erreicht oder es sind keine Lerninhalte
					verfügbar.
				</span>
			</div>
		);
	}

	return (
		<section className="flex flex-col gap-8">
			<h2 className="mb-4 text-4xl">Inhalt</h2>
			<ul className="flex flex-col gap-16">
				{content.map((chapter, index) => (
					<li key={index} className="flex flex-col rounded-lg bg-gray-100 p-8">
						{content.length > 1 && (
							<>
								<h3 className="heading flex gap-4 text-2xl">
									<span>{index + 1}.</span>
									<span className="text-secondary">{chapter.title}</span>
								</h3>
								<span className="mt-4 text-light">{chapter.description}</span>
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
			<div className="flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm border-gray-300">
				<LessonEntry lesson={lesson} />
			</div>
		);
	}
	return (
		<Link
			href={href}
			className={`flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm ${
				isCompleted ? "border-emerald-500" : "border-gray-300"
			}`}
		>
			<LessonEntry lesson={lesson} />
		</Link>
	);
}

function LessonEntry({ lesson }: { lesson: ToC.Content[0]["content"][0] }) {
	return (
		<span className="flex">
			<span className="w-8 shrink-0 self-center font-medium text-secondary">
				{lesson.lessonNr}
			</span>
			<span>{lesson.title}</span>
		</span>
	);
}

function CreatedUpdatedDates({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
	return (
		<div className="flex flex-wrap gap-2 text-xs text-light">
			<span>
				Erstellt: <span>{createdAt}</span>
			</span>
			<span>|</span>
			<span>
				Letzte Änderung: <span>{updatedAt}</span>
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
	return (
		<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
			<h3 className="heading flex gap-4 text-2xl">
				<span className="text-secondary">Kurs aktualisieren</span>
			</h3>
			<span className="mt-4 text-light">
				Der Kurs wurde aktualisiert. Du kannst den Kurs jetzt starten und dein Wissen
				erweitern.
			</span>
			<button
				className="btn-primary mt-4 w-full text-white p-3 rounded-lg flex items-center justify-center font-semibold"
				onClick={onClick}
			>
				Kurs aktualisieren
			</button>
		</div>
	);
}

function CoursePath({
	course,
	needsARefresh
}: {
	course: CombinedCourseResult;
	needsARefresh: boolean;
}) {
	//const { mutateAsync } = trpc.dynCourse.generateDynCourse.useMutation();
	const { mutateAsync } = trpc.course.generateDynCourse.useMutation();
	const router = useRouter();
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationId, setGenerationId] = useState<string | null>(null);
	const [isComplete, setIsComplete] = useState(false);

	const generateDynamicCourse = async () => {
		try {
			setIsGenerating(true);
			setIsComplete(false);
			const result = await mutateAsync({
				courseId: course.courseId,
				knowledge: []
			});
			setGenerationId(result.generationId);
		} catch (error) {
			setIsGenerating(false);
			console.error("Error generating course preview:", error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Der Kurs konnte nicht generiert werden."
			});
		}
	};

	if (Array.isArray(course.content) && course.content.length !== 0 && needsARefresh) {
		return <RefreshGeneratedCourse onClick={generateDynamicCourse} />;
	}

	if (Array.isArray(course.content) && course.content.length !== 0) {
		return null;
	}

	return (
		<div>
			{isGenerating && (
				<GeneratingCourseDialog
					generationId={generationId}
					onClose={() => {
						setIsGenerating(false);
						setGenerationId(null);
						if (isComplete) {
							router.reload();
						}
					}}
					onComplete={() => setIsComplete(true)}
				/>
			)}
			<h3 className="font-semibold text-lg">Kurspfad generieren</h3>
			<button
				className="btn-primary mt-4 w-full text-white p-3 rounded-lg flex items-center justify-center font-semibold"
				onClick={generateDynamicCourse}
				disabled={isGenerating}
			>
				Generieren
			</button>
		</div>
	);
}

function GeneratingCourseDialog({
	onClose,
	generationId,
	onComplete
}: {
	onClose: OnDialogCloseFn<string>;
	generationId: string | null;
	onComplete: () => void;
}) {
	const { event, isConnected, error } = useCourseGenerationSSE(generationId);
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		if (event?.type === "result") {
			setIsComplete(true);
			onComplete();
		}
	}, [event, onComplete]);

	return (
		<Dialog title="Kurspfad wird erstellt" onClose={onClose} style={{ minWidth: 480 }}>
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
							Dein individueller Kurspfad wird generiert...
						</p>
						<p className="text-center text-sm text-light mt-2">
							KI erstellt deinen personalisierten Lerninhalt. Dies kann einen Moment
							dauern.
						</p>
						{!isConnected && !error && (
							<p className="text-center text-sm text-light mt-2">
								Verbinde mit Server...
							</p>
						)}
						{error && <p className="text-center text-sm text-red-500 mt-2">{error}</p>}
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
							Dein Kurspfad wurde erfolgreich erstellt!
						</p>
						<p className="text-center text-sm text-light mt-2">
							Klicke auf Schließen, um mit dem Kurs zu beginnen.
						</p>
						<button
							className="btn-primary mt-6 px-8 py-2"
							onClick={() => onClose(ButtonActions.OK)}
						>
							Schließen
						</button>
					</>
				)}
			</div>
		</Dialog>
	);
}
