import {
	CheckCircleIcon,
	ChevronDoubleDownIcon,
	ChevronDoubleUpIcon,
	ChevronDownIcon,
	ChevronUpIcon
} from "@heroicons/react/solid";
import { CourseCompletionX } from "@self-learning/completion";
import {
	CourseChapter,
	CourseLesson,
	LessonMeta,
	traverseCourseContent
} from "@self-learning/types";
import { formatSeconds } from "@self-learning/util/common";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactElement } from "react";
import { useCollapseToggle } from "./use-collapse-toggle";

type PlaylistLesson = CourseLesson & {
	title: string;
	slug: string;
	meta: LessonMeta;
	isCompleted?: boolean;
};

type PlaylistChapter = CourseChapter & {
	content: PlaylistContent;
};

export type PlaylistContent = (PlaylistLesson | PlaylistChapter)[];

export function NestablePlaylist({
	course,
	currentLesson,
	content,
	courseCompletion
}: {
	course: { title: string; slug: string };
	currentLesson: { slug: string; lessonId: string };
	content: PlaylistContent;
	courseCompletion?: CourseCompletionX;
}) {
	const { globalCollapsed, collapsedSections, globalCollapseToggle, toggleCollapse } =
		useCollapseToggle(content);

	return (
		<div className="flex h-full w-full flex-col overflow-hidden border-l border-t border-l-light-border border-t-light-border bg-white xl:border-t-0">
			<div className="grid grid-cols-[1fr_auto] border-b border-light-border p-4">
				<div className="flex flex-col gap-2">
					<span className="text-base font-semibold">{course.title}</span>
					<span className="text-sm text-light">
						Fortschritt:{" "}
						{courseCompletion?.completion["course"].completionPercentage ?? 0}%
					</span>
				</div>

				<button
					onClick={() => globalCollapseToggle(prev => !prev)}
					title="Open/Close All Sections"
					className="self-center rounded-full p-2 text-light hover:bg-gray-50"
				>
					{globalCollapsed ? (
						<ChevronDoubleDownIcon className="h-6" />
					) : (
						<ChevronDoubleUpIcon className="h-6" />
					)}
				</button>
			</div>

			<div className="playlist-scroll overflow-auto">
				{content.map(chapterOrLesson =>
					chapterOrLesson.type === "chapter" ? (
						<Playlist
							key={chapterOrLesson.chapterNr}
							chapter={chapterOrLesson}
							subtitleElement={<PlaylistSubtitle chapter={chapterOrLesson} />}
							collapsedSections={collapsedSections}
							collapsed={collapsedSections[chapterOrLesson.chapterNr] === true}
							toggleCollapse={toggleCollapse}
							isActive={false}
							course={course}
							currentLesson={currentLesson}
						/>
					) : (
						<PlaylistLesson
							key={chapterOrLesson.lessonId}
							href={`/courses/${course.slug}/${chapterOrLesson.slug}`}
							lesson={chapterOrLesson}
							isActive={currentLesson.lessonId === chapterOrLesson.lessonId}
						/>
					)
				)}
			</div>
		</div>
	);
}

export function PlaylistSubtitle({ chapter }: { chapter: PlaylistChapter }) {
	let lessonCount = 0;

	traverseCourseContent(chapter.content, chapterOrLesson => {
		if (chapterOrLesson.type === "lesson") {
			lessonCount++;
		}
	});

	return (
		<span className="text-sm text-light">
			{lessonCount === 1 ? "1 Lerneinheit" : `${lessonCount} Lerneinheiten`}
		</span>
	);
}

export function Playlist({
	course,
	currentLesson,
	chapter,
	subtitleElement,
	isActive,
	collapsed,
	toggleCollapse,
	collapsedSections
}: {
	chapter: PlaylistChapter;
	currentLesson: { slug: string; lessonId: string };
	course: { title: string; slug: string };
	subtitleElement: ReactElement;
	isActive: boolean;
	collapsed: boolean;
	toggleCollapse: (chapterNr: string) => void;
	collapsedSections: { [chapterNr: string]: boolean };
}) {
	return (
		<div className="flex h-fit w-full flex-col bg-white">
			<div className="grid grid-cols-[auto_1fr_auto] items-start gap-2 border-b border-light-border bg-gray-100 p-4">
				<span className="min-w-[32px]">{chapter.chapterNr}</span>
				<div className="flex flex-col gap-2">
					<span className="flex items-center gap-2 text-base font-semibold">
						<span className="text-secondary">{chapter.title}</span>
						{isActive && <div className="h-2 w-2 rounded-full bg-secondary" />}
					</span>
					{subtitleElement}
				</div>
				<button
					className="self-center rounded-full p-2 text-light hover:bg-gray-50"
					title="Show/Hide Section"
					onClick={() => toggleCollapse(chapter.chapterNr)}
				>
					{collapsed ? (
						<ChevronDownIcon className="h-6" />
					) : (
						<ChevronUpIcon className="h-6" />
					)}
				</button>
			</div>
			{!collapsed && (
				<div className="playlist-scroll overflow-auto">
					<div className="flex flex-col">
						{chapter.content.map(chapterOrLesson =>
							chapterOrLesson.type === "chapter" ? (
								<Playlist
									key={chapterOrLesson.chapterNr}
									course={course}
									isActive={false}
									collapsedSections={collapsedSections}
									toggleCollapse={toggleCollapse}
									chapter={chapterOrLesson as PlaylistChapter}
									subtitleElement={
										<PlaylistSubtitle
											chapter={chapterOrLesson as PlaylistChapter}
										/>
									}
									collapsed={
										collapsedSections[chapterOrLesson.chapterNr] === true
									}
									currentLesson={currentLesson}
								/>
							) : (
								<PlaylistLesson
									key={chapterOrLesson.lessonId}
									href={`/courses/${course.slug}/${
										(chapterOrLesson as PlaylistLesson).slug
									}`}
									lesson={chapterOrLesson as PlaylistLesson}
									isActive={currentLesson.lessonId === chapterOrLesson.lessonId}
								/>
							)
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export function PlaylistLesson({
	lesson,
	isActive,
	href
}: {
	lesson: PlaylistLesson;
	href: string;
	isActive?: boolean;
}) {
	const duration =
		lesson.meta.mediaTypes.video?.duration ?? lesson.meta.mediaTypes.article?.estimatedDuration;

	return (
		<Link href={href}>
			<a
				title={lesson.title}
				className={`relative flex w-full border-b border-light-border bg-white hover:bg-indigo-50 focus:outline-0 focus:ring-0  focus-visible:bg-indigo-100 ${
					isActive ? "bg-indigo-50" : ""
				}`}
			>
				{isActive && (
					<motion.span
						layoutId="activeLesson"
						className="absolute h-full w-1 bg-secondary"
					></motion.span>
				)}
				<div className="relative flex w-full overflow-hidden py-2 pr-4">
					<div className="flex flex-col items-start px-4 text-center">
						<span
							className={`mx-auto my-auto w-6 text-xs ${
								isActive ? "text-light" : "text-light"
							}`}
						>
							{lesson.lessonNr}
						</span>
					</div>
					<div className="flex flex-col gap-1">
						<span
							className={`truncate text-sm font-medium ${
								isActive ? "text-secondary" : ""
							}`}
						>
							{lesson.title}
						</span>
						<span className="flex  gap-2 text-xs text-light">
							{lesson.isCompleted && (
								<CheckCircleIcon className="h-4 shrink-0 rounded-full text-secondary" />
							)}
							{duration ? formatSeconds(duration) : "??:??"}
						</span>
					</div>
				</div>
			</a>
		</Link>
	);
}
