import { trpc } from "@self-learning/api-client";
import { useCourseCompletion } from "@self-learning/completion";
import { CourseContent, LessonMeta, ResolvedValue } from "@self-learning/types";
import { Playlist, PlaylistContent, PlaylistLesson } from "@self-learning/ui/lesson";
import { NextComponentType, NextPageContext } from "next";
import type { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";
import { getCourse, LessonData } from "../lesson-data-access";
import { getSspStandaloneLessonLayout } from "./standalone-lesson-layout";
import { BaseLessonLayout } from "./base-layout";

export type LessonLayoutProps = {
	lesson: LessonData;
	course: ResolvedValue<typeof getCourse>;
};

export async function getSSpLessonCourseLayout(
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

	const course = await getCourse(courseSlug);
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
		<BaseLessonLayout title={pageProps.lesson.title} playlistArea={playlistArea}>
			<Component {...pageProps} />
		</BaseLessonLayout>
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
