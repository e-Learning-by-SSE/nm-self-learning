import { PlusCircleIcon } from "@heroicons/react/outline";
import { PlayIcon } from "@heroicons/react/solid";
import { getCourseBySlug } from "@self-learning/cms-api";
import { CenteredContainer } from "@self-learning/ui/layouts";
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
		<div className="relative min-h-screen">
			<div className="multi-gradient absolute -z-10 h-[728px] w-full"></div>
			<div className="absolute top-[728px] -z-10 h-screen min-h-screen w-full bg-indigo-50"></div>
			<div className="px-2 pt-8 sm:px-8">
				<CenteredContainer>
					<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
						<div className="flex flex-col justify-between gap-8">
							<div className="flex flex-col-reverse gap-12 md:flex-col">
								<Authors authors={course.authors}></Authors>
								<div>
									<h1 className="mb-12 text-4xl md:text-6xl">{course.title}</h1>
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
								<button className="flex w-full place-content-center gap-2 rounded-lg bg-indigo-500 py-2 font-semibold text-white transition-colors hover:bg-indigo-600">
									<span>Starten</span>
									<PlayIcon className="h-6" />
								</button>
								<button className="glass flex w-full place-content-center gap-2 rounded-lg py-2 font-semibold transition-colors hover:bg-opacity-90">
									<span>Zum Lernplan hinzfügen</span>
									<PlusCircleIcon className="h-6" />
								</button>
							</div>
						</div>
					</div>
				</CenteredContainer>
			</div>

			<div className="py-8 px-8">
				<CenteredContainer>
					{course.description && <Description text={course.description} />}
					<TableOfContent content={course.content}></TableOfContent>
				</CenteredContainer>
			</div>
		</div>
	);
}

function Authors({ authors }: { authors: Course["authors"] }) {
	return (
		<div className="flex flex-wrap gap-2 md:gap-8">
			{authors?.data.map(author => (
				<Author
					key={author.attributes?.slug}
					name={author.attributes?.name as string}
					slug={author.attributes?.slug as string}
					imgUrl={author.attributes?.image?.data?.attributes?.url as string}
				/>
			))}
		</div>
	);
}

function Author({ name, slug, imgUrl }: { name: string; slug: string; imgUrl: string }) {
	return (
		<Link href={`/authors/${slug}`}>
			<a className="glass glass-hover flex w-full items-center gap-2 rounded-full py-[2px] pl-[2px] pr-3 md:w-fit">
				<Image
					priority={true}
					className="relative flex-shrink-0 rounded-full"
					height="36"
					width="36"
					src={`http://localhost:1337${imgUrl}`}
					alt={`Picture of ${name}`}
				></Image>
				<span className="text-sm">{name}</span>
			</a>
		</Link>
	);
}

function TableOfContent({ content }: { content: Course["content"] }) {
	return (
		<div className="glass card flex flex-col gap-4">
			<h2 className="mb-4 text-3xl">Content</h2>

			{content?.map(chapterOrLesson => {
				if (chapterOrLesson?.__typename === "ComponentNanomoduleChapter") {
					return (
						<div
							key={chapterOrLesson.title}
							className="card flex flex-col gap-4 border border-slate-200"
						>
							<span className="text-xl font-bold">{chapterOrLesson.title}</span>
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
						</div>
					);
				}

				if (chapterOrLesson?.__typename === "ComponentNanomoduleNanomoduleRelation") {
					const nanomodule = chapterOrLesson.nanomodule?.data?.attributes;
					return (
						<div
							key={chapterOrLesson.nanomodule?.data?.attributes?.slug}
							className="card flex items-center justify-between border border-slate-200"
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

function Description({ text }: { text: string }) {
	return (
		<div className="glass card">
			<p>{text}</p>
		</div>
	);
}
