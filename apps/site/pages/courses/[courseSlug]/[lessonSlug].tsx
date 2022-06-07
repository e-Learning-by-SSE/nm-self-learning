import { CheckCircleIcon, PlayIcon } from "@heroicons/react/solid";
import {
	checkLessonCompletion,
	useCourseCompletion,
	useMarkAsCompleted
} from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CourseContent, LessonContent } from "@self-learning/types";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import { NestablePlaylist, PlaylistLesson } from "@self-learning/ui/lesson";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

type LessonProps = {
	lesson: ResolvedValue<typeof getLesson>;
	chapters: { title: string; lessons: PlaylistLesson[]; isActive: boolean }[];
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

export const getServerSideProps: GetServerSideProps<LessonProps> = async ({ params, req }) => {
	const courseSlug = params?.courseSlug as string;
	const lessonSlug = params?.lessonSlug as string;

	if (!courseSlug || !lessonSlug) {
		throw new Error("No course/lesson slug provided.");
	}

	const [lesson, course, session] = await Promise.all([
		getLesson(lessonSlug),
		database.course.findUnique({
			where: { slug: courseSlug },
			select: {
				content: true,
				title: true,
				slug: true
			}
		}),
		getSession({ req })
	]);

	if (!course || !lesson) {
		return { notFound: true };
	}

	const lessonIds = (course.content as CourseContent).flatMap(chapter => chapter.lessonIds);

	const lessons = (await database.lesson.findMany({
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
	})) as PlaylistLesson[];

	const lessonsById = new Map<string, typeof lessons[0]>();

	for (const lesson of lessons) {
		lessonsById.set(lesson.lessonId, lesson);
	}

	const chapters = (course.content as CourseContent).map(chapter => ({
		title: chapter.title,
		lessons: chapter.lessonIds.map(lessonId => lessonsById.get(lessonId) as PlaylistLesson),
		isActive: chapter.lessonIds.includes(lesson.lessonId)
	}));

	if (session?.user?.name) {
		const completion = await checkLessonCompletion(session.user.name, lessonIds);

		for (const chapter of chapters) {
			for (const lesson of chapter.lessons) {
				lesson.isCompleted = lesson.lessonId in completion;
			}
		}
	}

	return {
		props: { lesson: lesson as Defined<typeof lesson>, chapters, course }
	};
};

export default function Lesson({ lesson, chapters, course }: LessonProps) {
	console.log(lesson);

	const url = (lesson.content as LessonContent)[0].url;
	const authors = lesson.authors.map(
		author =>
			({
				name: author.displayName,
				slug: author.slug,
				imgUrl: author.imgUrl
			} as AuthorProps)
	) as AuthorProps[];

	return (
		<>
			<Head>
				<title>{lesson.title}</title>
			</Head>

			<div className=" bg-gray-50 md:pb-32">
				<div className="flex flex-col gap-4">
					<VideoPlayerWithPlaylist
						videoUrl={url as string}
						chapters={chapters}
						currentLesson={lesson}
						course={course}
					/>
					<LessonHeader lesson={lesson} authors={authors} course={course} />
				</div>
			</div>
		</>
	);
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
	return (
		<div className="flex h-full w-full bg-black">
			<ReactPlayer url={url} height="100%" width="100%" controls={true} />
		</div>
	);
}

function LessonHeader({
	course,
	lesson,
	authors
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	authors: AuthorProps[];
}) {
	const router = useRouter();

	const onSettled = useCallback(() => {
		router.replace(router.asPath, undefined, { scroll: false });
	}, [router]);

	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, onSettled);
	const courseCompletion = useCourseCompletion(course.slug);

	return (
		<div className="mx-auto flex w-full max-w-screen-xl flex-col px-2 sm:px-0">
			<div className="gradient card flex flex-wrap justify-between gap-8">
				<Link href={`/lessons/${lesson.slug}/quiz`}>
					<a className="btn-primary flex w-full flex-wrap-reverse md:w-fit">
						<span>Zur Lernkontrolle</span>
						<PlayIcon className="h-6 shrink-0" />
					</a>
				</Link>

				<button
					className="btn-primary flex w-full flex-wrap-reverse md:w-fit"
					onClick={markAsCompleted}
				>
					<span>Als abgeschlossen markieren</span>
					<CheckCircleIcon className="h-6 shrink-0" />
				</button>
			</div>
			{/* <div className="bg-white p-4 text-xs">
				<pre>{JSON.stringify(courseCompletion, null, 4)}</pre>
			</div> */}
			<div className="mx-auto mt-8 flex flex-grow flex-col items-center gap-12">
				<Link href={`/courses/${course.slug}`}>
					<a className="text-xl font-semibold text-secondary">{course.title}</a>
				</Link>
				<h1 className="text-center text-4xl xl:text-6xl">{lesson.title}</h1>
				{lesson.subtitle && (
					<div className="max-w-3xl text-xl tracking-tight text-light">
						{lesson.subtitle}
					</div>
				)}
				<AuthorsList authors={authors} />
				<div className="mx-auto max-w-prose text-justify">
					{lesson.description && <p>{lesson.description}</p>}
				</div>
			</div>
		</div>
	);
}
