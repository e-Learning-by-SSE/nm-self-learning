import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import Link from "next/link";
import { PropsWithChildren } from "react";

export function SectionConnector({
	isUnlocked,
	unlockRequired
}: {
	isUnlocked: boolean;
	unlockRequired: boolean;
}) {
	let bgColor = "bg-slate-200";
	let textColor = "text-slate-200";

	if (isUnlocked) {
		bgColor = "bg-green-500";
		textColor = "text-green-500";
	}

	return (
		<>
			<div className="w-[2px] pt-1">
				<div className={`h-12 ${bgColor}`}></div>
			</div>
			{unlockRequired ? (
				isUnlocked ? (
					<CheckCircleIcon className={`h-10 ${textColor}`} />
				) : (
					<XCircleIcon className={`h-10 ${textColor}`} />
				)
			) : (
				<div className="w-[2px]">
					<div className={`h-10 ${bgColor}`}></div>
				</div>
			)}
			<div className="w-[2px] pb-1">
				<div className={`h-12 ${bgColor}`}></div>
			</div>
		</>
	);
}

export function Section({
	children,
	isUnlocked,
	unlockRequired
}: PropsWithChildren<{ isUnlocked: boolean; unlockRequired: boolean }>) {
	let borderColor = "border-slate-200";

	if (isUnlocked) {
		borderColor = "border-green-500";
	}

	return (
		<div className={`flex w-full flex-col rounded-lg border-2 bg-white p-8 ${borderColor}`}>
			{children}
		</div>
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
	title,
	description,
	lessons
}: {
	title: string;
	description?: string;
	lessons: { title: string; slug: string; isCompleted: boolean }[];
}) {
	return (
		<>
			<h3 className="mb-8 text-xl">{title}</h3>
			{description && description.length > 0 && (
				<p className="text-slate-400">{description}</p>
			)}
			<ul className="mt-8 flex flex-col gap-2">
				{lessons.map(lesson => (
					<Link href={`/lessons/${lesson.slug}`} key={lesson.slug}>
						<a>
							<li
								className={`flex items-center justify-between gap-8 rounded-r-lg border-l-2 bg-gray-50 px-3 py-2 ${
									lesson.isCompleted ? "border-green-500" : "border-slate-200"
								}`}
							>
								<span className="text-sm font-semibold">{lesson.title}</span>
								<CheckCircleIcon className="h-6 shrink-0 text-green-500" />
							</li>
						</a>
					</Link>
				))}
			</ul>
		</>
	);
}
