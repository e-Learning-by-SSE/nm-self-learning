import { PlayIcon } from "@heroicons/react/solid";
import { cmsTypes, getLessonBySlug } from "@self-learning/cms-api";
import { checkLessonCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CourseChapter } from "@self-learning/types";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import { Playlist, PlaylistLesson } from "@self-learning/ui/lesson";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";

type LessonProps = {
	lesson: ResolvedValue<typeof getLessonBySlug>;
	lessons: PlaylistLesson[];
	course: {
		title: string;
		slug: string;
		courseId: string;
	};
};

export const getServerSideProps: GetServerSideProps<LessonProps> = async ({ params, req }) => {
	const courseSlug = params?.courseSlug as string;
	const lessonSlug = params?.lessonSlug as string;

	if (!courseSlug || !lessonSlug) {
		throw new Error("No course/lesson slug provided.");
	}

	const [lesson, course, session] = await Promise.all([
		getLessonBySlug(lessonSlug),
		database.course.findUnique({ where: { slug: courseSlug } }),
		getSession({ req })
	]);

	if (!course || !lesson) {
		return { notFound: true };
	}

	const lessonIds = extractLessonIds(course.content as CourseChapter[]);

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

	if (session?.user?.name) {
		const completion = await checkLessonCompletion(session.user.name, lessonIds);

		for (const lesson of lessons) {
			lesson.isCompleted = lesson.lessonId in completion;
		}
	}

	return {
		props: { lesson: lesson as Defined<typeof lesson>, lessons, course }
	};
};

function extractLessonIds(content: CourseChapter[]) {
	return content.flatMap(chapter => chapter.lessons.flatMap(lesson => lesson.lessonId));
}

export default function Lesson({ lesson, lessons, course }: LessonProps) {
	const { title } = lesson;
	const { url } = lesson.content?.[0] as cmsTypes.ComponentContentYoutubeVideo;

	const authors = lesson.authors?.data.map(
		author =>
			({
				name: author.attributes?.name,
				slug: author.attributes?.slug,
				imgUrl: author.attributes?.image?.data?.attributes?.url
			} as AuthorProps)
	) as AuthorProps[];

	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>

			<div className=" bg-gray-50 md:pb-32">
				<div className="flex flex-col gap-4">
					<VideoPlayerWithPlaylist
						videoUrl={url as string}
						lessons={lessons}
						currentLesson={lesson}
						course={course}
						chapter={{ title: "Chapter #1" }}
					/>
					<LessonHeader lesson={lesson} authors={authors} />
				</div>
			</div>
		</>
	);
}

function VideoPlayerWithPlaylist({
	videoUrl,
	currentLesson,
	lessons,
	course
}: {
	videoUrl: string;
	currentLesson: LessonProps["lesson"];
	lessons: LessonProps["lessons"];
	course: LessonProps["course"];
	chapter: any; // TODO
}) {
	return (
		<div className="mx-auto flex w-full flex-col bg-white xl:max-h-[75vh] xl:flex-row">
			<div className="aspect-video grow bg-black">
				<YoutubeEmbed url={videoUrl}></YoutubeEmbed>
				{/* <VideoPlayer url={videoUrl} /> */}
			</div>
			<div className="h-[400px] overflow-hidden xl:h-auto xl:w-[400px]">
				<Playlist
					lessons={lessons}
					currentLesson={currentLesson}
					course={course}
					subtitle="Kapitel: Grundlagen (4/20)"
				/>
			</div>
		</div>
	);
}

function YoutubeEmbed({ url }: { url: string }) {
	const videoId = useMemo(() => url.match(/\?v=(.+)$/)?.at(1), [url]);

	return (
		<iframe
			height="100%"
			width="100%"
			src={`https://www.youtube-nocookie.com/embed/${videoId}`}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
	);
}

function VideoPlayer({ url }: { url: string }) {
	return (
		<div className="flex h-full w-full bg-black">
			<video controls src={url}></video>
		</div>
	);
}

function LessonHeader({
	lesson,
	authors
}: {
	lesson: LessonProps["lesson"];
	authors: AuthorProps[];
}) {
	return (
		<div className="mx-auto flex w-full max-w-screen-xl flex-col px-2 sm:px-0">
			<div className="gradient card flex flex-wrap justify-between gap-8">
				<Link href={`/lessons/${lesson.slug}/questions`}>
					<a className="btn-primary flex w-full flex-wrap-reverse md:w-fit">
						<span>Zur Lernkontrolle</span>
						<PlayIcon className="h-6 shrink-0" />
					</a>
				</Link>
			</div>

			<div className="mx-auto mt-8 flex flex-grow flex-col items-center gap-12">
				<h1 className="text-center text-4xl xl:text-6xl">{lesson.title}</h1>
				{lesson.subtitle && (
					<div className="max-w-3xl text-xl tracking-tight text-indigo-700">
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
