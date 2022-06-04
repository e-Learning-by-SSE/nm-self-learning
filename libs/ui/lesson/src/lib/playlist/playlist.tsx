import {
	CheckCircleIcon,
	ChevronDoubleDownIcon,
	ChevronDoubleUpIcon,
	ChevronDownIcon,
	ChevronUpIcon
} from "@heroicons/react/solid";
import { useCourseCompletion } from "@self-learning/completion";
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

export function NestablePlaylist({
	course,
	currentLesson,
	content
}: {
	course: { title: string; slug: string };
	currentLesson: PlaylistLesson;
	content: { title: string; lessons: PlaylistLesson[] }[];
}) {
	const courseCompletion = useCourseCompletion(course.slug);
	const { globalCollapsed, collapsedSections, globalCollapseToggle, toggleCollapse } =
		useCollapseToggle(content);

	return (
		<div className="flex h-fit w-full flex-col overflow-hidden bg-white">
			<div className="flex items-center justify-between gap-4 border-b border-light-border p-3">
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
					className="rounded-full p-2 text-light hover:bg-gray-50"
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
						subtitleElement={
							<span className="pl-6 text-sm text-light">
								{chapter.lessons.length} Lerneinheiten
							</span>
						}
						collapsed={collapsedSections[index]}
						toggleOpenClosed={() => toggleCollapse(index)}
						index={index + 1}
						key={chapter.title}
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

export function Playlist({
	index,
	lessons,
	currentLesson,
	course,
	subtitleElement,
	title,
	collapsed,
	toggleOpenClosed
}: {
	index: number;
	title: string;
	lessons: PlaylistLesson[];
	currentLesson: PlaylistLesson;
	course: { title: string; slug: string };
	subtitleElement: ReactElement;
	collapsed: boolean;
	toggleOpenClosed: () => void;
}) {
	return (
		<div className="flex h-fit w-full flex-col bg-white">
			<div className="flex items-center justify-between gap-4 border-b border-light-border py-3 px-3">
				<div className="flex flex-col gap-2">
					<span className="flex gap-3 text-base font-semibold">
						<span>{index}.</span>
						<span>{title}</span>
					</span>
					{subtitleElement}
				</div>

				<button
					className="rounded-full p-2 text-light hover:bg-gray-50"
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
							<Lesson
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

function Lesson({
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
				className={`flex h-20 w-full border-b border-light-border ${
					isActive ? "bg-indigo-500 text-white" : "bg-transparent hover:bg-indigo-100"
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
					<span className="flex items-center justify-between gap-2">
						<span className="text-sm font-light">4:20</span>
						{lesson.isCompleted && (
							<CheckCircleIcon
								className="
						 h-6 rounded-full bg-white text-secondary"
							/>
						)}
					</span>
				</div>
			</a>
		</Link>
	);
}
