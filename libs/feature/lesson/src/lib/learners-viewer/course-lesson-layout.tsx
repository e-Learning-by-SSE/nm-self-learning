import { trpc } from "@self-learning/api-client";
import { useCourseCompletion } from "@self-learning/completion";
import { CourseContent, LessonMeta, ResolvedValue } from "@self-learning/types";
import {
	MobilePlayList,
	Playlist,
	PlaylistContent,
	PlaylistLesson,
	useLessonNavigation
} from "@self-learning/ui/lesson";
import { NextComponentType, NextPageContext } from "next";
import type { ParsedUrlQuery } from "querystring";
import { getCourse, LessonData } from "../lesson-data-access";
import { BaseLessonLayout } from "./base-layout";
import { getSspStandaloneLessonLayout } from "./standalone-lesson-layout";
import { useMemo } from "react";
import { MobileSidebarNavigation } from "@self-learning/ui/layouts";
import Head from "next/head";
import { database } from "@self-learning/database";

export type LessonLayoutProps = {
	lesson: LessonData;
	course: ResolvedValue<typeof getCombinedSmallCourse>;
};
/*
<<<<<<< HEAD:libs/feature/lesson/src/lib/lesson-layout.tsx
export type StandaloneLessonLayoutProps = {
	lesson: LessonData;
};

type BaseLessonLayoutProps = {
	title: string;
	playlistArea: React.ReactNode;
	children: React.ReactNode;
	course?: ResolvedValue<typeof getCourse>;
	lesson?: LessonData;
};

type LessonInfo = { lessonId: string; slug: string; title: string; meta: LessonMeta };

export function getCourse(slug: string) {
	return database.course.findUnique({
		where: { slug },
		select: {
			courseId: true,
			title: true,
			slug: true
		}
	});
}

export async function getCombinedSmallCourse(slug: string) {
	const course = await database.course.findFirst({
		where: { slug },
		select: {
			courseId: true,
			title: true,
			slug: true
		}
	});

	const dynCourse = await database.dynCourse.findFirst({
		where: { slug },
		select: {
			courseId: true,
			title: true,
			slug: true
		}
	});
	if (!course && !dynCourse) {
		return null;
	}
	const combinedCourse = course ? course : dynCourse;
	return combinedCourse;
}

export async function getStaticPropsForLessonCourseLayout(
=======*/

export async function getCombinedSmallCourse(slug: string) {
	const course = await database.course.findFirst({
		where: { slug },
		select: {
			courseId: true,
			title: true,
			slug: true
		}
	});

	const dynCourse = await database.dynCourse.findFirst({
		where: { slug },
		select: {
			courseId: true,
			title: true,
			slug: true
		}
	});
	if (!course && !dynCourse) {
		return null;
	}
	const combinedCourse = course ? course : dynCourse;
	return combinedCourse;
}

export async function getSSpLessonCourseLayout(
	//>>>>>>> master:libs/feature/lesson/src/lib/learners-viewer/course-lesson-layout.tsx
	params?: ParsedUrlQuery | undefined
): Promise<LessonLayoutProps | { notFound: true }> {
	const standaloneProps = await getSspStandaloneLessonLayout(params);
	if ("notFound" in standaloneProps) {
		return { notFound: true };
	}

	const courseSlug = params?.["courseSlug"] as string;
	if (!courseSlug) {
		throw new Error("No course/lesson slug provided.");
	}

	const course = await getCombinedSmallCourse(courseSlug);

	if (!course) {
		return { notFound: true };
	}

	return { ...standaloneProps, course };
}

export function LessonLayout(
	Component: NextComponentType<NextPageContext, unknown, LessonLayoutProps>,
	pageProps: LessonLayoutProps
) {
	if (!pageProps.course) {
		throw new Error("LessonLayout expects course");
	}

	const playlistArea = pageProps.course ? <PlaylistArea {...pageProps} /> : null;
	return (
		<BaseLessonLayout title={pageProps.lesson.title} playlistArea={playlistArea} {...pageProps}>
			<Component {...pageProps} />
		</BaseLessonLayout>
	);
}

function PlaylistArea({ course, lesson }: LessonLayoutProps) {
	return (
		<>
			<div className="xl:hidden">
				{course && lesson && <MobilePlaylistArea course={course} lesson={lesson} />}
				{/* <div className="p-5 pt-8 bg-gray-100 pb-16"> */}
				{/* <div className="w-full">{children}</div> */}
				{/* </div> */}
			</div>
			<div className="hidden xl:block">
				<BigScreenPlaylistArea course={course} lesson={lesson} />
			</div>
		</>
	);
}

type LessonInfo = { lessonId: string; slug: string; title: string; meta: LessonMeta };

function mapToPlaylistContent(
	content: CourseContent,
	lessons: { [lessonId: string]: LessonInfo }
): PlaylistContent {
	let lessonNr = 1;

	const playlistContent: PlaylistContent = content.map(chapter => ({
		title: chapter.title,
		description: chapter.description,
		content: chapter.content.map(lesson => {
			const lessonInfo = lessons[lesson.lessonId] ?? {
				lessonId: "removed",
				meta: { hasQuiz: false, mediaTypes: {} },
				slug: "removed",
				title: "Removed"
			};

			const playlistLesson: PlaylistLesson = {
				...lessonInfo,
				isCompleted: false,
				lessonNr: lessonNr++
			};

			return playlistLesson;
		})
	}));

	return playlistContent;
}

function BigScreenPlaylistArea({ course, lesson }: LessonLayoutProps) {
	const { data: content } = trpc.course.getContent.useQuery({ slug: course.slug });
	const completion = useCourseCompletion(course.slug);
	const playlistContent = useMemo(
		() => (!content ? [] : mapToPlaylistContent(content.content, content.lessonMap)),
		[content]
	);

	return (
		<aside className="playlist-scroll sticky top-[61px] w-full overflow-auto border-t border-r-gray-200 rounded-lg xl:rounded-none pb-8 xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r xl:pr-4">
			{content ? (
				<Playlist
					content={playlistContent}
					course={course}
					lesson={{ ...lesson, meta: lesson.meta as LessonMeta }}
					completion={completion}
				/>
			) : (
				<div className="h-full pt-8">
					<div className="h-full animate-pulse rounded-lg bg-gray-200"></div>
				</div>
			)}
		</aside>
	);
}

function MobilePlaylistArea(pageProps: LessonLayoutProps) {
	const { data: content } = trpc.course.getContent.useQuery({ slug: pageProps.course.slug });
	const playlistContent = useMemo(
		() => (!content ? [] : mapToPlaylistContent(content.content, content.lessonMap)),
		[content]
	);
	const { navigateToNextLesson, navigateToPreviousLesson, previous, next } = useLessonNavigation({
		content: playlistContent,
		lesson: { ...pageProps.lesson, meta: pageProps.lesson.meta as LessonMeta },
		course: pageProps.course
	});

	return (
		<>
			{/*does this duplicates the title since BaseLessonLayout has it already?*/}
			<Head>
				<title>{pageProps.lesson.title}</title>
			</Head>
			<MobileSidebarNavigation
				next={() => {
					navigateToNextLesson();
				}}
				prev={() => {
					navigateToPreviousLesson();
				}}
				hasNext={!!next}
				hasPrev={!!previous}
				content={onSelect => (
					<MobilePlayList
						{...pageProps}
						lesson={{ ...pageProps.lesson, meta: pageProps.lesson.meta as LessonMeta }}
						content={playlistContent}
						onSelect={onSelect}
					/>
				)}
			/>
		</>
	);
}
