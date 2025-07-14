import { CheckCircleIcon, PencilIcon, PlayIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import { getCourse, useLessonContext } from "@self-learning/lesson";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	Article,
	getContentTypeDisplayName,
	LessonContent,
	LessonMeta,
	ResolvedValue
} from "@self-learning/types";
import { AuthorsList, LicenseChip, Tab, Tabs } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import {
	DraggableContentSelector,
	MarkdownContainer,
	useRequiredSession
} from "@self-learning/ui/layouts";
import { PdfViewer, VideoPlayer } from "@self-learning/ui/lesson";
import { useEventLog } from "@self-learning/util/common";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LessonData } from "./lesson-data-access";

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
export function LessonLearnersView({ lesson, course, markdown }: LessonProps) {
	const [showDialog, setShowDialog] = useState(lesson.lessonType === LessonType.SELF_REGULATED);

	const content = lesson.content as LessonContent;

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

	if (showDialog && markdown.preQuestion) {
		return (
			<article className="flex flex-col gap-4">
				<SelfRegulatedPreQuestion
					setShowDialog={setShowDialog}
					question={markdown.preQuestion}
				/>
			</article>
		);
	}

	return (
		<article className="flex flex-col gap-4">
			<LessonHeader
				lesson={lesson}
				course={course}
				mdDescription={markdown.description}
				mdSubtitle={markdown.subtitle}
			/>

			{course && <MediaTypeSelector lesson={lesson} course={course} />}

			{content.map(c => {
				console.log(`content type ${c.type}`);
				switch (c.type) {
					case "video":
						if (!c.value.url) return <ContentError text="missing video URL" />;
						return (
							<div className="aspect-video w-full xl:max-h-[75vh]">
								<VideoPlayer
									parentLessonId={lesson.lessonId}
									url={c.value.url}
									courseId={course?.courseId}
								/>
							</div>
						);
					case "article":
						return <LessonArticle article={c} />;
					case "pdf":
						if (!c.value.url) return <ContentError text="missing PDF URL" />;
						return (
							<div className="h-[90vh] xl:h-[80vh]">
								<PdfViewer url={c.value.url} />
							</div>
						);
					default:
						return <ContentError text={`unsupported content type: ${c.type}`} />;
				}
			})}
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

	if (!article.value) return <ContentError text="missing article text" />;
	if (!markdown) return <ContentLoader />;

	return (
		<MarkdownContainer className="mx-auto w-full pt-4">
			<MDXRemote {...markdown} />
		</MarkdownContainer>
	);
}

function ContentError({ text }: { text: string }) {
	return <div className="py-16 text-center text-red-500">Error: {text}</div>;
}
function ContentLoader() {
	return <div className="py-16 text-center">Loading...</div>;
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
	course: Exclude<LessonProps["course"], null | undefined>;
	lesson: LessonProps["lesson"];
}) {
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, course.slug);
	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = !!completion?.completedLessons[lesson.lessonId];
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;
	const url = "courses/" + course.slug + "/" + lesson.slug;

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			<AuthorEditButton lesson={lesson} />
			{hasQuiz && <LinkToQuiz url={url} />}

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
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;
	const url = "lessons/" + lesson.slug;
	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			<AuthorEditButton lesson={lesson} />
			{hasQuiz && <LinkToQuiz url={url} />}
		</div>
	);
}

function LinkToQuiz({ url }: { url: string }) {
	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
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

function MediaTypeSelector({
	lesson,
	course
}: {
	course?: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const lessonContent = lesson.content as LessonContent;
	// If no content is specified at this time, use video as default (and don't s´display anything)
	const index = 0; // TODO
	const [selectedIndex, setSelectedIndex] = useState(index);
	const router = useRouter();

	function changeMediaType(index: number) {
		const type = lessonContent[index].type;

		let url = `/lessons/${lesson.slug}?type=${type}`;

		if (course) {
			url = `/courses/${course.slug}/${lesson.slug}?type=${type}`;
		}

		router.push(url, undefined, {
			shallow: true
		});

		setSelectedIndex(index);
	}

	useEffect(() => {
		if (selectedIndex !== index) {
			setSelectedIndex(index);
		}
	}, [index, selectedIndex, setSelectedIndex]);

	return (
		<>
			{lessonContent.length > 1 && (
				<Tabs selectedIndex={selectedIndex} onChange={changeMediaType}>
					{lessonContent.map((content, idx) => (
						<Tab key={idx}>
							<span data-testid="mediaTypeTab">
								{getContentTypeDisplayName(content.type)}
							</span>
						</Tab>
					))}
				</Tabs>
			)}
		</>
	);
}

function SelfRegulatedPreQuestion({
	question,
	setShowDialog
}: {
	question: CompiledMarkdown;
	setShowDialog: Dispatch<SetStateAction<boolean>>;
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
					onClick={() => {
						setShowDialog(false);
					}}
					disabled={userAnswer.length == 0}
				>
					Antwort Speichern
				</button>
			</div>
		</div>
	);
}
