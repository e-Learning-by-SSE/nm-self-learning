import { database } from "@self-learning/database";
import { CourseContent, extractLessonIds, LessonMeta } from "@self-learning/types";
import { NestablePlaylist, PlaylistContent } from "@self-learning/ui/lesson";
import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";

export type LessonLayoutProps = {
	lesson: ResolvedValue<typeof getLesson>;
	content: PlaylistContent;
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
				content: true,
				title: true,
				slug: true
			}
		})
	]);

	if (!course || !lesson) {
		return { notFound: true };
	}

	const lessonIds = extractLessonIds(course.content as CourseContent);

	const lessons = await database.lesson.findMany({
		select: {
			lessonId: true,
			slug: true,
			title: true,
			meta: true
		},
		where: {
			lessonId: {
				in: lessonIds
			}
		}
	});

	const lessonsById = new Map<string, LessonInfo>();

	for (const lesson of lessons) {
		lessonsById.set(lesson.lessonId, lesson as LessonInfo);
	}

	const content = mapToPlaylistContent(course.content as CourseContent, lessonsById);

	return {
		lesson: lesson as Defined<typeof lesson>,
		content,
		course: {
			slug: course.slug,
			title: course.title
		}
	};
}

function mapToPlaylistContent(
	content: CourseContent,
	lessons: Map<string, LessonInfo>
): PlaylistContent {
	const playlistContent: PlaylistContent = [];

	for (const chapterOrLesson of content) {
		if (chapterOrLesson.type === "chapter") {
			playlistContent.push({
				...chapterOrLesson,
				type: "chapter",
				content: mapToPlaylistContent(chapterOrLesson.content, lessons)
			});
		} else {
			const lesson = lessons.get(chapterOrLesson.lessonId) ?? {
				lessonId: "removed",
				slug: "removed",
				title: "Removed",
				meta: {
					hasQuiz: false,
					mediaTypes: {}
				}
			};

			playlistContent.push({
				...chapterOrLesson,
				...lesson
			});
		}
	}

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

			<div className="flex w-full flex-col xl:flex-row">
				<Component {...pageProps} />
				<PlaylistArea {...pageProps} />
			</div>
		</>
	);
}

function PlaylistArea({ content, course, lesson }: LessonLayoutProps) {
	return (
		<div className="flex h-[500px] w-full shrink-0 border-l border-light-border bg-white xl:h-full xl:w-[500px] xl:border-t-0">
			<div className="right-0 flex w-full xl:fixed xl:h-[calc(100vh-80px)] xl:w-[500px]">
				<NestablePlaylist
					course={course}
					currentLesson={lesson}
					content={content}
					//courseCompletion={courseCompletion}
				/>
			</div>
		</div>
	);
}
