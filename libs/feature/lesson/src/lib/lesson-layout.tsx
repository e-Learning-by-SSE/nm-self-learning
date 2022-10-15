import {
	CheckCircleIcon,
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	PlayIcon
} from "@heroicons/react/solid";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import {
	CourseContent,
	extractLessonIds,
	LessonMeta,
	traverseCourseContent
} from "@self-learning/types";
import { Divider } from "@self-learning/ui/common";
import { PlaylistContent } from "@self-learning/ui/lesson";
import { getRandomId } from "@self-learning/util/common";
import { AnimatePresence, motion } from "framer-motion";
import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import Link from "next/link";
import type { ParsedUrlQuery } from "querystring";
import { useEffect, useState } from "react";

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

			<div className="flex flex-col justify-center py-8 xl:flex-row xl:gap-1">
				<Component {...pageProps} />
				<PlaylistArea {...pageProps} />
			</div>
		</>
	);
}

type ChapterType = {
	chapterId: string;
	title: string;
	content: Array<LessonType>;
};

type LessonType = {
	lessonNr: number;
	lessonId: string;
	title: string;
};

function PlaylistArea({ content, course, lesson }: LessonLayoutProps) {
	const completion = useCourseCompletion(course.slug);
	const [contentWithCompletion, setContentWithCompletion] = useState(content);
	const courseCompletion = completion?.completion["course"];
	const activeLessonId = "2";

	const chapters: ChapterType[] = [
		{ chapterId: getRandomId(), title: "Introduction to React", content: [] },
		{ chapterId: getRandomId(), title: "Thinking in React", content: [] },
		{
			chapterId: getRandomId(),
			title: "Describing the UI",
			content: [
				{ lessonNr: 1, lessonId: "1", title: "Creating reusable component" },
				{ lessonNr: 2, lessonId: "2", title: "Passing Props to components" },
				{ lessonNr: 3, lessonId: "3", title: "Conditional rendering" },
				{ lessonNr: 4, lessonId: "4", title: "Rendering lists of elements" }
			]
		},
		{ chapterId: getRandomId(), title: "Adding Interactivity", content: [] },
		{ chapterId: getRandomId(), title: "Managing State", content: [] }
	];

	useEffect(() => {
		if (!completion) {
			return;
		}

		traverseCourseContent(content, chapterOrLesson => {
			if (chapterOrLesson.type === "lesson") {
				chapterOrLesson.isCompleted =
					!!completion.completedLessons[chapterOrLesson.lessonId];
			}
		});

		setContentWithCompletion([...content]);
	}, [completion, content]);

	return (
		// <div className="flex h-[500px] w-full shrink-0 border-l border-light-border bg-white xl:h-full xl:w-[500px] xl:border-t-0">
		// 	<div className="right-0 flex w-full xl:fixed xl:h-[calc(100vh-80px)] xl:w-[500px]">
		// 		<NestablePlaylist
		// 			course={course}
		// 			currentLesson={lesson}
		// 			content={contentWithCompletion}
		// 			courseCompletion={courseCompletion}
		// 		/>
		// 	</div>
		// </div>
		<aside className="w-full px-4 xl:max-w-[500px]">
			<PlaylistHeader content={content} course={course} lesson={lesson} />
			<div className="playlist-scroll mt-4 flex flex-col gap-4">
				{chapters.map((chapter, index) => (
					<Chapter
						key={chapter.chapterId}
						chapterNr={index + 1}
						chapter={chapter}
						activeLessonId={activeLessonId}
						course={course}
					/>
				))}
			</div>
		</aside>
	);
}

function PlaylistHeader({ content, course, lesson }: LessonLayoutProps) {
	const completion = useCourseCompletion(course.slug);
	const [contentWithCompletion, setContentWithCompletion] = useState(content);
	const courseCompletion = completion?.completion["course"];

	return (
		<div className="flex flex-col gap-4 rounded-lg bg-gray-100 p-4">
			<div className="flex flex-col gap-2">
				<span className="heading text-2xl">{course.title}</span>
				<span className="text-sm text-light">
					{courseCompletion?.completedLessonCount} / {courseCompletion?.lessonCount}{" "}
					Lerneinheiten abgeschlossen
				</span>
			</div>
			<span className="relative h-5 w-full rounded-lg bg-indigo-100">
				<span
					className="absolute left-0 h-5 rounded-lg bg-secondary"
					style={{ width: `${courseCompletion?.completionPercentage ?? 0}%` }}
				></span>
				<span className="absolute top-0 w-full px-2 text-start text-sm font-semibold text-white ">
					{courseCompletion?.completionPercentage ?? 0}%
				</span>
			</span>
			<Divider />

			<div className="flex flex-col gap-4">
				<span className="flex gap-2">
					<PlayIcon className="h-5" />
					<span className="text-sm font-medium">{lesson.title}</span>
				</span>
				<span className="flex justify-between">
					<button className="btn-primary text-sm">Lernkontrolle</button>
					<span className="flex gap-2">
						<button
							className="rounded-lg border border-light-border p-2"
							title="Vorherige Lerneinheit"
						>
							<ChevronDoubleLeftIcon className="h-5" />
						</button>
						<button
							className="rounded-lg border border-light-border p-2"
							title="Nächste Lerneinheit"
						>
							<ChevronDoubleRightIcon className="h-5" />
						</button>
					</span>
				</span>
			</div>
		</div>
	);
}

function Chapter({
	chapter,
	chapterNr,
	course,
	activeLessonId
}: {
	chapter: ChapterType;
	course: { slug: string };
	chapterNr: number;
	activeLessonId: string;
}) {
	const hasActiveLesson = chapter.content.some(x => x.lessonId === activeLessonId);
	const [open, setOpen] = useState(hasActiveLesson);

	return (
		<section className="flex flex-col rounded-lg bg-gray-100 px-4 py-2">
			<div className="flex items-center justify-between gap-4">
				<span className="flex items-center gap-4">
					<span
						className={`h-8 w-8 rounded-full pt-[6px] text-center text-sm font-semibold ${
							hasActiveLesson
								? "bg-secondary text-white"
								: "bg-indigo-200 text-indigo-600"
						}`}
					>
						{chapterNr}
					</span>
					<div className="flex flex-col">
						<span className="font-semibold">{chapter.title}</span>
						<span className="text-sm text-light">5 / 10</span>
					</div>
				</span>
				<button
					className="rounded-full p-2 hover:bg-gray-200"
					title="Öffnen/Schließen"
					onClick={() => setOpen(v => !v)}
				>
					{open ? (
						<ChevronDownIcon className="h-6 text-light" />
					) : (
						<ChevronLeftIcon className="h-6 text-light" />
					)}
				</button>
			</div>

			<AnimatePresence initial={false}>
				{open && (
					<motion.ul
						initial={{
							height: 0,
							opacity: 0
						}}
						animate={{
							height: "auto",
							opacity: 1,
							transition: {
								height: {
									duration: 0.2
								},
								opacity: {
									duration: 0.25,
									delay: 0
								}
							}
						}}
						exit={{
							height: 0,
							opacity: 0,
							transition: {
								height: {
									duration: 0.2
								},
								opacity: {
									duration: 0.25
								}
							}
						}}
						className="mt-4 flex flex-col gap-1"
					>
						{chapter.content.map(lesson => (
							<Lesson
								key={lesson.lessonId}
								lesson={lesson}
								href={`/courses/${course.slug}/${lesson.lessonId}`}
								isActive={activeLessonId === lesson.lessonId}
							/>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</section>
	);
}

function Lesson({
	lesson,
	isActive,
	href
}: {
	lesson: LessonType;
	isActive: boolean;
	href: string;
}) {
	return (
		<Link href={href}>
			<a
				className={`rounded-lg py-2 px-4 focus:outline-2 focus:outline-secondary ${
					isActive
						? "bg-secondary text-white focus:bg-indigo-300"
						: "bg-gray-200 hover:bg-indigo-200"
				}`}
			>
				<span className="flex">
					{isActive ? (
						<PlayIcon className="-ml-1 mr-2 h-5" />
					) : (
						<span className="w-6 text-sm text-secondary">{lesson.lessonNr}</span>
					)}
					<span className="w-full text-sm">{lesson.title}</span>
					{lesson.lessonNr % 2 === 0 && (
						<CheckCircleIcon className="h-5 text-emerald-500" />
					)}
				</span>
			</a>
		</Link>
	);
}
