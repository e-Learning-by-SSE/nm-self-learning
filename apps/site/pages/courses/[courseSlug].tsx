import { PlusCircleIcon } from "@heroicons/react/outline";
import { PlayIcon } from "@heroicons/react/solid";
import { useApi, useEnrollmentMutations } from "@self-learning/api";
import { getCourseBySlug } from "@self-learning/cms-api";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CoursesOfUser } from "../api/users/[username]/courses";

type Course = Exclude<Awaited<ReturnType<typeof getCourseBySlug>>, null>;

type CourseProps = {
	course: Course;
};

export const getStaticProps: GetStaticProps<CourseProps> = async ({ params }) => {
	const courseSlug = params?.courseSlug as string | undefined;

	if (!courseSlug) {
		throw new Error("No slug provided.");
	}

	const course = (await getCourseBySlug(courseSlug)) as Course;

	return {
		props: { course },
		notFound: !course
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

export default function Course({ course }: CourseProps) {
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
		<>
			<Head>
				<title>{course.title}</title>
				<meta name="description" content={course.description ?? ""} />
				<meta name="author" content={authors[0].name} />
				<meta name="image" content={course.image?.data?.attributes?.url} />
			</Head>
			<div className="gradient min-h-screen bg-slate-50 bg-fixed pb-32">
				<div className="px-2 pt-16 pb-32 sm:px-8">
					<CenteredContainer>
						<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
							<div className="flex flex-col justify-between gap-8">
								<div className="flex flex-col-reverse gap-12 md:flex-col">
									<AuthorsList authors={authors} />
									<div>
										<h1 className="mb-12 text-4xl md:text-6xl">
											{course.title}
										</h1>
										{course.subtitle && (
											<div className="text-lg tracking-tight">
												{course.subtitle}
											</div>
										)}
									</div>
								</div>

								<CreatedUpdatedDates
									createdAt={new Date(course.createdAt).toLocaleDateString()}
									updatedAt={new Date(course.updatedAt).toLocaleDateString()}
								/>
							</div>

							<div className="flex w-full flex-col gap-4 rounded">
								<div className="relative h-64 w-full">
									<Image
										className="rounded-lg"
										objectFit="cover"
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

						{course.description && <Description text={course.description} />}
					</CenteredContainer>
				</div>

				<div className="-mt-16 px-2 sm:px-8">
					<CenteredContainer>
						<TableOfContent content={course.content}></TableOfContent>
					</CenteredContainer>
				</div>
			</div>
		</>
	);
}

function TableOfContent({ content }: { content: Course["content"] }) {
	return (
		<div className="flex flex-col gap-4">
			<h2 className="mb-4 text-3xl">Inhalt</h2>
			<TableOfContentInner content={content} />
		</div>
	);
}

function TableOfContentInner({ content }: { content: Course["content"] }) {
	return (
		<>
			{content?.map(chapterOrLesson => {
				if (chapterOrLesson?.__typename === "ComponentNanomoduleChapter") {
					return (
						<div
							key={chapterOrLesson.title}
							className="glass card flex flex-col gap-4 border border-slate-200"
						>
							<span className="text-xl font-bold">{chapterOrLesson.title}</span>
							{
								<ul className="flex flex-col">
									{chapterOrLesson.lessons?.data.map(lesson => (
										<li
											key={lesson.attributes?.slug}
											className="flex items-center justify-between rounded border border-slate-200 p-2"
										>
											<Link href={"/lessons/" + lesson.attributes?.slug}>
												<a className="hover:underline">
													{lesson.attributes?.title}
												</a>
											</Link>
											<div className="text-xs">4:20</div>
										</li>
									))}
								</ul>
							}
						</div>
					);
				}

				if (chapterOrLesson?.__typename === "ComponentNanomoduleCourseRelation") {
					const { title, description, course } = chapterOrLesson;
					const imgUrl = course?.data?.attributes?.image?.data?.attributes?.url ?? "";

					return (
						<div
							key={title}
							className="glass card flex flex-col gap-4 border border-slate-200"
						>
							<span className="text-xl font-bold">{title}</span>
							{description && description.length > 0 && (
								<div className="">{description}</div>
							)}
							<div className="flex rounded-lg bg-slate-100">
								<div className="relative w-[256px]">
									<Image
										src={`http://localhost:1337${imgUrl}`}
										alt=""
										layout="fill"
										objectFit="cover"
										className="rounded-l-lg"
									></Image>
								</div>
								<div className="flex flex-col gap-4 rounded-r-lg border border-slate-400 p-4">
									<span className="text-lg font-bold">
										{course?.data?.attributes?.title}
									</span>
									<span className="text-sm">
										{course?.data?.attributes?.subtitle}
									</span>
								</div>
							</div>
						</div>
					);
				}

				if (chapterOrLesson?.__typename === "ComponentNanomoduleNanomoduleRelation") {
					const nanomodule = chapterOrLesson.nanomodule?.data?.attributes;
					return (
						<div
							key={chapterOrLesson.nanomodule?.data?.attributes?.slug}
							className="glass card flex items-center justify-between border border-slate-200"
						>
							<Link href={"/lessons/" + nanomodule?.slug}>
								<a className="text-xl font-bold hover:underline">
									{nanomodule?.title}
								</a>
							</Link>
							<span className="text-xs">4:20</span>
						</div>
					);
				}
			})}
		</>
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

function Description({ text }: { text: string }) {
	return (
		<div className="glass card">
			<p>{text}</p>
		</div>
	);
}
