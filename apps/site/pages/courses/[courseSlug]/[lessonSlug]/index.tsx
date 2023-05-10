import { CheckCircleIcon, PlayIcon } from "@heroicons/react/solid";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLayoutProps,
	useLessonContext
} from "@self-learning/lesson";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	findContentType,
	getContentTypeDisplayName,
	includesMediaType,
	LessonContent,
	LessonMeta
} from "@self-learning/types";
import { AuthorsList, LicenseChip, Tab, Tabs } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { PdfViewer, VideoPlayer } from "@self-learning/ui/lesson";
import { GetServerSideProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export type LessonProps = LessonLayoutProps & {
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
	};
};

export const getServerSideProps: GetServerSideProps<LessonProps> = async ({ params }) => {
	const props = await getStaticPropsForLayout(params);

	if ("notFound" in props) return { notFound: true };

	const { lesson } = props;

	lesson.quiz = null; // Not needed on this page, but on /quiz
	let mdDescription = null;
	let mdArticle = null;

	if (lesson.description) {
		mdDescription = await compileMarkdown(lesson.description);
	}

	const { content: article } = findContentType("article", lesson.content as LessonContent);

	if (article) {
		mdArticle = await compileMarkdown(article.value.content ?? "Kein Inhalt.");

		// Remove article content to avoid duplication
		article.value.content = "(replaced)";
	}

	return {
		props: {
			...props,
			markdown: {
				article: mdArticle,
				description: mdDescription
			}
		}
	};
};

function usePreferredMediaType(lesson: LessonProps["lesson"]) {
	// Handle situations that content creator may created an empty lesson (to add content later)
	const content = lesson.content as LessonContent;
	if (content.length > 0) {
		const router = useRouter();
		const [preferredMediaType, setPreferredMediaType] = useState(
			(lesson.content as LessonContent)[0].type
		);

		useEffect(() => {
			const availableMediaTypes = (lesson.content as LessonContent).map(c => c.type);

			const { type: typeFromRoute } = router.query;
			let typeFromStorage: string | null = null;

			if (typeof window !== "undefined") {
				typeFromStorage = window.localStorage.getItem("preferredMediaType");
			}

			const { isIncluded, type } = includesMediaType(
				availableMediaTypes,
				(typeFromRoute as string) ?? typeFromStorage
			);

			if (isIncluded) {
				setPreferredMediaType(type);
			}
		}, [router, lesson]);

		return preferredMediaType;
	} else {
		return null;
	}
}

export default function Lesson({ lesson, course, markdown }: LessonProps) {
	console.log("Lesson", lesson);
	console.log("Course", course);

	const { content: video } = findContentType("video", lesson.content as LessonContent);
	const { content: pdf } = findContentType("pdf", lesson.content as LessonContent);

	const preferredMediaType = usePreferredMediaType(lesson);

	return (
		<article className="flex flex-col gap-4">
			{preferredMediaType === "video" && (
				<div className="aspect-video w-full xl:max-h-[75vh]">
					{video?.value.url ? (
						<VideoPlayer url={video.value.url} />
					) : (
						<div className="py-16 text-center text-red-500">Error: Missing URL</div>
					)}
				</div>
			)}

			<LessonHeader lesson={lesson} course={course} mdDescription={markdown.description} />

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

Lesson.getLayout = LessonLayout;

function LessonHeader({
	course,
	lesson,
	mdDescription
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	mdDescription?: CompiledMarkdown | null;
}) {
	const { chapterName } = useLessonContext(lesson.lessonId, course.slug);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-wrap justify-between gap-4">
				<div className="flex w-full flex-col">
					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-2">
							<span className="font-semibold text-secondary">{chapterName}</span>
							<h1 className="text-4xl">{lesson.title}</h1>
						</span>
						<LessonControls course={course} lesson={lesson} />
					</span>
					{lesson.subtitle && lesson.subtitle.length > 0 && (
						<span className="mt-2 text-light">{lesson.subtitle}</span>
					)}

					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-3">
							<Authors authors={lesson.authors} />
						</span>
						<LicenseLabel license={lesson.license} />
					</span>

					<div className="pt-4">
						<MediaTypeSelector lesson={lesson} course={course} />
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

function LessonControls({
	course,
	lesson
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, course.slug);
	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = !!completion?.completedLessons[lesson.lessonId];
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			{hasQuiz && (
				<Link
					href={`/courses/${course.slug}/${lesson.slug}/quiz`}
					className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
					data-testid="quizLink"
				>
					<span>Zur Lernkontrolle</span>
					<PlayIcon className="h-6 shrink-0" />
				</Link>
			)}

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

export function LicenseLabel({ license }: { license: LessonProps["lesson"]["license"] }) {
	let logoUrl = license.logoUrl;
	if (logoUrl) {
		// Check if logo should be loaded relative to the current page or if an absolute path is provided
		logoUrl = logoUrl.startsWith("/") ? `${process.env.NEXT_ASSET_PREFIX}${logoUrl}` : logoUrl;
	}

	if (license.url) {
		return (
			<div className="-mt-3">
				<LabeledField label="Lizenz">
					<LicenseChip name={license.name} imgUrl={logoUrl} url={license.url} />
				</LabeledField>
			</div>
		);
	} else {
		return (
			<div className="-mt-3">
				<LabeledField label="Lizenz">
					<LicenseChip
						name={license.name}
						imgUrl={license.logoUrl}
						description={license.licenseText !== null ? license.licenseText : undefined}
					/>
				</LabeledField>
			</div>
		);
	}
}

function MediaTypeSelector({
	lesson,
	course
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const lessonContent = lesson.content as LessonContent;
	// If no content is specified at this time, use video as default (and don't s´display anything)
	const preferredMediaType = usePreferredMediaType(lesson) ?? "video";
	const { index } = findContentType(preferredMediaType, lessonContent);
	const [selectedIndex, setSelectedIndex] = useState(index);
	const router = useRouter();

	function changeMediaType(index: number) {
		const type = lessonContent[index].type;

		window.localStorage.setItem("preferredMediaType", type);

		router.push(`/courses/${course.slug}/${lesson.slug}?type=${type}`, undefined, {
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
