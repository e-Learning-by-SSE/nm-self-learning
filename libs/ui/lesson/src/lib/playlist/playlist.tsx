import {
	CheckCircleIcon,
	ChevronDoubleDownIcon,
	ChevronDoubleUpIcon,
	ChevronDownIcon,
	ChevronUpIcon
} from "@heroicons/react/solid";
import { CourseCompletion } from "@self-learning/types";
import Image from "next/image";
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
			<div className="grid grid-cols-[32px_1fr_auto] items-start border-b border-light-border p-4">
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
						{lessons.map(lesson => (
							<PlaylistLesson
								key={lesson.slug}
								href={`/courses/${course.slug}/${lesson.slug}`}
								lesson={lesson}
								isActive={currentLesson.slug === lesson.slug}
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
	isLocked
}: {
	lesson: PlaylistLesson;
	href: string;
	isActive?: boolean;
	isLocked?: boolean;
}) {
	return (
		<Link href={href}>
			<a
				title={lesson.title}
				className={`flex h-20 w-full border-b border-light-border focus:outline-0 focus:ring-0 focus-visible:bg-indigo-100 ${
					isActive
						? "bg-indigo-500 text-white focus-visible:bg-indigo-300"
						: "bg-white hover:bg-indigo-100 focus-visible:bg-indigo-100"
				}`}
			>
				<div className="relative aspect-square h-full">
					{lesson.imgUrl ? (
						<Image layout="fill" className="bg-white" src={lesson.imgUrl} alt="" />
					) : (
						<div className="h-full w-full bg-neutral-500"></div>
					)}
				</div>
				<div className="relative my-auto grid w-full gap-1 overflow-hidden pl-4 pr-6">
					<span className="max-w-md truncate text-sm font-semibold">{lesson.title}</span>
					<span className="flex items-center gap-2">
						<span className="text-sm font-light">4:20</span>
						{lesson.isCompleted && (
							<CheckCircleIcon
								className={`h-5 rounded-full ${
									isActive ? "text-white" : "bg-white text-secondary"
								}`}
							/>
						)}
					</span>
				</div>
			</a>
		</Link>
	);
}
