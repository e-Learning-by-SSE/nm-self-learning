import { CheckCircleIcon, PlayIcon, PlusCircleIcon, XCircleIcon } from "@heroicons/react/solid";
import { useApi, useEnrollmentMutations } from "@self-learning/api";
import { getCourseBySlug } from "@self-learning/cms-api";
import { useCourseCompletion } from "@self-learning/completion";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import { CoursesOfUser } from "../../api/users/[username]/courses";

type Course = ResolvedValue<typeof getCourseBySlug>;

type CourseProps = {
	course: Course;
	markdownDescription: CompiledMarkdown | null;
};

export const getStaticProps: GetStaticProps<CourseProps> = async ({ params }) => {
	const courseSlug = params?.courseSlug as string | undefined;

	if (!courseSlug) {
		throw new Error("No slug provided.");
	}

	const course = (await getCourseBySlug(courseSlug)) as Course;

	let markdownDescription = null;

	if (course?.description && course.description.length > 0) {
		markdownDescription = await compileMarkdown(course.description);
		course.description = null;
	}

	return {
		props: { course, markdownDescription },
		notFound: !course
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

export default function Course({ course, markdownDescription }: CourseProps) {
	return (
		<div className="bg-gray-50 pb-32">
			<CenteredSection className="gradient">
				<CourseHeader course={course} />
			</CenteredSection>

			{markdownDescription && (
				<CenteredSection className="bg-gray-50">
					<Description content={markdownDescription} />
				</CenteredSection>
			)}

			<CenteredSection className="bg-white">
				<Competences />
			</CenteredSection>

			<CenteredSection className="bg-gray-50">
				<TableOfContents content={course.content} course={course} />
			</CenteredSection>
		</div>
	);
}

function CourseHeader({ course }: { course: Course }) {
	const username = "potter";
	const { data: enrollments } = useApi<CoursesOfUser>(["user", `users/${username}/courses`]);
	const { signUpMutation, signOutMutation } = useEnrollmentMutations();

	const [authors] = useState(
		() =>
			course.authors?.data.map(author => ({
				slug: author.attributes?.slug as string,
				name: author.attributes?.name as string,
				imgUrl: author.attributes?.image?.data?.attributes?.url as string
			})) as AuthorProps[]
	);

	const isEnrolled = useMemo(() => {
		if (!enrollments) return false;
		return !!enrollments.find(e => e.courseId === course.slug);
	}, [enrollments, course]);

	const { url, alternativeText } = course.image?.data?.attributes || {};

	return (
		<div className="flex flex-col gap-16">
			<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
				<div className="flex flex-col justify-between gap-8">
					<div className="flex flex-col-reverse gap-12 md:flex-col">
						<AuthorsList authors={authors} />
						<div>
							<h1 className="mb-12 text-4xl md:text-6xl">{course.title}</h1>
							{course.subtitle && (
								<div className="text-lg tracking-tight">{course.subtitle}</div>
							)}
						</div>
					</div>

					<CreatedUpdatedDates
						createdAt={new Date(course.createdAt).toLocaleDateString()}
						updatedAt={new Date(course.updatedAt).toLocaleDateString()}
					/>
				</div>

				<div className="flex w-full flex-col gap-4 rounded">
					<div className="relative h-64 w-full shrink-0">
						<Image
							priority
							className="shrink-0 rounded-lg bg-white"
							objectFit="contain"
							layout="fill"
							src={`http://localhost:1337${url}` ?? ""}
							alt={alternativeText ?? ""}
						></Image>
					</div>
					<div className="grid gap-2">
						<button
							className="btn-primary"
							onClick={() =>
								signUpMutation.mutate({
									course: course.slug,
									username
								})
							}
						>
							<span>{isEnrolled ? "Fortfahren" : "Starten"}</span>
							<PlayIcon className="h-6" />
						</button>
						<button
							className="btn-secondary"
							onClick={() =>
								signOutMutation.mutate({
									course: course.slug,
									username
								})
							}
						>
							<span>Zum Lernplan hinzfügen</span>
							<PlusCircleIcon className="h-6" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
function TableOfContents({ content, course }: { content: Course["content"]; course: Course }) {
	const courseCompletion = useCourseCompletion(course.slug);
	console.log("courseCompletion", courseCompletion);

	return (
		<div className="flex flex-col gap-8">
			<h2 className="mb-4 text-4xl">Inhalt</h2>
			<div className="flex flex-col place-items-center">
				{content?.map((component, index, content) => {
					const showConnector = index < content.length - 1;

					if (!component) return undefined;

					if (component?.__typename === "ComponentTableOfContentsChapter") {
						const isCompleted =
							(courseCompletion?.chapters[index] &&
								courseCompletion.chapters[index].completedLessonsPercentage >=
									100) ??
							false;

						return (
							<Fragment key={component.title}>
								<ToC.Section isCompleted={isCompleted} isRequired={false}>
									<ToC.Chapter
										courseSlug={course.slug}
										title={component.title as string}
										description={component.description as string}
										lessons={
											component.lessons?.map(lesson => ({
												lessonId: lesson?.lesson?.data?.attributes
													?.lessonId as string,
												title: lesson?.lesson?.data?.attributes
													?.title as string,
												slug: lesson?.lesson?.data?.attributes
													?.slug as string,
												isCompleted:
													(courseCompletion?.completedLessons &&
														!!courseCompletion.completedLessons[
															lesson!.lesson!.data!.attributes!
																.lessonId
														]) ??
													false
											})) ?? []
										}
									/>
								</ToC.Section>
								{showConnector && (
									<ToC.SectionConnector
										isCompleted={isCompleted}
										isRequired={true}
									/>
								)}
							</Fragment>
						);
						// } else if (component.__typename === "ComponentTableOfContentsLessonRelation") {
						// 	return (
						// 		<Fragment key={component.lesson?.data?.attributes?.slug}>
						// 			<ToC.Section isCompleted={true} isRequired={false}>
						// 				<ToC.SingleLesson
						// 					slug={component.lesson?.data?.attributes?.slug as string}
						// 					title={component.lesson?.data?.attributes?.title as string}
						// 				/>
						// 			</ToC.Section>
						// 			{showConnector && (
						// 				<ToC.SectionConnector isCompleted={true} isRequired={false} />
						// 			)}
						// 		</Fragment>
						// 	);
						// } else if (component.__typename === "ComponentTableOfContentsCourseRelation") {
						// 	return (
						// 		<Fragment key={component.title}>
						// 			<ToC.Section isCompleted={false} isRequired={true}>
						// 				<ToC.NestedCourse
						// 					title={component.title as string}
						// 					slug={component.course?.data?.attributes?.slug as string}
						// 					description={component.description as string}
						// 					course={{
						// 						title: component.course?.data?.attributes
						// 							?.title as string,
						// 						subtitle: component.course?.data?.attributes
						// 							?.subtitle as string,
						// 						imgUrl: component.course?.data?.attributes?.image?.data
						// 							?.attributes?.url as string
						// 					}}
						// 				/>
						// 			</ToC.Section>
						// 			{showConnector && (
						// 				<ToC.SectionConnector isCompleted={true} isRequired={true} />
						// 			)}
						// 		</Fragment>
						// 	);
					} else {
						<div className="bg-red-200">
							<span className="text-red-500">Unknown Component</span>
						</div>;
					}
				})}
			</div>
		</div>
	);
}

function CreatedUpdatedDates({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
	return (
		<div className="flex flex-wrap gap-2 text-xs">
			<span>
				Created: <span>{createdAt}</span>
			</span>
			<span>|</span>
			<span>
				Last updated: <span>{updatedAt}</span>
			</span>
		</div>
	);
}

function Description({ content }: { content: CompiledMarkdown }) {
	return (
		<div className="prose max-w-full">
			<MDXRemote {...content}></MDXRemote>
		</div>
	);
}

export function Competences() {
	return (
		<div className="grid place-content-center gap-16 divide-y divide-slate-200 md:grid-cols-2 md:gap-0 md:divide-x md:divide-y-0">
			<div className="flex flex-col gap-12 md:pr-16">
				<span className="text-lg font-bold">Du benötigst folgende Voraussetzungen...</span>

				<div className="flex flex-col gap-4">
					<RequirementCompetence
						text="Lorem, ipsum dolor sit amet consectetur adipisicing."
						checked={true}
					/>
					<RequirementCompetence
						text="Lorem, ipsum dolor sit amet consectetur adipisicing."
						checked={true}
					/>
					<RequirementCompetence
						text="Lorem, ipsum dolor sit amet consectetur adipisicing."
						checked={false}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-12 pt-16 md:pl-16 md:pt-0">
				<span className="text-lg font-bold">Du erwirbst folgende Kompetenzen...</span>
				<div className="flex flex-col gap-4">
					<AwardedCompetence
						text="Lorem, ipsum dolor sit amet consectetur adipisicing."
						checked={true}
					/>
					<AwardedCompetence
						text="Lorem, ipsum dolor sit amet consectetur adipisicing."
						checked={false}
					/>
					<AwardedCompetence
						text="Lorem, ipsum dolor sit amet consectetur adipisicing."
						checked={true}
					/>
				</div>
			</div>
		</div>
	);
}

function RequirementCompetence({ text, checked }: { text: string; checked: boolean }) {
	return (
		<span className="flex items-center gap-4">
			{checked ? (
				<>
					<CheckCircleIcon className="h-8 shrink-0 text-emerald-500" />
					<span className="text-slate-400">{text}</span>
				</>
			) : (
				<>
					<XCircleIcon className="h-8 shrink-0 text-red-500" />
					<span className="font-semibold">{text}</span>
				</>
			)}
		</span>
	);
}

function AwardedCompetence({ text, checked }: { text: string; checked: boolean }) {
	return (
		<span className="flex items-center gap-4">
			{checked ? (
				<>
					<CheckCircleIcon className="h-8 shrink-0 text-emerald-500" />
					<span className="text-slate-400">{text}</span>
				</>
			) : (
				<>
					<PlusCircleIcon className="h-8 shrink-0 text-indigo-500" />
					<span className="font-semibold">{text}</span>
				</>
			)}
		</span>
	);
}
