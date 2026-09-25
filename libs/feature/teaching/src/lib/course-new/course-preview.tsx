import { useFormContext, useWatch } from "react-hook-form";
import { CourseFormModel } from "../course/course-form-model";
import { trpc } from "@self-learning/api-client";
import { Alert, AuthorsList, LoadingBox } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import * as ToC from "@self-learning/ui/course";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@self-learning/api";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { formatSeconds } from "@self-learning/util/common";
import Link from "next/link";
import { useEffect } from "react";
import { PathAnalysis } from "./course-error-analysis";

type CoursePreviewModel = inferProcedureOutput<AppRouter["course"]["getCourse"]>;
type CourseContentPreviewModel = inferProcedureOutput<AppRouter["course"]["getContent"]>;

export function CoursePreview() {
	const form = useFormContext<CourseFormModel>();
	const slug = useWatch({ control: form.control, name: "slug" });

	// Mutation definition
	const {
		mutate: updateDefaultPath,
		data: jobId,
		isPending,
		isError,
		error
	} = trpc.course.updateDefaultPath.useMutation();

	// Submits the job
	useEffect(() => {
		if (!slug) return;

		updateDefaultPath({
			slug,
			knowledge: []
		});
	}, [slug, updateDefaultPath]);

	// Fetch job status
	const { data: status, isLoading: isStatusLoading } = trpc.jobQueue.getStatus.useQuery(
		{
			jobId: jobId ?? ""
		},
		{
			enabled: !!jobId,
			refetchInterval: query => (query.state.data?.status === "FINISHED" ? false : 1000)
		}
	);

	/// Fetch course after job finished
	const { data: preview, isLoading: isPreviewLoading } = trpc.course.getCourse.useQuery(
		{
			slug: slug ?? ""
		},
		{
			enabled: !!slug && !!jobId && status?.status === "FINISHED"
		}
	);

	if (!slug) {
		console.error("CoursePreview used for course without valid slug");

		return (
			<Alert
				type={{
					severity: "ERROR",
					message: "This course could not be found."
				}}
			/>
		);
	}

	if (
		isPending ||
		(!!jobId && status?.status !== "FINISHED") ||
		isStatusLoading ||
		isPreviewLoading
	) {
		return <LoadingBox />;
	}

	if (isError || status?.cause) {
		const errMsg = error?.message ?? status?.cause ?? "Unknown error";

		console.error(errMsg);

		return (
			<section className="mt-4">
				<Alert
					type={{
						severity: "ERROR",
						message: `Preview could not be created: ${errMsg}`
					}}
				/>
			</section>
		);
	}

	if (!preview) {
		return <LoadingBox />;
	}

	console.log("Preview data:", preview);

	return (
		<CenteredSection className="bg-gray-50">
			<Course course={preview} />
		</CenteredSection>
	);
}

function createCourseSummary(content: CourseContentPreviewModel) {
	const chapters = content.content.length;
	let lessons = 0;
	let duration = 0;

	for (const chapter of content.content) {
		for (const lesson of chapter.content) {
			const mappedLesson = content.lessonMap[lesson.lessonId];
			lessons++;
			duration +=
				mappedLesson.meta.mediaTypes.video?.duration ??
				mappedLesson.meta.mediaTypes.article?.estimatedDuration ??
				0;
		}
	}

	return { lessons, chapters, duration };
}

function Course({ course }: { course: CoursePreviewModel }) {
	const { data: contentPreview, isLoading: isPreviewLoading } = trpc.course.getContent.useQuery({
		slug: course.slug
	});
	const { data: allAuthors, isLoading: isAuthorsLoading } = trpc.author.getAll.useQuery();
	const hasContent = course.content.length > 0;
	const hasTeachingGoal = course.provides.length > 0;

	if (isPreviewLoading || isAuthorsLoading) {
		return <LoadingBox />;
	}
	if (!contentPreview || !allAuthors) {
		return (
			<Alert type={{ severity: "ERROR", message: "Content preview could not be loaded." }} />
		);
	}
	const summary = createCourseSummary(contentPreview);
	const content = course.content.map(chapter => ({
		title: chapter.title,
		description: chapter.description,
		content: chapter.content
			.map(({ lessonId }, index) => ({
				...contentPreview.lessonMap[lessonId],
				lessonType: "",
				performanceScore: null,
				lessonNr: index + 1
			}))
			.filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== undefined)
	}));
	const authors = course.authors
		.map(author => allAuthors.find(a => a.username === author.username))
		.filter((author): author is NonNullable<typeof author> => author !== undefined);

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
						<AuthorsList authors={authors} />
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
				<LessonPath content={content} course={course} />
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

function LessonPath({ content, course }: { content: ToC.Content; course: CoursePreviewModel }) {
	const { t } = useTranslation("kee");
	const hasContent = content.length > 0;

	if (!hasContent) {
		return <PathAnalysis course={course} />;
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
									<span className="text-secondary">{t(chapter.title)} </span>
								</h3>
								<span className="mt-4 text-light">
									{t(chapter.description ?? "")}
								</span>
							</>
						)}

						<ul className="mt-8 flex flex-col gap-1">
							{chapter.content.map(lesson => (
								<Link
									key={lesson.lessonId}
									href={`/courses/${course.slug}/${lesson.slug}`}
									className={`flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm "border-gray-300"`}
								>
									<span className="flex">
										<span className="w-8 shrink-0 self-center font-medium text-secondary">
											{lesson.lessonNr}
										</span>
										<span>{lesson.title}</span>
									</span>
								</Link>
							))}
						</ul>
					</li>
				))}
			</ul>
		</section>
	);
}
