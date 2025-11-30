import {
	CheckCircleIcon,
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	PencilIcon,
	PlayIcon
} from "@heroicons/react/24/solid";
import { AccessLevel, LessonType } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import { getCourse, useLessonContext, useLessonOutlineContext } from "@self-learning/lesson";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	Article,
	CourseContent,
	getContentTypeDisplayName,
	LessonContent,
	LessonContentType,
	LessonMeta,
	ResolvedValue
} from "@self-learning/types";
import { AuthorsList, LicenseChip, SectionCard, Tab, Tabs } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import {
	NavigableContentViewer,
	MarkdownContainer,
	useNavigableContent,
	ResourceGuard
} from "@self-learning/ui/layouts";
import { PdfViewer, VideoPlayer } from "@self-learning/ui/lesson";
import { useEventLog } from "@self-learning/util/common";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { LessonData } from "./lesson-data-access";
import { Button } from "@headlessui/react";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export type LessonProps = {
	lesson: LessonData;
	course?: ResolvedValue<typeof getCourse>;
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
		preQuestion: CompiledMarkdown | null;
		subtitle: CompiledMarkdown | null;
	};
};
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
	lesson: LessonProps["lesson"];
	course: LessonProps["course"];
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
	lesson: LessonProps["lesson"];
	course: LessonProps["course"];
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
			const lessonInfo = lessons[lesson.lessonId] ?? { slug: undefined, lessonId: undefined };
			return lessonInfo;
		})
	}));
	return tmp.flatMap(chapter => chapter.content);
}
export function LessonLearnersView({ lesson, course, markdown }: LessonProps) {
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

	const { newEvent } = useEventLog();
	useEffect(() => {
		// TODO check if useEffect can be removed
		newEvent({
			type: "LESSON_OPEN",
			resourceId: lesson.lessonId,
			courseId: course?.courseId,
			payload: undefined
		});
	}, [newEvent, lesson.lessonId, course?.courseId]);

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
				.map((m, idx) => ({ ...m, content_id: idx }))
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
		router.push({ pathname: path, query: { modal: "closed" } }, undefined, { shallow: true });
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
	lesson: LessonProps["lesson"];
	course: LessonProps["course"];
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
				className="rounded-lg bg-white flex items-center gap-4 border border-light-border px-4 py-2 disabled:text-gray-300"
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
				className="rounded-lg bg-white flex items-center gap-4 border border-light-border px-4 py-2 disabled:text-gray-300"
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
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	mdDescription?: CompiledMarkdown | null;
	mdSubtitle?: CompiledMarkdown | null;
}) {
	const isStandalone = !course;

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
					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-3">
							<Authors authors={lesson.authors} />
						</span>
						<div className="-mt-3">
							{!lesson.license ? (
								<DefaultLicenseLabel />
							) : (
								<LicenseLabel license={lesson.license} />
							)}
						</div>
					</span>
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

export function ChapterName({
	course,
	lesson
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const lessonContext = useLessonContext(lesson.lessonId, course?.slug ?? "");
	const chapterName = course ? lessonContext.chapterName : null;

	return <div className="font-semibold text-secondary min-h-[24px]">{chapterName}</div>;
}

function AuthorEditButton({ lesson }: { lesson: LessonProps["lesson"] }) {
	return (
		<ResourceGuard
			mode="hide"
			accessLevel={AccessLevel.EDIT}
			allowedGroups={lesson.permissions}
		>
			<Link
				href={`/teaching/lessons/edit/${lesson.lessonId}`}
				className="btn-stroked h-fit xl:w-fit"
			>
				<PencilIcon className="h-6" />
			</Link>
		</ResourceGuard>
	);
}

function LessonControls({
	course,
	lesson
}: {
	course: Exclude<LessonProps["course"], null | undefined>;
	lesson: LessonProps["lesson"];
}) {
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, course.slug);
	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = !!completion?.completedLessons[lesson.lessonId];
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			<AuthorEditButton lesson={lesson} />

			{!hasQuiz && !isCompletedLesson && (
				<button
					className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
					onClick={markAsCompleted}
				>
					<span>Als abgeschlossen markieren</span>
					<CheckCircleIcon className="h-6 shrink-0" />
				</button>
			)}
		</div>
	);
}

function StandaloneLessonControls({ lesson }: { lesson: LessonProps["lesson"] }) {
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
		logoUrl: "",
		url: "",
		oerCompatible: false,
		licenseText:
			"*Für diese Lektion ist keine Lizenz verfügbar. Bei Nachfragen, wenden Sie sich an den Autor*"
	};
	if (!isLoading && !data) {
		console.log("No default license found");
	}
	if (isLoading) return null;
	return <LicenseLabel license={data ?? fallbackLicense} />;
}

export function LicenseLabel({
	license
}: {
	license: NonNullable<LessonProps["lesson"]["license"]>;
}) {
	return (
		<LabeledField label="Lizenz">
			<LicenseChip
				name={license.name}
				imgUrl={license.logoUrl ?? undefined}
				description={license.licenseText ?? undefined}
				url={license.url ?? undefined}
			/>
		</LabeledField>
	);
}

function Authors({ authors }: { authors: LessonProps["lesson"]["authors"] }) {
	return (
		<>
			{authors.length > 0 && (
				<div className="mt-4">
					<AuthorsList authors={authors} />
				</div>
			)}
		</>
	);
}

function MediaSelector({
	selectedIndex,
	setSelectedIndex,
	openedMedia
}: {
	course?: LessonProps["course"];
	lesson: LessonProps["lesson"];
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
				<button
					type="button"
					className="btn-primary"
					onClick={onClose}
					disabled={userAnswer.length === 0}
				>
					Antwort speichern
				</button>
			</div>
		</div>
	);
}
