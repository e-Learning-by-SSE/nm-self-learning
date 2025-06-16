import { CheckCircleIcon, PencilIcon, PlayIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import {
	SmallGradeBadge,
	useCourseCompletion,
	useMarkAsCompleted
} from "@self-learning/completion";
import {
	ChapterName,
	LessonLayoutProps,
	loadLessonSessionSafe,
	StandaloneLessonLayoutProps,
	useLessonSession
} from "@self-learning/lesson";
import { loadFromLocalStorage, saveToLocalStorage } from "@self-learning/local-storage";
import { CompiledMarkdown } from "@self-learning/markdown";
import {
	findContentType,
	getContentTypeDisplayName,
	includesMediaType,
	LessonContent,
	LessonMeta
} from "@self-learning/types";
import { AuthorsList, LicenseChip, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { MarkdownContainer, useRequiredSession } from "@self-learning/ui/layouts";
import { PdfViewer, VideoPlayer } from "@self-learning/ui/lesson";
import { useEventLog } from "@self-learning/util/eventlog";
import { useAttemptSubmission } from "libs/feature/quiz/src/lib/quiz-submit-attempt"; // TODO
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { LessonCourseData, LessonData } from "../lesson-data-access";
import { createLessonPropsFrom } from "./create-lesson-props";
import { database } from "@self-learning/database";
import { Session } from "next-auth";

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

export function LessonLearnersView({ lesson, course, markdown }: LessonLearnersViewProps) {
	const [showDialog, setShowDialog] = useState(lesson.lessonType === LessonType.SELF_REGULATED);

	const { content: video } = findContentType("video", lesson.content as LessonContent);
	const { content: pdf } = findContentType("pdf", lesson.content as LessonContent);

	const preferredMediaType = usePreferredMediaType(lesson);

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
			{preferredMediaType === "video" && (
				<div className="aspect-video w-full xl:max-h-[75vh]">
					{video?.value.url ? (
						<VideoPlayer
							parentLessonId={lesson.lessonId}
							url={video.value.url}
							courseId={course?.courseId}
						/>
					) : (
						<div className="py-16 text-center text-red-500">Error: Missing URL</div>
					)}
				</div>
			)}

			<LessonHeader
				lesson={lesson}
				course={course}
				mdDescription={markdown.description}
				mdSubtitle={markdown.subtitle}
			/>

			{preferredMediaType === "article" && markdown.article && (
				<MarkdownContainer className="mx-auto w-full pt-4">
					<MDXRemote {...markdown.article} />
				</MarkdownContainer>
			)}

			{preferredMediaType === "pdf" && pdf?.value.url && (
				<div className="h-[90vh] xl:h-[80vh]">
					<PdfViewer url={pdf.value.url} />
				</div>
			)}
		</article>
	);
}

function usePreferredMediaType(lesson: LessonLearnersViewProps["lesson"]) {
	// Handle situations that content creator may created an empty lesson (to add content later)
	const content = lesson.content as LessonContent;
	const router = useRouter();

	let preferredMediaType = content.length > 0 ? content[0].type : "video";

	if (content.length > 0) {
		const availableMediaTypes = content.map(c => c.type);

		const { type: typeFromRoute } = router.query;
		const typeFromStorage = loadFromLocalStorage("user_preferredMediaType");

		const { isIncluded, type } = includesMediaType(
			availableMediaTypes,
			(typeFromRoute as string) ?? typeFromStorage
		);

		if (isIncluded) {
			preferredMediaType = type;
		}
	}
	return preferredMediaType;
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
							<div className="font-semibold text-secondary min-h-[24px]">
								{!isStandalone && <ChapterName course={course} lesson={lesson} />}
							</div>
							<h1 className="text-4xl">{lesson.title}</h1>
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
										score={lesson.performanceScore}
										sizeClassName="px-4 py-2"
									/>
								) : (
									<span className="text-gray-500 text-sm">Keine</span>
								)}
							</div>
						)}
					</div>
					{!isStandalone && (
						<div className="pt-4">
							<MediaTypeSelector lesson={lesson} course={course} />
						</div>
					)}
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
	const url = "courses/" + course.slug + "/" + lesson.slug;
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
			{hasQuiz && <LinkToQuiz url={url} />}

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

function MediaTypeSelector({
	lesson,
	course
}: {
	course?: LessonLearnersViewProps["course"];
	lesson: LessonLearnersViewProps["lesson"];
}) {
	const lessonContent = lesson.content as LessonContent;
	// If no content is specified at this time, use video as default (and don't s´display anything)
	const preferredMediaType = usePreferredMediaType(lesson);
	const { index } = findContentType(preferredMediaType, lessonContent);
	const [selectedIndex, setSelectedIndex] = useState(index);
	const router = useRouter();

	function changeMediaType(index: number) {
		const type = lessonContent[index].type;
		saveToLocalStorage("user_preferredMediaType", type);

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
		lessonContent.length > 1 && (
			<Tabs selectedIndex={selectedIndex} onChange={changeMediaType}>
				{lessonContent.map((content, idx) => (
					<Tab key={idx}>
						<span data-testid="mediaTypeTab">
							{getContentTypeDisplayName(content.type)}
						</span>
					</Tab>
				))}
			</Tabs>
		)
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

	const handleSubmit = () => {
		setShowDialog(false);
		showToast({
			title: "Super!",
			subtitle:
				"Vorhandenes Wissen im Vorfeld noch einmal zu aktivieren, fördert den Lernerfolg!",
			type: "info"
		});
	};

	const handleSkipQuestion = () => {
		setShowDialog(false);
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
						disabled={userAnswer.length == 0}
					>
						Zur Lerneinheit
					</button>
				)}
			</div>
		</div>
	);
}
