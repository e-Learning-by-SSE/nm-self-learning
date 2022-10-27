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
	includesMediaType,
	LessonContent,
	LessonMeta
} from "@self-learning/types";
import { Tab, Tabs } from "@self-learning/ui/common";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { VideoPlayer } from "@self-learning/ui/lesson";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export type LessonProps = LessonLayoutProps & {
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
	};
};

export const getStaticProps: GetStaticProps<LessonProps> = async ({ params }) => {
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

export const getStaticPaths: GetStaticPaths = () => {
	return {
		fallback: "blocking",
		paths: []
	};
};

function usePreferredMediaType(lesson: LessonProps["lesson"]) {
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
}

export default function Lesson({ lesson, course, markdown }: LessonProps) {
	const { content: video } = findContentType("video", lesson.content as LessonContent);
	const url = video?.value.url;
	const preferredMediaType = usePreferredMediaType(lesson);

	return (
		<article className="flex w-full flex-col gap-4 px-4 pt-8 pb-16 xl:w-[1212px] xl:px-8">
			{preferredMediaType === "video" && (
				<div className="aspect-video w-full xl:max-h-[75vh]">
					{url ? (
						<VideoPlayer url={url} />
					) : (
						<div className="py-16 text-center text-red-500">Error: Missing URL</div>
					)}
				</div>
			)}

			<LessonHeader lesson={lesson} course={course} mdDescription={markdown.description} />

			{preferredMediaType === "article" && markdown.article && (
				<MarkdownContainer className="mx-auto w-full pt-8">
					<MDXRemote {...markdown.article} />
				</MarkdownContainer>
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

					<Authors authors={lesson.authors} />

					<div className="pt-4">
						<MediaTypeSelector lesson={lesson} course={course} />
					</div>
				</div>
			</div>

			{mdDescription && (
				<MarkdownContainer className="mx-auto">
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
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId);
	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = !!completion?.completedLessons[lesson.lessonId];
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			{hasQuiz && (
				<Link href={`/courses/${course.slug}/${lesson.slug}/quiz`}>
					<a
						className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
						data-testid="quizLink"
					>
						<span>Zur Lernkontrolle</span>
						<PlayIcon className="h-6 shrink-0" />
					</a>
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
				<div className="mt-4 flex flex-wrap gap-4">
					{authors.map(author => (
						<Link href={`/authors/${author.slug}`} key={author.slug}>
							<a>
								<div
									className="flex w-full items-center rounded-lg border border-light-border sm:w-fit"
									key={author.slug}
								>
									<div className="relative h-12 w-12">
										{author.imgUrl && (
											<Image
												src={author.imgUrl}
												alt=""
												layout="fill"
												objectFit="cover"
											></Image>
										)}
									</div>
									<span className="p-4 text-sm font-medium">
										{author.displayName}
									</span>
								</div>
							</a>
						</Link>
					))}
				</div>
			)}
		</>
	);
}

function MediaTypeSelector({
	lesson,
	course
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const lessonContent = lesson.content as LessonContent;
	const preferredMediaType = usePreferredMediaType(lesson);
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

	return (
		<>
			{lessonContent.length > 1 && (
				<Tabs selectedIndex={selectedIndex} onChange={changeMediaType}>
					{lessonContent.map((content, idx) => (
						<Tab key={idx}>
							<span data-testid="mediaTypeTab">{content.type}</span>
						</Tab>
					))}
				</Tabs>
			)}
		</>
	);
}
