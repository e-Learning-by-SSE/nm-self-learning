import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	PlayIcon
} from "@heroicons/react/solid";
import { Completion, CourseCompletion, LessonMeta } from "@self-learning/types";
import { Divider } from "@self-learning/ui/common";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export type PlaylistChapter = {
	title: string;
	content: PlaylistLesson[];
};

export type PlaylistLesson = {
	lessonNr: number;
	lessonId: string;
	slug: string;
	title: string;
	meta: LessonMeta;
	isCompleted: boolean;
};

export type PlaylistContent = PlaylistChapter[];

type PlaylistProps = {
	lesson: {
		lessonId: string;
		slug: string;
		title: string;
	};
	content: PlaylistContent;
	course: {
		title: string;
		slug: string;
	};
	completion?: CourseCompletion;
};

export function Playlist({ content, course, lesson, completion }: PlaylistProps) {
	const [contentWithCompletion, setContentWithCompletion] = useState(content);

	useEffect(() => {
		if (!completion) {
			return;
		}

		for (const chapter of content) {
			for (const lesson of chapter.content) {
				lesson.isCompleted = !!completion.completedLessons[lesson.lessonId];
			}
		}

		setContentWithCompletion([...content]);
	}, [completion, content]);

	return (
		<aside className="w-full px-4 xl:max-w-[500px]">
			<PlaylistHeader
				content={content}
				course={course}
				lesson={lesson}
				completion={completion}
			/>
			<div className="playlist-scroll mt-4 flex flex-col gap-4">
				{contentWithCompletion.map((chapter, index) => (
					<Chapter
						key={index}
						chapterNr={index + 1}
						chapter={chapter}
						activeLessonId={lesson.lessonId}
						course={course}
						completion={completion?.chapterCompletion[index]}
					/>
				))}
			</div>
		</aside>
	);
}

function PlaylistHeader({ content, course, lesson, completion }: PlaylistProps) {
	const courseCompletion = completion?.courseCompletion;
	const completionPercentage = courseCompletion?.completionPercentage ?? 0;

	return (
		<div className="flex flex-col gap-4 rounded-lg bg-gray-100 p-4">
			<div className="flex flex-col gap-2">
				<Link href={`/courses/${course.slug}`}>
					<a className="heading text-2xl" title={course.title}>
						{course.title}
					</a>
				</Link>
				<span className="text-sm text-light">
					{courseCompletion?.completedLessonCount} / {courseCompletion?.lessonCount}{" "}
					Lerneinheiten abgeschlossen
				</span>
			</div>
			<span className="relative h-5 w-full rounded-lg bg-indigo-100">
				<motion.span
					className="absolute left-0 h-5 rounded-lg bg-secondary"
					initial={{ width: 0 }}
					animate={{ width: `${completionPercentage}%` }}
					transition={{ type: "tween" }}
				></motion.span>
				<span
					className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
						completionPercentage === 0 ? "text-secondary" : "text-white"
					}`}
				>
					{completionPercentage}%
				</span>
			</span>

			<Divider />

			<CurrentlyPlaying lesson={lesson} content={content} course={course} />
		</div>
	);
}

function CurrentlyPlaying({ lesson, content, course }: PlaylistProps) {
	const router = useRouter();
	const { previous, next } = useMemo(() => {
		const flatLessons = content.flatMap(chapter => chapter.content);
		const lessonIndex = flatLessons.findIndex(l => l.lessonId === lesson.lessonId);

		return {
			previous: lessonIndex > 0 ? flatLessons[lessonIndex - 1] : null,
			next: lessonIndex < flatLessons.length - 1 ? flatLessons[lessonIndex + 1] : null
		};
	}, [content, lesson]);

	function navigateToLesson(lesson: PlaylistLesson) {
		router.push(`/courses/${course.slug}/${lesson.slug}`);
	}

	return (
		<div className="flex flex-col gap-4">
			<span className="flex gap-2">
				<PlayIcon className="h-5" />
				<span className="text-sm font-medium">{lesson.title}</span>
			</span>
			<span className="flex justify-between">
				<button className="btn-primary text-sm">Lernkontrolle</button>
				<span className="flex gap-2">
					<button
						onClick={() => previous && navigateToLesson(previous)}
						disabled={!previous}
						className="rounded-lg border border-light-border p-2 disabled:text-light"
						title="Vorherige Lerneinheit"
					>
						<ChevronDoubleLeftIcon className="h-5" />
					</button>
					<button
						onClick={() => next && navigateToLesson(next)}
						disabled={!next}
						className="rounded-lg border border-light-border p-2 disabled:text-light"
						title="Nächste Lerneinheit"
					>
						<ChevronDoubleRightIcon className="h-5" />
					</button>
				</span>
			</span>
		</div>
	);
}

function Chapter({
	chapter,
	chapterNr,
	course,
	activeLessonId,
	completion
}: {
	chapter: PlaylistChapter;
	course: { slug: string };
	chapterNr: number;
	activeLessonId: string;
	completion?: Completion;
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
								: "bg-indigo-100 text-indigo-600"
						}`}
					>
						{chapterNr}
					</span>
					<div className="flex flex-col">
						<span className="font-semibold">{chapter.title}</span>
						<span className="text-sm text-light">
							{completion?.completedLessonCount ?? 0} /{" "}
							{completion?.lessonCount ?? "?"}
						</span>
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
						className="flex flex-col gap-1"
					>
						{chapter.content.length > 0 ? (
							chapter.content.map(lesson => (
								<Lesson
									key={lesson.lessonId}
									lesson={lesson}
									href={`/courses/${course.slug}/${lesson.slug}`}
									isActive={activeLessonId === lesson.lessonId}
								/>
							))
						) : (
							<p className="pt-4 pb-2 text-sm text-light">
								Dieses Kapitel enthält keine Lerneinheiten.
							</p>
						)}
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
	lesson: PlaylistLesson;
	isActive: boolean;
	href: string;
}) {
	return (
		<Link href={href}>
			<a
				title={lesson.title}
				className={`rounded-r-lg border-l-4 py-2 px-4 first:mt-2 last:mb-2 focus:outline-2 focus:outline-secondary ${
					lesson.isCompleted ? "border-emerald-500" : "border-gray-300"
				} ${isActive ? "bg-secondary text-white" : "bg-gray-200 hover:bg-indigo-100"}`}
			>
				<span className="flex">
					{isActive ? (
						<PlayIcon className="-ml-1 mr-2 h-5 shrink-0" />
					) : (
						<span className="w-6 shrink-0 text-sm text-secondary">
							{lesson.lessonNr}
						</span>
					)}
					<span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
						{lesson.title}
					</span>
				</span>
			</a>
		</Link>
	);
}
