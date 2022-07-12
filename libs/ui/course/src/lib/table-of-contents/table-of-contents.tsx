import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";
import {
	ImageCard,
	ImageCardBadge,
	SectionCard,
	SectionCardHeader
} from "@self-learning/ui/common";
import Link from "next/link";

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

export function SingleLesson({ title, slug }: { title: string; slug: string }) {
	return (
		<div className="flex rounded-lg border border-light-border bg-white py-2 px-4">
			<Link href={`/lessons/${slug}`}>
				<a className="font-medium">{title}</a>
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

export function Chapter({ courseSlug, chapter }: { courseSlug: string; chapter: ToCChapter }) {
	return (
		<li className="flex flex-col gap-4 rounded-lg border border-light-border p-4">
			<span className="flex items-center gap-8 text-xl">
				<span className="text-light">{chapter.chapterNr}</span>
				<span className="font-semibold tracking-tighter">{chapter.title}</span>
			</span>

			{chapter.description && chapter.description.length > 0 && (
				<p className="text-sm text-light">{chapter.description}</p>
			)}

			<ul className="flex flex-col gap-2">
				{chapter.content.map((chapterOrLesson, index) =>
					chapterOrLesson.type === "chapter" ? (
						<Chapter chapter={chapterOrLesson} courseSlug={courseSlug} key={index} />
					) : (
						<Lesson href="" lesson={chapterOrLesson} key={index} />
					)
				)}
			</ul>
		</li>
	);
}

function Lesson({ lesson, href }: { href: string; lesson: TocLesson }) {
	return (
		<li
			className={`flex items-center justify-between gap-8 rounded-lg py-2 px-3 ${
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
