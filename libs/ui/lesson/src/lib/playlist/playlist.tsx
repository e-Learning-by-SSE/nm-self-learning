import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import Link from "next/link";
import Image from "next/image";

type Lesson = { title: string; slug: string; imgUrl?: string | null };

export function Playlist({
	lessons,
	currentLesson,
	course,
	subtitle
}: {
	lessons: Lesson[];
	currentLesson: Lesson;
	course: { title: string; slug: string };
	subtitle?: string;
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div
			className={`flex w-full flex-col border-r border-b border-light-border bg-white ${
				collapsed ? "h-fit" : "h-full"
			}`}
		>
			<div className="flex items-center justify-between gap-4 py-3 px-3">
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
					<div className="flex flex-col divide-y divide-neutral-200">
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
	lesson: {
		title: string;
		slug: string;
		imgUrl?: string | null;
	};
	href: string;
	isActive?: boolean;
	isLocked?: boolean;
}) {
	return (
		<Link href={href}>
			<a
				className={`flex h-20 w-full ${
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
				<div className="my-auto grid gap-1 overflow-hidden pl-4 pr-6">
					<span className="max-w-md truncate text-sm font-semibold">{lesson.title}</span>
					<span className="text-sm font-light">4:20</span>
				</div>
			</a>
		</Link>
	);
}
