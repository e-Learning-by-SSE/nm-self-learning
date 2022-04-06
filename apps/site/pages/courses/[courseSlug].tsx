import { getCourseBySlug } from "@self-learning/cms-api";
import { CenteredContainer, SidebarLayout } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";

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
	const { url, alternativeText } = course.image?.data?.attributes || {};

	return (
		<SidebarLayout>
			<CenteredContainer defaultPadding={true}>
				<h1 className="text-5xl">{course.title}</h1>
				{course.subtitle && (
					<div className="text-2xl tracking-tight">{course.subtitle}</div>
				)}

				<div className="flex flex-wrap-reverse justify-between gap-4">
					<div className="flex flex-wrap gap-8">
						{course.authors?.data.map(author => (
							<div key={author.attributes?.slug} className="flex items-center gap-2">
								<Image
									priority={true}
									className="relative flex-shrink-0 rounded-full"
									height="36"
									width="36"
									src={
										`http://localhost:1337${author.attributes?.image?.data?.attributes?.url}` ??
										""
									}
									alt={
										author.attributes?.image?.data?.attributes
											?.alternativeText ?? ""
									}
								></Image>
								<Link href={`/authors/${author.attributes?.slug}`}>
									<a className="hover:underline">{author.attributes?.name}</a>
								</Link>
							</div>
						))}
					</div>

					<div className="flex flex-col text-xs">
						<span>
							Created: <span>{new Date(course.createdAt).toLocaleDateString()}</span>
						</span>
						<span>
							Updated: <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
						</span>
					</div>
				</div>
				<div className="flex gap-4">
					<div className="relative h-64 w-full">
						<Image
							className="rounded"
							objectFit="cover"
							layout="fill"
							src={`http://localhost:1337${url}` ?? ""}
							alt={alternativeText ?? ""}
						></Image>
					</div>
				</div>

				{course.description && <span className="">{course.description}</span>}

				{course.content?.map(chapterOrLesson => {
					if (chapterOrLesson?.__typename === "ComponentNanomoduleChapter") {
						return (
							<div
								key={chapterOrLesson.title}
								className="flex flex-col gap-4 rounded bg-slate-100 p-4"
							>
								<span className="font-bold">{chapterOrLesson.title}</span>
								<div className="flex flex-col">
									{chapterOrLesson.lessons?.data.map(lesson => (
										<li key={lesson.attributes?.slug}>
											<Link href={"/lessons/" + lesson.attributes?.slug}>
												<a className="hover:underline">
													{lesson.attributes?.title}
												</a>
											</Link>
										</li>
									))}
								</div>
							</div>
						);
					}

					if (chapterOrLesson?.__typename === "ComponentNanomoduleNanomoduleRelation") {
						const nanomodule = chapterOrLesson.nanomodule?.data?.attributes;
						return (
							<div className="rounded bg-slate-100 p-4">
								<Link href={"/lessons/" + nanomodule?.slug}>
									<a className="font-bold hover:underline">{nanomodule?.title}</a>
								</Link>
							</div>
						);
					}
				})}
			</CenteredContainer>
		</SidebarLayout>
	);
}
