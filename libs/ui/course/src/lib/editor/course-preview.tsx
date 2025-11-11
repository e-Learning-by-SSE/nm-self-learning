import { useCourseCompletion } from "@self-learning/completion";
import { AuthorsList, AuthorProps } from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredSection, useAuthentication } from "@self-learning/ui/layouts";
import { formatSeconds } from "@self-learning/util/common";
import Image from "next/image";
import Link from "next/link";
import { DynCourseModel } from "@self-learning/teaching";
import { Summary } from "@self-learning/types";
import { useTranslation } from "next-i18next";

export function CoursePreview({
	course,
	content,
	summary
}: {
	course: DynCourseModel;
	content: ToC.Content;
	summary: Summary;
}) {
	return (
		<CenteredSection className="bg-gray-50">
			<Course course={course} content={content} summary={summary} />
		</CenteredSection>
	);
}

function Course({
	course,
	summary,
	content
}: {
	course: DynCourseModel;
	summary: Summary;
	content: ToC.Content;
}) {
	const hasContent = content.length > 0;
	const hasTeachingGoal = course.teachingGoals.length > 0;

	let mappedAuthors: AuthorProps[] = [];

	if (course) {
		mappedAuthors = course.authors.map(a => ({
			displayName: a.displayName ?? "Unknown",
			slug: a.slug ?? a.username,
			imgUrl: a.imgUrl ?? null
		}));
	}

	return (
		<section className="flex flex-col gap-16">
			<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
				<div className="flex flex-col justify-between gap-12">
					<div className="flex min-w-[50%] flex-col-reverse gap-12 md:flex-col">
						<div>
							<h1 className="mb-12 text-4xl md:text-6xl">{course.title}</h1>
							{course.subtitle && (
								<div className="text-lg tracking-tight text-light">
									{course.subtitle}
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<AuthorsList authors={mappedAuthors} />
					</div>
				</div>

				<div className="flex w-full flex-col gap-4 rounded-lg ">
					<div className="relative h-64 w-full shrink-0 grow ">
						{course.imgUrl && (
							<Image
								priority
								className="shrink-0 rounded-lg bg-white object-cover"
								src={course.imgUrl}
								fill={true}
								sizes="600px"
								alt=""
							></Image>
						)}
						{hasContent && hasTeachingGoal && (
							<ul className="absolute bottom-0 grid w-full grid-cols-3 divide-x divide-secondary rounded-b-lg border border-light-border border-t-transparent bg-white bg-opacity-80 p-2 text-center">
								<li className="flex flex-col">
									<span className="font-semibold text-secondary">
										Lerneinheiten
									</span>
									<span className="text-light">{summary.lessons}</span>
								</li>
								<li className="flex flex-col">
									<span className="font-semibold text-secondary">Kapitel</span>
									<span className="text-light">{summary.chapters}</span>
								</li>
								<li className="flex flex-col">
									<span className="font-semibold text-secondary">Dauer</span>
									<span className="text-light">
										{formatSeconds(summary.duration)}
									</span>
								</li>
							</ul>
						)}
					</div>
				</div>
			</div>
			{hasTeachingGoal ? (
				<TableOfContents content={content} course={course} />
			) : (
				<Warning title="noTeachingGoalTitle" description="noTeachingGoalDescription" />
			)}
		</section>
	);
}

function Warning({ title, description }: { title: string; description: string }) {
	const { t } = useTranslation("kee");
	return (
		<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
			<h3 className="heading flex gap-4 text-2xl">
				<span className="text-secondary">{t(title)}</span>
			</h3>
			<span className="mt-4 text-light">{t(description)}</span>
		</div>
	);
}

function TableOfContents({ content, course }: { content: ToC.Content; course: DynCourseModel }) {
	const { t } = useTranslation("kee");
	const hasContent = content.length > 0;

	if (!hasContent) {
		return <Warning title="noCoursePathTitle" description="noCoursePathDescription" />;
	}

	return (
		<section className="flex flex-col gap-8">
			<h2 className="mb-4 text-4xl">Inhalt</h2>
			<ul className="flex flex-col gap-16">
				{content.map((chapter, index) => (
					<li key={index} className="flex flex-col rounded-lg bg-gray-100 p-8">
						{content.length > 0 && (
							<>
								<h3 className="heading flex gap-4 text-2xl">
									<span>{index + 1}.</span>
									<span className="text-secondary">{t(chapter.title)} </span>
								</h3>
								<span className="mt-4 text-light">
									{t(chapter.description ?? "")}
								</span>
							</>
						)}

						<ul className="mt-8 flex flex-col gap-1">
							{chapter.content.map(lesson => (
								<Lesson
									key={lesson.lessonId}
									href={`/courses/${course.slug}/${lesson.slug}`}
									lesson={lesson}
								/>
							))}
						</ul>
					</li>
				))}
			</ul>
		</section>
	);
}

function Lesson({ lesson, href }: { lesson: ToC.Content[0]["content"][0]; href: string }) {
	const { isAuthenticated } = useAuthentication();

	if (!isAuthenticated) {
		return (
			<div className="flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm border-gray-300">
				<LessonEntry lesson={lesson} />
			</div>
		);
	}

	return (
		<Link
			href={href}
			className={`flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm "border-gray-300"`}
		>
			<LessonEntry lesson={lesson} />
		</Link>
	);
}

function LessonEntry({ lesson }: { lesson: ToC.Content[0]["content"][0] }) {
	return (
		<span className="flex">
			<span className="w-8 shrink-0 self-center font-medium text-secondary">
				{lesson.lessonNr}
			</span>
			<span>{lesson.title}</span>
		</span>
	);
}
