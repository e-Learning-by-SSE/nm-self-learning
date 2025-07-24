import { trpc } from "@self-learning/api-client";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CourseContent, LessonMeta, ResolvedValue } from "@self-learning/types";
import { Playlist, PlaylistContent, PlaylistLesson } from "@self-learning/ui/lesson";
import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";
import { useMemo, useRef } from "react";
import { LessonData, getLesson } from "./lesson-data-access";
import { LessonLayoutContext, LessonLayoutContextType } from "./lesson-layout-context";

export type LessonLayoutProps = {
	lesson: LessonData;
	course: ResolvedValue<typeof getCourse>;
};

export type StandaloneLessonLayoutProps = {
	lesson: LessonData;
};

type BaseLessonLayoutProps = {
	title: string;
	playlistArea: React.ReactNode;
	children: React.ReactNode;
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

export async function getStaticPropsForLessonCourseLayout(
	params?: ParsedUrlQuery | undefined
): Promise<LessonLayoutProps | { notFound: true }> {
	const standaloneProps = await getStaticPropsForStandaloneLessonLayout(params);
	if ("notFound" in standaloneProps) {
		return { notFound: true };
	}

	const courseSlug = params?.["courseSlug"] as string;
	if (!courseSlug) {
		throw new Error("No course/lesson slug provided.");
	}

	const course = await getCourse(courseSlug);
	if (!course) {
		return { notFound: true };
	}

	return { ...standaloneProps, course };
}

export async function getStaticPropsForStandaloneLessonLayout(
	params?: ParsedUrlQuery | undefined
): Promise<StandaloneLessonLayoutProps | { notFound: true }> {
	const lessonSlug = params?.["lessonSlug"] as string;
	if (!lessonSlug) {
		throw new Error("No lesson slug provided.");
	}

	const lesson = await getLesson(lessonSlug);

	if (!lesson) {
		return { notFound: true };
	}

	return { lesson };
}

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

function BaseLessonLayout({ title, playlistArea, children }: BaseLessonLayoutProps) {
	const playlistRef = useRef<HTMLDivElement>(null);

	const contextValue: LessonLayoutContextType = {
		playlistRef
	};
	return (
		<LessonLayoutContext.Provider value={contextValue}>
			<Head>
				<title>{title}</title>
			</Head>

			<div className="flex flex-col bg-gray-100">
				<div className="mx-auto flex w-full max-w-[1920px] flex-col-reverse gap-8 px-4 xl:grid xl:grid-cols-[400px_1fr]">
					{playlistArea}
					<div className="w-full pt-8 pb-16">{children}</div>
				</div>
			</div>
		</LessonLayoutContext.Provider>
	);
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
		<BaseLessonLayout title={pageProps.lesson.title} playlistArea={playlistArea}>
			<Component {...pageProps} />
		</BaseLessonLayout>
	);
}

export function StandaloneLessonLayout(
	Component: NextComponentType<NextPageContext, unknown, StandaloneLessonLayoutProps>,
	pageProps: StandaloneLessonLayoutProps
) {
	const playlistArea = <StandaloneLessonPlaylistArea {...pageProps} />;

	return (
		<BaseLessonLayout title={pageProps.lesson.title} playlistArea={playlistArea}>
			<Component {...pageProps} />
		</BaseLessonLayout>
	);
}

function PlaylistArea({ course, lesson }: LessonLayoutProps) {
	const { data: content } = trpc.course.getContent.useQuery({ slug: course.slug });
	const completion = useCourseCompletion(course.slug);
	const playlistContent = useMemo(
		() => (!content ? [] : mapToPlaylistContent(content.content, content.lessonMap)),
		[content]
	);

	return (
		<aside className="playlist-scroll sticky top-[61px] w-full overflow-auto border-t border-r-gray-200 pb-8 xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r xl:pr-4">
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

function StandaloneLessonPlaylistArea({ lesson }: StandaloneLessonLayoutProps) {
	return (
		<aside className="playlist-scroll sticky top-[61px] w-full overflow-auto border-t border-r-gray-200 pb-8 xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r xl:pr-4">
			{/** to be implemented */}
		</aside>
	);
}
