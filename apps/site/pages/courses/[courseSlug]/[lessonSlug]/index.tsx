import { CheckCircleIcon, PlayIcon } from "@heroicons/react/solid";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CourseCompletion, CourseContent, LessonContent } from "@self-learning/types";
import { NestablePlaylist } from "@self-learning/ui/lesson";
import { GetStaticPaths, GetStaticProps, NextComponentType, NextPageContext } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export type LessonProps = {
	lesson: ResolvedValue<typeof getLesson>;
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

	return { lesson: lesson as Defined<typeof lesson>, chapters, course };
}

export const getStaticProps: GetStaticProps<LessonProps> = async ({ params }) => {
	const props = await getStaticPropsForLayout(params);

	if ("notFound" in props) return { notFound: true };

	const { lesson, chapters, course } = props;

	return {
		props: { lesson: lesson as Defined<typeof lesson>, chapters, course }
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		fallback: "blocking",
		paths: []
	};
};

export default function Lesson({ lesson, course }: LessonProps) {
	const url = (lesson.content as LessonContent)[0].url;

	return (
		<div className="playlist-scroll grow overflow-auto xl:h-[calc(100vh-80px)]">
			<div className="aspect-video h-full w-full bg-black xl:max-h-[75vh]">
				<VideoPlayer url={url} />
			</div>
			<LessonControls course={course} lesson={lesson} />
			<LessonHeader lesson={lesson} authors={lesson.authors} course={course} />
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

			<div className=" overflow-hidden md:pb-32 xl:h-[calc(100vh-80px)]">
				<div className="flex flex-col">
					<div className="mx-auto flex w-full flex-col xl:flex-row">
						<Component {...pageProps} />
						<PlaylistArea {...pageProps} />
					</div>
				</div>
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
		<div className="sticky flex h-[400px] flex-col xl:h-[calc(100vh-80px)] xl:w-[500px]">
			<NestablePlaylist course={course} currentLesson={lesson} content={content} />
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

function VideoPlayerWithPlaylist({
	videoUrl,
	currentLesson,
	chapters,
	course
}: {
	videoUrl: string;
	currentLesson: LessonProps["lesson"];
	chapters: LessonProps["chapters"];
	course: LessonProps["course"];
}) {
	return (
		<div className="mx-auto flex w-full flex-col bg-white xl:max-h-[75vh] xl:flex-row">
			<div className="aspect-video grow bg-black">
				<VideoPlayer url={videoUrl} />
			</div>
			<div className="flex h-[400px] flex-col xl:h-auto xl:w-[500px]">
				<NestablePlaylist
					course={course}
					currentLesson={currentLesson}
					content={chapters}
				/>
			</div>
		</div>
	);
}

function VideoPlayer({ url }: { url: string }) {
	return <ReactPlayer url={url} height="100%" width="100%" controls={true} />;
}

function LessonHeader({
	course,
	lesson,
	authors
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	authors: {
		slug: string;
		displayName: string;
		imgUrl: string | null;
	}[];
}) {
	return (
		<div className="flex flex-grow flex-col items-center gap-12 px-4 pt-8 pb-24">
			<h1 className="text-center text-4xl xl:text-6xl">{lesson.title}</h1>
			<Link href={`/courses/${course.slug}`}>
				<a className="text-xl font-semibold text-secondary">{course.title}</a>
			</Link>
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
			{lesson.subtitle && (
				<div className="max-w-3xl text-center text-xl tracking-tight text-light">
					{lesson.subtitle}
				</div>
			)}

			<div className="mx-auto max-w-prose text-justify">
				{lesson.description && <p>{lesson.description}</p>}
			</div>
		</div>
	);
}

function LessonControls({
	lesson,
	course
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
}) {
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId);

	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = isCompleted(lesson, completion);

	return (
		<div className="flex flex-wrap justify-end gap-8 p-4">
			<Link href={`/courses/${course.slug}/${lesson.slug}/quiz`}>
				<a className="btn-primary flex w-full flex-wrap-reverse md:w-fit">
					<span>Zur Lernkontrolle</span>
					<PlayIcon className="h-6 shrink-0" />
				</a>
			</Link>

			{!isCompletedLesson ? (
				<button
					className="btn-stroked flex w-full flex-wrap-reverse md:w-fit"
					onClick={markAsCompleted}
				>
					<span>Als abgeschlossen markieren</span>
					<CheckCircleIcon className="h-6 shrink-0" />
				</button>
			) : (
				<button
					className="btn-stroked flex w-full flex-wrap-reverse md:w-fit"
					onClick={markAsCompleted}
				>
					<span>Als wiederholt markieren</span>
					<CheckCircleIcon className="h-6 shrink-0" />
				</button>
			)}
		</div>
	);
}

function isCompleted(lesson: { lessonId: string }, completion?: CourseCompletion): boolean {
	return !!completion?.completedLessons[lesson.lessonId];
}
