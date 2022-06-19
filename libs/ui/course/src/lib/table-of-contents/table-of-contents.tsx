import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";
import {
	ImageCard,
	ImageCardBadge,
	SectionCard,
	SectionCardHeader
} from "@self-learning/ui/common";
import Link from "next/link";

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
		<div className="flex">
			<Link href={`/lessons/${slug}`}>
				<a>
					<h3 className="text-xl">{title}</h3>
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
	title,
	description,
	lessons
}: {
	courseSlug: string;
	title: string;
	description?: string | null;
	lessons: { title: string; slug: string; lessonId: string; isCompleted: boolean }[];
}) {
	return (
		<SectionCard>
			<SectionCardHeader title={title} subtitle={description} />
			<ul className="flex flex-col gap-2">
				{lessons.map(lesson => (
					<Lesson
						lesson={lesson}
						href={`/courses/${courseSlug}/${lesson.slug}`}
						key={lesson.lessonId}
					/>
				))}
			</ul>
		</SectionCard>
	);
}

function Lesson({
	lesson,
	href
}: {
	href: string;
	lesson: { title: string; slug: string; lessonId: string; isCompleted: boolean };
}) {
	return (
		<li
			className={`flex items-center justify-between gap-8 rounded-r-lg bg-gray-50 px-3 py-2 ${
				lesson.isCompleted ? "border-secondary" : "border-slate-200"
			}`}
		>
			<span className="flex items-center gap-4">
				<CheckCircleIcon
					className={`h-5 shrink-0 ${
						lesson.isCompleted ? "text-secondary" : "text-slate-300"
					}`}
				/>
				<Link href={href}>
					<a className="text-sm font-medium">{lesson.title}</a>
				</Link>
			</span>

			<span className="text-sm text-light">4:20</span>
		</li>
	);
}
