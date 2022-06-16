import { CheckCircleIcon, PlayIcon } from "@heroicons/react/solid";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import { getStaticPropsForLayout, LessonLayout, LessonLayoutProps } from "@self-learning/lesson";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	CourseCompletion,
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

	const { lesson, chapters, course } = props;

	lesson.quiz = null; // Not needed on this page, but on /quiz
	let mdDescription = null;
	let mdArticle = null;

	if (lesson.description) {
		mdDescription = await compileMarkdown(lesson.description);
	}

	const { content: article, index } = findContentType("article", lesson.content as LessonContent);

	if (article) {
		mdArticle = await compileMarkdown(article.value.content ?? "Kein Inhalt.");

		(lesson.content as LessonContent)[index] = {
			type: "article",
			value: {}
		};
	}

	return {
		props: {
			lesson: lesson as Defined<typeof lesson>,
			markdown: {
				article: mdArticle,
				description: mdDescription
			},
			chapters,
			course
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
		<div className="grow">
			{preferredMediaType === "video" && (
				<div className="w-full bg-black sm:h-[500px] xl:h-full xl:max-h-[75vh]">
					{url ? (
						<VideoPlayer url={url} />
					) : (
						<div className="py-16 text-center text-red-500">Error: Missing URL</div>
					)}
				</div>
			)}
			<LessonControls course={course} lesson={lesson} currentMediaType={preferredMediaType} />
			<LessonHeader
				lesson={lesson}
				authors={lesson.authors}
				course={course}
				mdDescription={markdown.description}
			/>
			{preferredMediaType === "article" && markdown.article && (
				<div className="px-4 pb-32">
					<div className="prose mx-auto max-w-prose">
						<MDXRemote {...markdown.article} />
					</div>
				</div>
			)}
		</div>
	);
}

Lesson.getLayout = LessonLayout;

function LessonHeader({
	course,
	lesson,
	authors,
	mdDescription
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	authors: {
		slug: string;
		displayName: string;
		imgUrl: string | null;
	}[];
	mdDescription?: CompiledMarkdown | null;
}) {
	return (
		<div className="flex flex-grow flex-col items-center gap-12 px-4 pt-8 pb-12">
			<h1 className="text-center text-4xl xl:text-6xl">{lesson.title}</h1>
			<Link href={`/courses/${course.slug}`}>
				<a className="text-xl font-semibold text-secondary">{course.title}</a>
			</Link>
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
			{lesson.subtitle && (
				<div className="max-w-3xl text-center text-xl tracking-tight text-light">
					{lesson.subtitle}
				</div>
			)}

			<div className="prose w-full max-w-prose">
				<Math />
				{mdDescription && <MDXRemote {...mdDescription} />}
			</div>
		</div>
	);
}

function LessonControls({
	lesson,
	course,
	currentMediaType
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	currentMediaType: LessonContentType["type"];
}) {
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId);

	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = isCompleted(lesson, completion);

	return (
		<div className="flex p-4">
			<MediaTypeSelector course={course} lesson={lesson} current={currentMediaType} />

			<div className="flex grow flex-wrap justify-end gap-8">
				<Link href={`/courses/${course.slug}/${lesson.slug}/quiz`}>
					<a className="btn-primary flex w-full flex-wrap-reverse md:w-fit">
						<span>Zur Lernkontrolle</span>
						<PlayIcon className="h-6 shrink-0" />
					</a>
				</Link>

				{!isCompletedLesson ? (
					<button
						className="btn-stroked flex w-full flex-wrap-reverse self-end md:w-fit"
						onClick={markAsCompleted}
					>
						<span>Als abgeschlossen markieren</span>
						<CheckCircleIcon className="h-6 shrink-0" />
					</button>
				) : (
					<button
						className="btn-stroked flex w-full flex-wrap-reverse self-end md:w-fit"
						onClick={markAsCompleted}
					>
						<span>Als wiederholt markieren</span>
						<CheckCircleIcon className="h-6 shrink-0" />
					</button>
				)}
			</div>
		</div>
	);
}

function isCompleted(lesson: { lessonId: string }, completion?: CourseCompletion): boolean {
	return !!completion?.completedLessons[lesson.lessonId];
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
