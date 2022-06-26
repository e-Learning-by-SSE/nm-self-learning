import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { CourseCompletion, CourseContent } from "@self-learning/types";
import { NestablePlaylist } from "@self-learning/ui/lesson";
import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";

export type LessonLayoutProps = {
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
		course
	};
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

function PlaylistArea({ chapters, course, lesson }: LessonLayoutProps) {
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
				<NestablePlaylist
					course={course}
					currentLesson={lesson}
					content={content}
					courseCompletion={courseCompletion}
				/>
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
