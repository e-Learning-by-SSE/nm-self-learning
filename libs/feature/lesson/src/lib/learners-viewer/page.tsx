import { Button } from "@headlessui/react";
import {
	CheckCircleIcon,
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	DocumentIcon,
	PencilIcon,
	PlayIcon
} from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import {
	SmallGradeBadge,
	useCourseCompletion,
	useMarkAsCompleted
} from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	Article,
	CourseContent,
	getContentTypeDisplayName,
	LessonContent,
	LessonContentType,
	LessonMeta
} from "@self-learning/types";
import {
	AuthorsList,
	LicenseChip,
	SectionCard,
	showToast,
	Tab,
	Tabs
} from "@self-learning/ui/common";
import {
	MarkdownContainer,
	NavigableContentViewer,
	useNavigableContent,
	useRequiredSession
} from "@self-learning/ui/layouts";
import { PdfViewer, VideoPlayer } from "@self-learning/ui/lesson";
import { useEventLog } from "@self-learning/util/eventlog";
import { useAttemptSubmission } from "libs/feature/quiz/src/lib/quiz-submit-attempt";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChapterName } from "../chapter-name";
import { loadLessonSessionSafe } from "../learning-time/time-tracker";
import { useLessonSession } from "../learning-time/use-lesson-time-tracking";
import { LessonCourseData, LessonData } from "../lesson-data-access";
import { useLessonOutlineContext } from "../lesson-outline-context";
import { LessonLayoutProps } from "./course-lesson-layout";
import { createLessonPropsFrom } from "./create-lesson-props";
import { StandaloneLessonLayoutProps } from "./standalone-lesson-layout";

export type LessonLearnersViewProps = {
	lesson: LessonData & { performanceScore?: number | null };
	course?: LessonCourseData;
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
		preQuestion: CompiledMarkdown | null;
		subtitle: CompiledMarkdown | null;
	};
};

export async function getSspLearnersView(
	parentProps: LessonLayoutProps | StandaloneLessonLayoutProps,
	user: Session["user"]
) {
	const { lesson } = parentProps;
	lesson.quiz = null;
	const lessonProps = await createLessonPropsFrom(lesson);

	const data = await database.completedLesson.findMany({
		where: {
			lessonId: lesson.lessonId,
			user: {
				username: user.name
			}
		},
		select: {
			performanceScore: true
		},
		orderBy: { performanceScore: "desc" },
		take: 1 // Nur den höchsten Score nehmen
	});

	const lessonWithScore = { ...lesson, performanceScore: data[0]?.performanceScore ?? null };

	return {
		props: {
			...parentProps,
			lesson: lessonWithScore,
			// course: parentProps.course ?? undefined,
			markdown: {
				...lessonProps
			}
		}
	};
}

// id is required by Navigable. Content id is required to map this to lesson.content pos
type OpenedMediaInfo = LessonContentType & { id: number; content_id: number };
//
type LessonInfo = { lessonId: string; slug: string; title: string; meta: LessonMeta };
type LessonNavigationItem = { slug: string; lessonId: string };
type LessonNavigationData = LessonNavigationItem[];

function ContentDisplayItem({
	item: c,
	index,
	lesson,
	course,
	addMediaDisplay
}: {
	item?: LessonContentType;
	index?: number;
	lesson: LessonLearnersViewProps["lesson"];
	course: LessonLearnersViewProps["course"];
	addMediaDisplay: (idx: number) => void;
}) {
	if (!c || index === undefined) {
		return <ContentInfo text="Diese Lerneinheit hat keinen Inhalt." />;
	}
	switch (c.type) {
		case "article":
			return (
				<div className="flex">
					<div className="flex flex-wrap items-start">
						<LessonArticle article={c} />
					</div>
				</div>
			);
		case "video":
			if (!c.value.url) return <ContentInfo error text="Fehlende Video-URL." />;
			return (
				<div className="aspect-video w-full xl:max-h-[75vh]">
					<VideoPlayer
						parentLessonId={lesson.lessonId}
						url={c.value.url}
						courseId={course?.courseId}
					/>
				</div>
			);
		case "pdf":
			if (!c.value.url) return <ContentInfo error text="missing PDF URL" />;
			return (
				<div className="flex items-center">
					<Button onClick={() => addMediaDisplay(index)} className="btn-secondary">
						<DocumentIcon className="h-6 w-6 text-primary" />
						PDF öffnen
					</Button>
				</div>
			);
		default:
			return <ContentInfo error text={`unsupported content type: ${c?.type}`} />;
	}
}

function MediaDisplayHelper({ currentMedia }: { currentMedia: OpenedMediaInfo }) {
	switch (currentMedia?.type) {
		case "pdf":
			if (!currentMedia.value.url) return <ContentInfo error text="missing PDF URL" />;
			return (
				<div className="h-[90vh] xl:h-[80vh]">
					<PdfViewer url={currentMedia.value.url} />
				</div>
			);
		default:
			return <ContentInfo error text={`unsupported content type: ${currentMedia?.type}`} />;
	}
}

function MediaDisplay({
	lesson,
	course,
	selectedIndex,
	openedMedia,
	addMediaDisplay
}: {
	lesson: LessonLearnersViewProps["lesson"];
	course: LessonLearnersViewProps["course"];
	selectedIndex?: number;
	openedMedia: OpenedMediaInfo[];
	addMediaDisplay: (idx: number) => void;
}) {
	const outline = useLessonOutlineContext();

	// If suppressed -> just follow user click
	const tabUpdateSuppressRef = useRef<boolean>(false);

	// The way to make it target the same pdf that was last selected in a tab
	useEffect(() => {
		// if last tab was a PDF and no other Tab was selected -> go to that PDF
		if (!tabUpdateSuppressRef.current && selectedIndex !== undefined) {
			const idx = openedMedia[selectedIndex].content_id;
			outline?.setActiveIndex(idx); // highlight it
			outline?.setTargetIndex(idx); // make it jump
		} else {
			tabUpdateSuppressRef.current = false;
		}
	}, [selectedIndex, openedMedia, outline]);

	return (
		<>
			{/* Display base content */}
			{selectedIndex === undefined && outline && (
				<NavigableContentViewer
					content={outline.content}
					setActiveIndex={outline.setActiveIndex}
					targetIndex={outline.targetIndex}
					resetTargetIndex={() => outline.setTargetIndex(undefined)}
					RenderContent={ContentDisplayItem}
					renderProps={{ addMediaDisplay, lesson, course }}
					gap={8}
				/>
			)}
			{selectedIndex !== undefined && (
				<MediaDisplayHelper currentMedia={openedMedia[selectedIndex]} />
			)}
		</>
	);
}

function extractNavigationInfo(
	courseContent: CourseContent,
	lessons: { [lessonId: string]: LessonInfo }
): LessonNavigationData {
	const tmp = courseContent.map(chapter => ({
		content: chapter.content.map(lesson => {
			const lessonInfo = lessons[lesson.lessonId] ?? {
				slug: undefined,
				lessonId: undefined
			};
			return lessonInfo;
		})
	}));
	return tmp.flatMap(chapter => chapter.content);
}

export function LessonLearnersView({ lesson, course, markdown }: LessonLearnersViewProps) {
	/**
	 * Using router and modal state to simulate 2 different URLs for back/forward navigation.
	 * Alternative: Create 2 separate pages for the lesson and the self regulated question.
	 */
	const router = useRouter();
	const path = usePathname();
	const searchParams = useSearchParams();
	const modalOpened = searchParams.get("modal");
	const [showDialog, setShowDialog] = useState(
		lesson.lessonType === LessonType.SELF_REGULATED && modalOpened !== "closed"
	);

	useEffect(() => {
		if (lesson.lessonType === LessonType.SELF_REGULATED) {
			if (!router.isReady) return;

			if (modalOpened === "closed") {
				setShowDialog(false);
			}
			if (modalOpened === null) {
				// Probably the first time the page is loaded, so we open the dialog
				router.replace({ pathname: path, query: { modal: "open" } }, undefined, {
					shallow: true
				});
			}
			if (modalOpened === "open") {
				// Probably on back navigation, ensure dialog is open (and not closed by previous action)
				setShowDialog(true);
			}
		}
	}, [lesson.lessonType, modalOpened, router, path]);

	const { data: temp } = course
		? trpc.course.getContent.useQuery({ slug: course.slug })
		: { data: undefined };
	const courseContent = useMemo(
		() => (!temp ? [] : extractNavigationInfo(temp.content, temp.lessonMap)),
		[temp]
	);
	const lessonContent = lesson.content as LessonContent;
	const INITIAL_PDF: OpenedMediaInfo[] = useMemo(
		() =>
			lessonContent
				.map((m, idx) => ({
					...m,
					content_id: idx
				}))
				.filter(m => m.type === "pdf") as OpenedMediaInfo[],
		[lessonContent]
	);
	const openedMedia = useNavigableContent(INITIAL_PDF, false, false);
	const addMediaDisplay = (idx: number) => {
		const existingIndex = openedMedia.content.findIndex(m => m.content_id === idx);
		openedMedia.setActiveIndex(existingIndex);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		router.push({ pathname: path, query: { modal: "closed" } }, undefined, {
			shallow: true
		});
	};

	if (showDialog && markdown.preQuestion) {
		return (
			<article className="flex flex-col gap-4">
				<SelfRegulatedPreQuestion
					onClose={handleCloseDialog}
					question={markdown.preQuestion}
				/>
			</article>
		);
	}

	return (
		<article className="flex flex-col gap-4 h-full">
			<LessonHeader
				lesson={lesson}
				course={course}
				mdDescription={markdown.description}
				mdSubtitle={markdown.subtitle}
			/>

			{/* TODO can be replaced with NavigableContentSelector, make Inhalt default and immutable */}
			<MediaSelector
				lesson={lesson}
				course={course}
				selectedIndex={openedMedia.activeIndex}
				setSelectedIndex={openedMedia.setActiveIndex}
				openedMedia={openedMedia.content}
			/>
			<MediaDisplay
				addMediaDisplay={addMediaDisplay}
				openedMedia={openedMedia.content}
				selectedIndex={openedMedia.activeIndex}
				lesson={lesson}
				course={course}
			/>

			<LessonNavigation content={courseContent} lesson={lesson} course={course} />
		</article>
	);
}

function LessonArticle({ article }: { article: Article }) {
	const [markdown, setMarkdown] = useState<CompiledMarkdown | null>(null);
	useEffect(() => {
		if (article.type === "article" && article.value) {
			compileMarkdown(article.value.content).then(setMarkdown);
		}
	}, [article]);

	if (!article.value) return <ContentInfo error text="missing article text" />;
	if (!markdown) return <ContentLoader />;

	return (
		<MarkdownContainer className="mx-auto w-full pt-4">
			<MDXRemote {...markdown} />
		</MarkdownContainer>
	);
}

function ContentInfo({ text, error }: { text: string; error?: boolean }) {
	return (
		<SectionCard>
			<span className={`text-light text-center ${error && "text-red-500"}`}>
				{error && "Error: "}
				{text}
			</span>
		</SectionCard>
	);
}
function ContentLoader() {
	return <div className="py-16 text-center">Loading...</div>;
}

function LessonNavigation({
	content,
	lesson,
	course
}: {
	content: LessonNavigationData;
	lesson: LessonLearnersViewProps["lesson"];
	course: LessonLearnersViewProps["course"];
}) {
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;
	const urlToQuiz = course && lesson ? "courses/" + course.slug + "/" + lesson.slug : "";

	const router = useRouter();
	const { previous, next } = useMemo(() => {
		const lessonIndex = content.findIndex(l => l.lessonId === lesson.lessonId);

		return {
			previous: lessonIndex > 0 ? content[lessonIndex - 1] : null,
			next: lessonIndex < content.length - 1 ? content[lessonIndex + 1] : null
		};
	}, [content, lesson]);

	function navigateToLesson(lesson: LessonNavigationItem) {
		if (course) {
			router.push(`/courses/${course.slug}/${lesson.slug}`);
		}
	}

	if (!course) {
		return <span></span>;
	}

	return (
		<span className="flex gap-2 justify-between mt-auto pt-4">
			<button
				onClick={() => previous && navigateToLesson(previous)}
				disabled={!previous}
				className="rounded-lg bg-white hidden lg:flex items-center gap-4 border border-light-border px-4 py-2 disabled:text-gray-300"
				title="Vorherige Lerneinheit"
				data-testid="previousLessonButton"
			>
				<ChevronDoubleLeftIcon className="h-5" />
				Vorherige Lerneinheit
			</button>
			{hasQuiz && urlToQuiz && <LinkToQuiz url={urlToQuiz} />}
			<button
				onClick={() => next && navigateToLesson(next)}
				disabled={!next}
				className="rounded-lg bg-white hidden lg:flex items-center gap-4 border border-light-border px-4 py-2 disabled:text-gray-300"
				title="Nächste Lerneinheit"
				data-testid="nextLessonButton"
			>
				Nächste Lerneinheit
				<ChevronDoubleRightIcon className="h-5" />
			</button>
		</span>
	);
}

function LessonHeader({
	course,
	lesson,
	mdDescription,
	mdSubtitle
}: {
	course: LessonLearnersViewProps["course"];
	lesson: LessonLearnersViewProps["lesson"];
	mdDescription?: CompiledMarkdown | null;
	mdSubtitle?: CompiledMarkdown | null;
}) {
	const isStandalone = !course;

	const session = useRequiredSession();
	const isExperimentParticipant = session.data?.user.featureFlags.experimental ?? false;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-wrap justify-between gap-4">
				<div className="flex w-full flex-col">
					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-2">
							<h1 className="text-4xl">{lesson.title}</h1>
							<div className="font-semibold text-secondary min-h-[24px]">
								{!isStandalone && <ChapterName course={course} lesson={lesson} />}
							</div>
						</span>

						{isStandalone ? (
							<StandaloneLessonControls lesson={lesson} />
						) : (
							<LessonControls course={course} lesson={lesson} />
						)}
					</span>
					{mdSubtitle && (
						<MarkdownContainer className="mt-2 text-light">
							<MDXRemote {...mdSubtitle} />
						</MarkdownContainer>
					)}
					<div className="flex flex-wrap justify-between gap-4 items-end mt-2">
						<div className="flex flex-col xl:flex-row xl:items-end xl:gap-6">
							<span>
								<Authors authors={lesson.authors} />
							</span>
							<div className="mt-2 xl:mt-0">
								{!lesson.license ? (
									<DefaultLicenseLabel />
								) : (
									<LicenseChip
										name={lesson.license.name}
										imgUrl={lesson.license.logoUrl ?? undefined}
										description={lesson.license.licenseText ?? undefined}
										url={lesson.license.url ?? undefined}
									/>
								)}
							</div>
						</div>
						{isExperimentParticipant && (
							<div className="flex flex-col items-center">
								<span className="mb-1 text-xs text-gray-500 text-center font-semibold">
									Bisherige Bewertung
								</span>
								{lesson.performanceScore ? (
									<SmallGradeBadge
										rating={lesson.performanceScore}
										sizeClassName="px-4 py-2"
									/>
								) : (
									<span className="text-gray-500 text-sm">Keine</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{mdDescription && (
				<MarkdownContainer className="mx-auto pb-4">
					<MDXRemote {...mdDescription} />
				</MarkdownContainer>
			)}
		</div>
	);
}

function AuthorEditButton({ lesson }: { lesson: LessonLearnersViewProps["lesson"] }) {
	const session = useRequiredSession();

	if (session.data?.user.isAuthor || session.data?.user.role === "ADMIN") {
		return (
			<Link
				href={`/teaching/lessons/edit/${lesson.lessonId}`}
				className="btn-stroked h-fit xl:w-fit"
			>
				<PencilIcon className="h-6" />
			</Link>
		);
	}

	return null;
}

function LessonControls({
	course,
	lesson
}: {
	course: Exclude<LessonLearnersViewProps["course"], null | undefined>;
	lesson: LessonLearnersViewProps["lesson"];
}) {
	const { lessonId } = lesson;
	const { courseId } = course;
	const markAsCompleted = useMarkAsCompleted();
	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = !!completion?.completedLessons[lesson.lessonId];
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;
	const { newEvent } = useEventLog();
	const { logAttemptSubmit, logStartAttempt } = useAttemptSubmission({ lessonId, courseId });
	const { lessonAttemptId } = useLessonSession({ lessonId });

	logStartAttempt();

	useEffect(() => {
		if (!lessonAttemptId) return;
		newEvent({
			type: "LESSON_OPEN",
			resourceId: lesson.lessonId,
			courseId: course.courseId,
			payload: { lessonAttemptId }
		});
	}, [newEvent, lesson.lessonId, course.courseId, lessonAttemptId, logStartAttempt]);

	const handleLessonExit = useCallback(async () => {
		if (!lessonAttemptId) return;
		await newEvent({
			type: "LESSON_EXIT",
			resourceId: lesson.lessonId,
			courseId: course.courseId,
			payload: {
				lessonAttemptId
			}
		});
	}, [newEvent, lesson.lessonId, course.courseId, lessonAttemptId]);

	useEffect(() => {
		const handleBeforeUnload = () => {
			void handleLessonExit();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [handleLessonExit]);

	const handleMarkCompleted = useCallback(async () => {
		const finalSession = loadLessonSessionSafe(lesson.lessonId);
		if (!finalSession) return;
		await logAttemptSubmit("completed", 1.0);

		markAsCompleted({
			lessonId: lesson.lessonId,
			courseSlug: course.slug,
			performanceScore: 1
		});
	}, [lesson.lessonId, logAttemptSubmit, markAsCompleted, course.slug]);

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			<AuthorEditButton lesson={lesson} />

			{!hasQuiz && !isCompletedLesson && (
				<button
					className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
					onClick={handleMarkCompleted}
				>
					<span>Als abgeschlossen markieren</span>
					<CheckCircleIcon className="h-6 shrink-0" />
				</button>
			)}
		</div>
	);
}

function StandaloneLessonControls({ lesson }: { lesson: LessonLearnersViewProps["lesson"] }) {
	const session = useSession();
	// TODO - separate issue -  find out am I an author? lesson provides no uid

	if (session.data?.user.role === "ADMIN" || session.data?.user.isAuthor)
		return (
			<div className="flex w-full flex-wrap gap-2 xl:w-fit flex-row">
				<AuthorEditButton lesson={lesson} />
			</div>
		);
	else return <div></div>;
}

function LinkToQuiz({ url }: { url: string }) {
	return (
		<div className="flex flex-wrap gap-2 xl:flex-row">
			<Link
				href={`/${url}/quiz`}
				className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
				data-testid="quizLink"
			>
				<span>Zur Lernkontrolle</span>
				<PlayIcon className="h-6 shrink-0" />
			</Link>
		</div>
	);
}

function DefaultLicenseLabel() {
	const { data, isLoading } = trpc.licenseRouter.getDefault.useQuery();
	const fallbackLicense = {
		name: "Keine Lizenz verfügbar",
		url: "",
		oerCompatible: false,
		logoUrl: null,
		licenseText:
			"*Für diese Lektion ist keine Lizenz verfügbar. Bei Nachfragen, wenden Sie sich an den Autor*"
	};
	if (!isLoading && !data) {
		console.log("No default license found");
	}
	if (isLoading) return null;

	const license = data ?? fallbackLicense;
	return (
		<LicenseChip
			name={license.name}
			imgUrl={license.logoUrl ?? undefined}
			description={license.licenseText ?? undefined}
			url={license.url ?? undefined}
		/>
	);
}

function Authors({ authors }: { authors: LessonLearnersViewProps["lesson"]["authors"] }) {
	return authors.length > 0 ? (
		<div className="mt-4">
			<AuthorsList authors={authors} />
		</div>
	) : null;
}

function MediaSelector({
	selectedIndex,
	setSelectedIndex,
	openedMedia
}: {
	course?: LessonLearnersViewProps["course"];
	lesson: LessonLearnersViewProps["lesson"];
	selectedIndex?: number;
	setSelectedIndex: (idx?: number) => void;
	openedMedia: OpenedMediaInfo[];
}) {
	// index transform to allow first item to be default
	const index = selectedIndex !== undefined ? selectedIndex + 1 : 0;
	// TODO can be replaced with NavigableContentSelector, make Inhalt default and immutable
	return (
		<Tabs
			selectedIndex={index}
			// index transform to allow first item to be default
			onChange={idx => {
				setSelectedIndex(idx > 0 ? idx - 1 : undefined);
			}}
		>
			<Tab key={0}>
				<span data-testid="mediaTypeTab-Base">Inhalt</span>
			</Tab>
			{openedMedia &&
				openedMedia.map((content, idx) => (
					<Tab key={idx + 1}>
						<span data-testid="mediaTypeTab">
							{getContentTypeDisplayName(content.type)}
						</span>
					</Tab>
				))}
		</Tabs>
	);
}

function SelfRegulatedPreQuestion({
	question,
	onClose
}: {
	question: CompiledMarkdown;
	onClose: () => void;
}) {
	const [userAnswer, setUserAnswer] = useState("");

	const handleSubmit = () => {
		onClose();
		showToast({
			title: "Super!",
			subtitle:
				"Vorhandenes Wissen im Vorfeld noch einmal zu aktivieren, fördert den Lernerfolg!",
			type: "info"
		});
	};

	const handleSkipQuestion = () => {
		onClose();
		showToast({
			title: "Schritt übersprungen",
			subtitle: ".",
			type: "info"
		});
	};

	return (
		<div>
			<h1>Aktivierungsfrage</h1>
			<MarkdownContainer className="w-full py-4">
				<MDXRemote {...question} />
			</MarkdownContainer>
			<div className="mt-8">
				<h2>Deine Antwort:</h2>
				<textarea
					className="w-full"
					placeholder="..."
					onChange={e => setUserAnswer(e.target.value)}
				/>
			</div>
			<div className="mt-2 flex justify-end gap-2">
				{userAnswer.length == 0 ? (
					<button type="button" className="btn-secondary" onClick={handleSkipQuestion}>
						Schritt Überspringen
					</button>
				) : (
					<button
						type="button"
						className="btn-primary"
						onClick={handleSubmit}
						disabled={userAnswer.length === 0}
					>
						Zur Lerneinheit
					</button>
				)}
			</div>
		</div>
	);
}
