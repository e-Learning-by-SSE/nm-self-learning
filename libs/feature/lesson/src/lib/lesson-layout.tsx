import { trpc } from "@self-learning/api-client";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CourseContent, LessonMeta } from "@self-learning/types";
import { Playlist, PlaylistContent, PlaylistLesson } from "@self-learning/ui/lesson";
import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";

export type LessonLayoutProps = {
	lesson: ResolvedValue<typeof getLesson>;
	course: {
		title: string;
		slug: string;
	};
};

type LessonInfo = { lessonId: string; slug: string; title: string; meta: LessonMeta };

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
			meta: true,
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
): Promise<LessonLayoutProps | { notFound: true }> {
	const courseSlug = params?.["courseSlug"] as string;
	const lessonSlug = params?.["lessonSlug"] as string;

	if (!courseSlug || !lessonSlug) {
		throw new Error("No course/lesson slug provided.");
	}

	const [lesson, course] = await Promise.all([
		getLesson(lessonSlug),
		database.course.findUnique({
			where: { slug: courseSlug },
			select: {
				title: true,
				slug: true
			}
		})
	]);

	if (!course || !lesson) {
		return { notFound: true };
	}

	return {
		lesson: lesson as Defined<typeof lesson>,
		course: {
			slug: course.slug,
			title: course.title
		}
	};
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

export function LessonLayout(
	Component: NextComponentType<NextPageContext, unknown, LessonLayoutProps>,
	pageProps: LessonLayoutProps
) {
	return (
		<>
			<Head>
				<title>{pageProps.lesson.title}</title>
			</Head>

			<div className="flex flex-col bg-gray-100">
				<div className="max-w-8xl mx-auto flex flex-col-reverse xl:flex-row">
					<PlaylistArea {...pageProps} />
					<div className="xl:pl-[24rem]">
						<Component {...pageProps} />
					</div>
				</div>
			</div>
		</>
	);
}

function PlaylistArea({ course, lesson }: LessonLayoutProps) {
	const { data: content } = trpc.course.getContent.useQuery({ slug: course.slug });
	const completion = useCourseCompletion(course.slug);
	const playlistContent = useMemo(
		() => (!content ? [] : mapToPlaylistContent(content.content, content.lessonMap)),
		[content]
	);

	if (!content) {
		return (
			<aside className="playlist-scroll left-[max(0px,calc(50%-50rem))] right-auto h-full w-full animate-pulse divide-y divide-gray-200 overflow-auto border-r border-r-gray-200 bg-gray-200 px-8 py-8 xl:fixed xl:max-h-[calc(100vh-62px)] xl:max-w-[24rem]"></aside>
		);
	}

	return (
		<Playlist
			content={playlistContent}
			course={course}
			lesson={lesson}
			completion={completion}
		/>
	);
}
