import { useState } from "react";
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import Link from "next/link";
import Image from "next/image";

export type PlaylistLesson = {
	title: string;
	slug: string;
	lessonId: string;
	isCompleted?: boolean;
	imgUrl?: string | null;
};

export function Playlist({
	lessons,
	currentLesson,
	course,
	subtitle
}: {
	lessons: PlaylistLesson[];
	currentLesson: PlaylistLesson;
	course: { title: string; slug: string };
	subtitle?: string;
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div className={`flex w-full flex-col bg-white ${collapsed ? "h-fit" : "h-full"}`}>
			<div className="flex items-center justify-between gap-4 border-b border-light-border py-3 px-3">
				<div className="flex flex-col gap-1">
					<span className="text-base font-semibold">{course.title}</span>
					{subtitle && <span className="text-sm">{subtitle}</span>}
				</div>

				<button
					className="rounded-full p-2 hover:bg-gray-50"
					title="Show/Hide Playlist"
					onClick={() => setCollapsed(previous => !previous)}
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
