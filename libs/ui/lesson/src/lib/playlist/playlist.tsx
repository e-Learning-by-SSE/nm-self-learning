import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import Link from "next/link";
import Image from "next/image";

type Lesson = { title: string; slug: string; imgUrl?: string };

export function Playlist({
	lessons,
	currentLesson,
	course,
	chapter
}: {
	lessons: Lesson[];
	currentLesson: Lesson;
	course: {
		title: string;
	};
	chapter: {
		title: string;
	};
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div
			className={`flex w-full flex-col border border-white bg-white bg-opacity-75 backdrop-blur ${
				collapsed ? "h-fit" : "h-full"
			}`}
		>
			<div className="flex items-center justify-between gap-4 py-3 px-3">
				<div className="flex flex-col gap-1">
					<span className="text-base font-semibold">{course.title}</span>
					<span className="text-sm">{chapter.title}</span>
				</div>

				<button
					className="rounded-full p-2 hover:bg-neutral-200"
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
	isLocked
}: {
	lesson: {
		title: string;
		slug: string;
		imgUrl?: string;
	};
	isActive?: boolean;
	isLocked?: boolean;
}) {
	return (
		<Link href={`/lessons/${lesson.slug}`}>
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
				<div className="flex w-full items-center gap-3 overflow-hidden px-3">
					{/* {isActive && <PlayIcon className="h-6 shrink-0" />}
					{isLocked && <LockClosedIcon className="h-6 shrink-0" />} */}
					<div className="max-w-md truncate text-sm font-semibold">{lesson.title}</div>
				</div>
			</a>
		</Link>
	);
}
