import {
	CheckCircleIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	XCircleIcon
} from "@heroicons/react/solid";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import Link from "next/link";
import { useState } from "react";

type TocLesson = {
	type: "lesson";
	lessonNr: number;
	title: string;
	lessonId: string;
	slug: string;
	isCompleted: boolean;
};

type ToCChapter = {
	type: "chapter";
	chapterNr: string;
	description: string | null;
	title: string;
	content: (TocLesson | ToCChapter)[];
};

export type ToCContent = (TocLesson | ToCChapter)[];

export function SectionConnector({
	isCompleted,
	isRequired
}: {
	isCompleted: boolean;
	isRequired: boolean;
}) {
	let bgColor = "bg-slate-200";
	let textColor = "text-slate-200";

	if (isCompleted) {
		bgColor = "bg-secondary";
		textColor = "text-secondary";
	}

	return (
		<>
			<div className="w-[1px] pt-1">
				<div className={`h-12 ${bgColor}`}></div>
			</div>
			{isRequired ? (
				isCompleted ? (
					<CheckCircleIcon className={`h-10 ${textColor}`} />
				) : (
					<XCircleIcon className={`h-10 ${textColor}`} />
				)
			) : (
				<div className="w-[1px]">
					<div className={`h-10 ${bgColor}`}></div>
				</div>
			)}
			<div className="w-[1px] pb-1">
				<div className={`h-12 ${bgColor}`}></div>
			</div>
		</>
	);
}

export function SingleLesson({ lesson, courseSlug }: { lesson: TocLesson; courseSlug: string }) {
	return (
		<div className="flex rounded-lg border border-light-border bg-white py-2 px-4">
			<Link href={`/courses/${courseSlug}/lessons/${lesson.slug}`}>
				<a className="flex gap-2 text-sm">
					<span className="min-w-[32px] text-light">{lesson.lessonNr}</span>
					<span className="font-medium">{lesson.title}</span>
				</a>
			</Link>
		</div>
	);
}

export function NestedCourse({
	title,
	slug,
	description,
	course
}: {
	title: string;
	slug: string;
	description?: string;
	course: {
		title: string;
		subtitle: string;
		imgUrl?: string;
	};
}) {
	return (
		<div className="flex flex-col gap-8">
			<h3 className="text-xl">{title}</h3>
			{description && description.length > 0 && (
				<p className="text-slate-400">{description}</p>
			)}
			<Link href={`/courses/${slug}`}>
				<a className="max-w-sm">
					<ImageCard
						slug={slug}
						title={course.title}
						subtitle={course.subtitle}
						imgUrl={course.imgUrl}
						badge={<ImageCardBadge text="In Bearbeitung" className="bg-indigo-500" />}
					/>
				</a>
			</Link>
		</div>
	);
}

export function Chapter({
	courseSlug,
	chapter,
	depth
}: {
	courseSlug: string;
	chapter: ToCChapter;
	depth: number;
}) {
	const [collapsed, setCollapsed] = useState(false);
	const hasLessonsOnThisLevel = chapter.content.some(c => c.type === "lesson");

	return (
		<li
			className={`flex flex-col gap-4 rounded-lg  border-light-border ${
				depth === 0 ? "p-4" : "py-4 pl-4"
			} ${hasLessonsOnThisLevel ? "border bg-white" : "bg-gray-100"}`}
		>
			<span className="flex justify-between gap-4">
				<span className="flex items-center gap-8 text-xl">
					<span className="text-light">{chapter.chapterNr}</span>
					<span className="font-semibold tracking-tighter text-secondary">
						{chapter.title}
					</span>
				</span>
				<button
					title="Aufklappen/Zuklappen"
					className={`rounded-full p-2 text-gray-400 hover:bg-gray-50 ${
						depth > 0 ? "mr-4" : ""
					}`}
					onClick={() => setCollapsed(v => !v)}
				>
					{collapsed ? (
						<ChevronLeftIcon className="h-6 " />
					) : (
						<ChevronDownIcon className="h-6 " />
					)}
				</button>
			</span>

			{chapter.description && chapter.description.length > 0 && (
				<p className="text-sm text-light">{chapter.description}</p>
			)}

			{!collapsed && (
				<ul className="flex flex-col">
					{chapter.content.map((chapterOrLesson, index) =>
						chapterOrLesson.type === "chapter" ? (
							<div key={index} className="mb-4 pl-8 last:mb-0">
								<Chapter
									depth={depth + 1}
									chapter={chapterOrLesson}
									courseSlug={courseSlug}
									key={index}
								/>
							</div>
						) : (
							<Lesson
								href={`courses/${courseSlug}/${chapterOrLesson.slug}`}
								lesson={chapterOrLesson}
								key={index}
							/>
						)
					)}
				</ul>
			)}
		</li>
	);
}

function Lesson({ lesson, href }: { href: string; lesson: TocLesson }) {
	return (
		<li
			className={`mr-4 flex items-center justify-between gap-8 rounded-lg py-2 px-3 odd:bg-gray-50 ${
				lesson.isCompleted ? "border-secondary" : "border-slate-200"
			}`}
		>
			<span className="flex items-center gap-4">
				{/* <CheckCircleIcon
					className={`h-5 shrink-0 ${
						lesson.isCompleted ? "text-secondary" : "text-slate-300"
					}`}
				/> */}
				<Link href={href}>
					<a className="flex gap-2 text-sm">
						<span className="min-w-[32px] text-light">{lesson.lessonNr}</span>
						<span className="font-medium">{lesson.title}</span>
					</a>
				</Link>
			</span>

			<span className="text-sm text-light">4:20</span>
		</li>
	);
}
