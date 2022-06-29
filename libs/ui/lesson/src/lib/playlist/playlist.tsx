import {
	CheckCircleIcon,
	ChevronDoubleDownIcon,
	ChevronDoubleUpIcon,
	ChevronDownIcon,
	ChevronUpIcon
} from "@heroicons/react/solid";
import { CourseCompletion } from "@self-learning/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactElement } from "react";
import { useCollapseToggle } from "./use-collapse-toggle";

export type PlaylistLesson = {
	title: string;
	slug: string;
	lessonId: string;
	isCompleted?: boolean;
	imgUrl?: string | null;
};

type PlaylistContent = { title: string; lessons: PlaylistLesson[]; isActive: boolean };

export function NestablePlaylist({
	course,
	currentLesson,
	content,
	courseCompletion
}: {
	course: { title: string; slug: string };
	currentLesson: PlaylistLesson;
	content: PlaylistContent[];
	courseCompletion?: CourseCompletion;
}) {
	const { globalCollapsed, collapsedSections, globalCollapseToggle, toggleCollapse } =
		useCollapseToggle(content);

	return (
		<div className="flex h-full w-full flex-col overflow-hidden border-l border-t border-l-light-border border-t-light-border bg-white xl:border-t-0">
			<div className="grid grid-cols-[1fr_auto] border-b border-light-border p-4">
				<div className="flex flex-col gap-2">
					<span className="text-base font-semibold">{course.title}</span>
					<span className="text-sm text-light">
						Fortschritt: {Math.floor(courseCompletion?.courseCompletionPercentage ?? 0)}
						%
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
				{content.map((chapter, index) => (
					<Playlist
						subtitleElement={<PlaylistSubtitle chapter={chapter} />}
						collapsed={collapsedSections[index]}
						toggleOpenClosed={() => toggleCollapse(index)}
						index={index + 1}
						key={chapter.title}
						isActive={chapter.isActive}
						title={chapter.title}
						course={course}
						lessons={chapter.lessons}
						currentLesson={currentLesson}
					/>
				))}
			</div>
		</div>
	);
}

export function PlaylistSubtitle({ chapter }: { chapter: PlaylistContent }) {
	return (
		<span className="text-sm text-light">
			{chapter.lessons.length === 1
				? "1 Lerneinheit"
				: `${chapter.lessons.length} Lerneinheiten`}
		</span>
	);
}

export function Playlist({
	index,
	lessons,
	currentLesson,
	course,
	subtitleElement,
	title,
	isActive,
	collapsed,
	toggleOpenClosed
}: {
	index: number;
	title: string;
	lessons: PlaylistLesson[];
	currentLesson: PlaylistLesson;
	course: { title: string; slug: string };
	subtitleElement: ReactElement;
	isActive: boolean;
	collapsed: boolean;
	toggleOpenClosed: () => void;
}) {
	return (
		<div className="flex h-fit w-full flex-col bg-white">
			<div className="grid grid-cols-[32px_1fr_auto] items-start border-b border-light-border bg-gray-100 p-4">
				<span className="text-base font-semibold">{index}.</span>
				<div className="flex flex-col gap-2">
					<span className="flex items-center gap-2 text-base font-semibold">
						<span>{title}</span>
						{isActive && <div className="h-2 w-2 rounded-full bg-secondary" />}
					</span>
					{subtitleElement}
				</div>
				<button
					className="self-center rounded-full p-2 text-light hover:bg-gray-50"
					title="Show/Hide Section"
					onClick={toggleOpenClosed}
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
						{lessons.map((lesson, index) => (
							<PlaylistLesson
								key={lesson.slug}
								href={`/courses/${course.slug}/${lesson.slug}`}
								lesson={lesson}
								isActive={currentLesson.slug === lesson.slug}
								lessonNumber={index + 1}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export function PlaylistLesson({
	lesson,
	isActive,
	href,
	lessonNumber
}: {
	lesson: PlaylistLesson;
	href: string;
	lessonNumber: number;
	isActive?: boolean;
}) {
	return (
		<Link href={href}>
			<a
				title={lesson.title}
				className={`relative flex w-full border-b border-light-border hover:bg-indigo-50 focus:outline-0 focus:ring-0  focus-visible:bg-indigo-100 ${
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
							{lessonNumber}
						</span>
					</div>
					<div>
						<span
							className={`max-w-md truncate align-top text-sm font-medium ${
								isActive ? "text-secondary" : ""
							}`}
						>
							{lesson.title}
						</span>
						<span className="flex gap-2">
							<span className="text-xs text-light">4:20</span>
							{lesson.isCompleted && (
								<CheckCircleIcon
									className={`h-4 rounded-full ${
										isActive ? "text-white" : "bg-white text-secondary"
									}`}
								/>
							)}
						</span>
					</div>
				</div>
			</a>
		</Link>
	);
}
