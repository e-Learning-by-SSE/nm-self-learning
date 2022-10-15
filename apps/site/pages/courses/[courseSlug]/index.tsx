import { PlayIcon, PlusCircleIcon } from "@heroicons/react/solid";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { useEnrollmentMutations, useEnrollments } from "@self-learning/enrollment";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	CourseContent,
	extractLessonIds,
	LessonMeta,
	traverseCourseContent
} from "@self-learning/types";
import { AuthorsList } from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredContainer, CenteredSection } from "@self-learning/ui/layouts";
import { formatSeconds } from "@self-learning/util/common";
import { formatDistance } from "date-fns";
import { de } from "date-fns/locale";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import Math from "../../../components/math";

type Course = ResolvedValue<typeof getCourse>;

type LessonInfo = { lessonId: string; slug: string; title: string; meta: LessonMeta };

function mapToTocContent(
	content: CourseContent,
	lessonIdMap: Map<string, LessonInfo>
): ToC.ToCContent {
	const mappedContent: ToC.ToCContent = content.map((item): ToC.ToCContent[0] => {
		if (item.type === "chapter") {
			return {
				...item,
				content: mapToTocContent(item.content, lessonIdMap)
			};
		} else if (item.type === "lesson") {
			const lesson = lessonIdMap.get(item.lessonId) ?? {
				lessonNr: 0,
				title: "Removed",
				lessonId: "removed",
				slug: "removed",
				type: "lesson",
				meta: {
					hasQuiz: false,
					mediaTypes: {}
				}
			};

			return {
				...lesson,
				type: "lesson",
				lessonNr: item.lessonNr,
				isCompleted: false // TODO
			};
		}

		return item;
	});

	return mappedContent;
}

async function mapCourseContent(content: CourseContent): Promise<ToC.ToCContent> {
	const lessonIds = extractLessonIds(content);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			meta: true
		}
	});

	const map = new Map<string, LessonInfo>();

	for (const lesson of lessons) {
		map.set(lesson.lessonId, lesson as LessonInfo);
	}

	return mapToTocContent(content, map);
}

type Summary = {
	/** Total number of lessons in this course. */
	lessons: number;
	/** Total number of chapters in this course. Includes subchapters (tbd). */
	chapters: number;
	/** Duration in seconds of video material. */
	duration: number;
};

function createCourseSummary(content: ToC.ToCContent): Summary {
	let lessons = 0;
	let chapters = 0;
	let duration = 0;

	traverseCourseContent(content, chapterOrLesson => {
		if (chapterOrLesson.type === "chapter") {
			chapters++;
		} else {
			lessons++;

			if (chapterOrLesson.meta.mediaTypes.video?.duration) {
				duration += chapterOrLesson.meta.mediaTypes.video.duration;
			}
		}
	});

	return { lessons, chapters, duration };
}

type CourseProps = {
	course: Course;
	summary: Summary;
	content: ToC.ToCContent;
	markdownDescription: CompiledMarkdown | null;
};

export const getStaticProps: GetStaticProps<CourseProps> = async ({ params }) => {
	const courseSlug = params?.courseSlug as string | undefined;

	if (!courseSlug) {
		throw new Error("No slug provided.");
	}

	const course = await getCourse(courseSlug);

	if (!course) {
		return { notFound: true };
	}

	const content = await mapCourseContent(course.content as CourseContent);

	let markdownDescription = null;

	if (course) {
		if (course.description && course.description.length > 0) {
			markdownDescription = await compileMarkdown(course.description);
			course.description = null;
		}
	}

	const summary = createCourseSummary(content);

	return {
		props: {
			course: JSON.parse(JSON.stringify(course)) as Defined<typeof course>,
			summary,
			content,
			markdownDescription
		},
		notFound: !course
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

async function getCourse(courseSlug: string) {
	return await database.course.findUnique({
		where: { slug: courseSlug },
		include: {
			authors: {
				select: {
					slug: true,
					displayName: true,
					imgUrl: true
				}
			}
		}
	});
}

export default function Course({ course, summary, content, markdownDescription }: CourseProps) {
	return (
		<div className="bg-gray-50 pb-32">
			<CenteredSection className="bg-gray-50">
				<CourseHeader course={course} content={content} summary={summary} />
			</CenteredSection>

			{markdownDescription && (
				<section className="bg-white py-16">
					<CenteredContainer>
						<Description content={markdownDescription} />
					</CenteredContainer>
				</section>
			)}

			<CenteredSection className="bg-gray-50">
				<TableOfContents content={content} course={course} />
			</CenteredSection>
		</div>
	);
}

function toDateAgo(date: Date | string | number) {
	return formatDistance(new Date(date), Date.now(), {
		addSuffix: true,
		locale: de
	});
}

function CourseHeader({
	course,
	summary,
	content
}: {
	course: CourseProps["course"];
	summary: CourseProps["summary"];
	content: CourseProps["content"];
}) {
	const enrollments = useEnrollments();
	const { enroll } = useEnrollmentMutations(course.slug);
	const completion = useCourseCompletion(course.slug);

	const isEnrolled = useMemo(() => {
		if (!enrollments) return false;
		return !!enrollments.find(e => e.course.slug === course.slug);
	}, [enrollments, course]);

	const nextLessonSlug = useMemo(() => {
		if (!completion) return null;
		let firstNonCompletedLesson: string | null = null;

		traverseCourseContent(content, chapterOrLesson => {
			if (
				firstNonCompletedLesson === null &&
				chapterOrLesson.type === "lesson" &&
				!completion.completedLessons[chapterOrLesson.lessonId]
			) {
				firstNonCompletedLesson = chapterOrLesson.slug;
			}
		});

		return firstNonCompletedLesson;
	}, [completion, content]);

	return (
		<section className="flex flex-col gap-16">
			<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
				<div className="flex flex-col justify-between gap-8">
					<div className="flex flex-col-reverse gap-12 md:flex-col">
						<div>
							<h1 className="mb-12 text-4xl md:text-6xl">{course.title}</h1>
							{course.subtitle && (
								<div className="text-lg tracking-tight">{course.subtitle}</div>
							)}
						</div>
						<AuthorsList authors={course.authors} />
					</div>

					<CreatedUpdatedDates
						createdAt={toDateAgo(course.createdAt)}
						updatedAt={toDateAgo(course.updatedAt)}
					/>
				</div>

				<div className="flex w-full flex-col gap-4 rounded-lg">
					<div className="relative h-64 w-full shrink-0 grow">
						{course.imgUrl && (
							<Image
								priority
								className="shrink-0 rounded-lg bg-white"
								objectFit="cover"
								layout="fill"
								src={course.imgUrl}
								alt=""
							></Image>
						)}

						<ul className="absolute bottom-0 grid w-full grid-cols-3 divide-x divide-secondary rounded-b-lg border border-light-border border-t-transparent bg-white p-2 text-center">
							<li className="flex flex-col">
								<span className="font-semibold text-secondary">Lerneinheiten</span>
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
					</div>

					{isEnrolled && (
						<Link href={`/courses/${course.slug}/${nextLessonSlug}`}>
							<a className="btn-primary">
								<span>
									{completion?.completion["course"].completionPercentage === 0
										? "Starten"
										: "Fortfahren"}
								</span>
								<PlayIcon className="h-6" />
							</a>
						</Link>
					)}

					{!isEnrolled && (
						<button
							className="btn-secondary disabled:opacity-50"
							onClick={() => enroll({ courseId: course.courseId })}
						>
							<span>Zum Lernplan hinzfügen</span>
							<PlusCircleIcon className="h-6" />
						</button>
					)}
				</div>
			</div>
		</section>
	);
}

function TableOfContents({ content, course }: { content: ToC.ToCContent; course: Course }) {
	//const courseCompletion = useCourseCompletion(course.slug);

	return (
		<section className="flex flex-col gap-8">
			<h2 className="mb-4 text-4xl">Inhalt</h2>
			<div className="flex flex-col gap-8">
				{content.map((chapterOrLesson, index) => (
					<TocElement chapterOrLesson={chapterOrLesson} course={course} key={index} />
				))}
			</div>
		</section>
	);
}

export function TocElement({
	chapterOrLesson,
	course
}: {
	chapterOrLesson: ToC.ToCContent[0];
	course: Course;
}) {
	if (chapterOrLesson.type === "chapter") {
		return <ToC.Chapter courseSlug={course.slug} chapter={chapterOrLesson} depth={0} />;
	}

	return <ToC.SingleLesson courseSlug={course.slug} lesson={chapterOrLesson} />;
}

function CreatedUpdatedDates({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
	return (
		<div className="flex flex-wrap gap-2 text-xs">
			<span>
				Erstellt: <span>{createdAt}</span>
			</span>
			<span>|</span>
			<span>
				Letzte Änderung: <span>{updatedAt}</span>
			</span>
		</div>
	);
}

function Description({ content }: { content: CompiledMarkdown }) {
	return (
		<div className="prose max-w-full">
			<Math />
			<MDXRemote {...content}></MDXRemote>
		</div>
	);
}
