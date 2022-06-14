import { CheckCircleIcon, PlayIcon } from "@heroicons/react/solid";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	CourseCompletion,
	CourseContent,
	findContentType,
	LessonContent,
	LessonContentMediaType,
	LessonContentType
} from "@self-learning/types";
import { NestablePlaylist } from "@self-learning/ui/lesson";
import { GetStaticPaths, GetStaticProps, NextComponentType, NextPageContext } from "next";
import { MDXRemote } from "next-mdx-remote";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";
import { useEffect, useMemo, useState } from "react";
import Math from "../../../../components/math";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export type LessonProps = {
	lesson: ResolvedValue<typeof getLesson>;
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
	};
	chapters: {
		title: string;
		lessons: { lessonId: string; slug: string; title: string; imgUrl?: string | null }[];
		isActive: boolean;
	}[];
	course: {
		title: string;
		slug: string;
	};
};

async function getLesson(slug: string) {
	return database.lesson.findUnique({
		where: { slug },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			subtitle: true,
			description: true,
			content: true,
			quiz: true,
			competences: {
				select: {
					competenceId: true,
					title: true
				}
			},
			authors: {
				select: {
					displayName: true,
					slug: true,
					imgUrl: true
				}
			}
		}
	});
}

export async function getStaticPropsForLayout(
	params?: ParsedUrlQuery | undefined
): Promise<LessonProps | { notFound: true }> {
	const courseSlug = params?.courseSlug as string;
	const lessonSlug = params?.lessonSlug as string;

	if (!courseSlug || !lessonSlug) {
		throw new Error("No course/lesson slug provided.");
	}

	const [lesson, course] = await Promise.all([
		getLesson(lessonSlug),
		database.course.findUnique({
			where: { slug: courseSlug },
			select: {
				content: true,
				title: true,
				slug: true
			}
		})
	]);

	if (!course || !lesson) {
		return { notFound: true };
	}

	const lessonIds = (course.content as CourseContent).flatMap(chapter => chapter.lessonIds);

	const lessons = await database.lesson.findMany({
		select: {
			lessonId: true,
			slug: true,
			title: true,
			imgUrl: true
		},
		where: {
			lessonId: {
				in: lessonIds
			}
		}
	});

	const lessonsById = new Map<string, typeof lessons[0]>();

	for (const lesson of lessons) {
		lessonsById.set(lesson.lessonId, lesson);
	}

	const chapters = (course.content as CourseContent).map(chapter => ({
		title: chapter.title,
		lessons: chapter.lessonIds.map(
			lessonId =>
				lessonsById.get(lessonId) ?? {
					title: "Removed",
					lessonId: "removed",
					slug: "removed"
				}
		),
		isActive: chapter.lessonIds.includes(lesson.lessonId)
	}));

	return {
		lesson: lesson as Defined<typeof lesson>,
		chapters,
		course,
		markdown: { article: null, description: null }
	};
}

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

function usePreferredMediaType(defaultType: LessonContentType["type"]) {
	const router = useRouter();
	const [preferredMediaType, setPreferredMediaType] = useState(defaultType ?? null);

	useEffect(() => {
		const { type } = router.query;
		let fromLocalStorage: string | null = null;

		if (type && typeof type === "string") {
			setPreferredMediaType(type as LessonContentType["type"]);
		} else if (typeof window !== "undefined") {
			fromLocalStorage = window.localStorage.getItem("preferredMediaType");
			if (fromLocalStorage) {
				setPreferredMediaType(fromLocalStorage as LessonContentType["type"]);
			}
		} else {
			setPreferredMediaType("video");
		}
	}, [router]);

	return preferredMediaType;
}

export default function Lesson({ lesson, course, markdown }: LessonProps) {
	const { content: video } = findContentType("video", lesson.content as LessonContent);
	const url = video?.value.url;
	const preferredMediaType = usePreferredMediaType(url ? "video" : "article");

	return (
		<div className="grow">
			{preferredMediaType === "video" && url && (
				<div className="w-full bg-black sm:h-[500px] xl:h-full xl:max-h-[75vh]">
					<VideoPlayer url={url} />
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
				<div className="px-4">
					<div className="prose mx-auto max-w-prose">
						<MDXRemote {...markdown.article} />
					</div>
				</div>
			)}
		</div>
	);
}

Lesson.getLayout = LessonLayout;

export function LessonLayout(
	Component: NextComponentType<NextPageContext, unknown, LessonProps>,
	pageProps: LessonProps
) {
	return (
		<>
			<Head>
				<title>{pageProps.lesson.title}</title>
			</Head>

			<div className="flex w-full flex-col xl:flex-row">
				<Component {...pageProps} />
				<PlaylistArea {...pageProps} />
			</div>
		</>
	);
}

function PlaylistArea({ chapters, course, lesson }: LessonProps) {
	const courseCompletion = useCourseCompletion(course.slug);

	const content = useMemo(() => {
		if (!courseCompletion) {
			return chapters;
		}

		const contentWithCompletion = addCompletionInfo(chapters, courseCompletion);

		return contentWithCompletion;
	}, [courseCompletion, chapters]);

	return (
		<div className="flex h-[500px] w-full shrink-0 border-l border-light-border bg-white xl:h-full xl:w-[500px] xl:border-t-0">
			<div className="right-0 flex w-full xl:fixed xl:h-[calc(100vh-80px)] xl:w-[500px]">
				<NestablePlaylist course={course} currentLesson={lesson} content={content} />
			</div>
		</div>
	);
}

function addCompletionInfo(
	chapters: {
		title: string;
		lessons: { lessonId: string; slug: string; title: string; imgUrl?: string | null }[];
		isActive: boolean;
	}[],
	courseCompletion: CourseCompletion
) {
	return chapters.map(chapter => ({
		title: chapter.title,
		isActive: chapter.isActive,
		lessons: chapter.lessons.map(lesson => ({
			...lesson,
			isCompleted: lesson.lessonId in courseCompletion.completedLessons
		}))
	}));
}

function VideoPlayer({ url }: { url: string }) {
	return <ReactPlayer url={url} height="100%" width="100%" controls={true} />;
}

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
		<div className="flex justify-between p-4">
			<MediaTypeSelector course={course} lesson={lesson} current={currentMediaType} />

			<div className="flex flex-wrap gap-8">
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
							className={`text-sm ${
								current === type
									? "border-b-2 border-secondary px-3 py-0 text-secondary"
									: ""
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
