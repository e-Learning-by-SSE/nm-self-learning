import { CheckCircleIcon, PlayIcon } from "@heroicons/react/solid";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import { getStaticPropsForLayout, LessonLayout, LessonLayoutProps } from "@self-learning/lesson";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	findContentType,
	includesMediaType,
	LessonContent,
	LessonContentMediaType,
	LessonContentType
} from "@self-learning/types";
import { VideoPlayer } from "@self-learning/ui/lesson";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Math from "../../../../components/math";

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
		<article className="w-full max-w-[1440px] px-4 pb-24">
			{preferredMediaType === "video" && (
				<div className="aspect-video w-full rounded-lg bg-black xl:max-h-[75vh]">
					{url ? (
						<VideoPlayer url={url} />
					) : (
						<div className="py-16 text-center text-red-500">Error: Missing URL</div>
					)}
				</div>
			)}

			<LessonHeader lesson={lesson} course={course} mdDescription={markdown.description} />

			{preferredMediaType === "article" && markdown.article && (
				<div className="px-4 pb-32">
					<div className="prose mx-auto max-w-prose">
						<MDXRemote {...markdown.article} />
					</div>
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
	return (
		<div className="flex flex-col gap-8 pt-4">
			<div className="flex flex-wrap justify-between gap-4">
				<div className="flex flex-col gap-4">
					<div className="flex justify-between gap-4">
						<div className="flex flex-col gap-2">
							<h1 className="text-4xl">{lesson.title}</h1>
							{lesson.subtitle && lesson.subtitle.length > 0 && (
								<span className="text-light">{lesson.subtitle}</span>
							)}
						</div>
					</div>

					<Authors authors={lesson.authors} />
				</div>

				<LessonControls course={course} lesson={lesson} />
			</div>

			<div className="prose mx-auto max-w-[75ch]">
				<Math />
				{mdDescription && <MDXRemote {...mdDescription} />}
			</div>
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

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			<Link href={`/courses/${course.slug}/${lesson.slug}/quiz`}>
				<a className="btn-primary flex h-fit w-full flex-wrap-reverse xl:w-fit">
					<span>Zur Lernkontrolle</span>
					<PlayIcon className="h-6 shrink-0" />
				</a>
			</Link>

			{!isCompletedLesson ? (
				<button
					className="btn-stroked flex h-fit w-full flex-wrap-reverse xl:w-fit"
					onClick={markAsCompleted}
				>
					<span>Als abgeschlossen markieren</span>
					<CheckCircleIcon className="h-6 shrink-0" />
				</button>
			) : (
				<button
					className="btn-stroked flex h-fit w-full flex-wrap-reverse xl:w-fit"
					onClick={markAsCompleted}
				>
					<span>Als wiederholt markieren</span>
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
				<div className="flex flex-wrap gap-4">
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
	current,
	lesson,
	course
}: {
	current: LessonContentMediaType;
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const router = useRouter();

	function changeMediaType(type: LessonContentType["type"]) {
		window.localStorage.setItem("preferredMediaType", type);

		router.push(`/courses/${course.slug}/${lesson.slug}?type=${type}`, undefined, {
			shallow: true
		});
	}

	return (
		<>
			{(lesson.content as LessonContent).length > 1 && (
				<div className="flex flex-wrap gap-4">
					{(lesson.content as LessonContent).map(({ type }) => (
						<button
							key={type}
							className={`border-b-2 px-2 py-1 text-sm ${
								current === type
									? "border-b-secondary font-semibold text-secondary"
									: "border-b-transparent"
							}`}
							onClick={() => changeMediaType(type)}
						>
							{type}
						</button>
					))}
				</div>
			)}
		</>
	);
}
