import { PlayIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { useEnrollmentMutations, useEnrollments } from "@self-learning/enrollment";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	CourseContent,
	Defined,
	extractLessonIds,
	LessonInfo,
	ResolvedValue
} from "@self-learning/types";
import { AuthorsList, showToast } from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredContainer, CenteredSection, useAuthentication } from "@self-learning/ui/layouts";
import { formatDateAgo, formatSeconds } from "@self-learning/util/common";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMemo } from "react";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { SelectSkillDialog } from "libs/feature/teaching/src/lib/skills/skill-dialog/select-skill-dialog";
import { SkillFormModel } from "@self-learning/types";
import { useRouter } from "next/router";

type Course = ResolvedValue<typeof getCourse>;

function mapToTocContent(
	content: CourseContent,
	lessonIdMap: Map<string, LessonInfo>
): ToC.Content {
	let lessonNr = 1;

	return content.map(chapter => ({
		title: chapter.title,
		description: chapter.description,
		content: chapter.content.map(({ lessonId }) => {
			const lesson: ToC.Content[0]["content"][0] = lessonIdMap.has(lessonId)
				? {
						...(lessonIdMap.get(lessonId) as LessonInfo),
						lessonNr: lessonNr++
					}
				: {
						lessonId: "removed",
						slug: "removed",
						meta: { hasQuiz: false, mediaTypes: {} },
						title: "Removed",
						lessonType: LessonType.TRADITIONAL,
						lessonNr: -1
					};

			return lesson;
		})
	}));
}

async function mapCourseContent(content: CourseContent): Promise<ToC.Content> {
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

function createCourseSummary(content: ToC.Content): Summary {
	const chapters = content.length;
	let lessons = 0;
	let duration = 0;

	for (const chapter of content) {
		for (const lesson of chapter.content) {
			lessons++;
			duration +=
				lesson.meta.mediaTypes.video?.duration ??
				lesson.meta.mediaTypes.article?.estimatedDuration ??
				0;
		}
	}

	return { lessons, chapters, duration };
}

type CourseProps = {
	course: Course;
	summary: Summary;
	content: ToC.Content;
	markdownDescription: CompiledMarkdown | null;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<CourseProps>(async (req, ctx) => {
		const courseSlug = req.params?.courseSlug as string | undefined;
		if (!courseSlug) {
			throw new Error("No slug provided.");
		}

		const course = await getCourse(courseSlug, ctx.name);

		const content = await mapCourseContent(course.content as CourseContent);

		let markdownDescription = null;

		if (course.description && course.description.length > 0) {
			markdownDescription = await compileMarkdown(course.description);
			course.description = null;
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
	})
);


async function getCourse(courseSlug: string, username: string) {
	const course = await database.course.findUniqueOrThrow({
		where: { slug: courseSlug },
		select: {
			courseId: true,
			title: true,
			subtitle: true,
			description: true,
			slug: true,
			imgUrl: true,
			createdAt: true,
			updatedAt: true,
			subjectId: true,
			authors: {
				select: {
					slug: true,
					displayName: true,
					imgUrl: true
				}
			},
			generatedLessonPaths: {
				where: {
					username: username
				}
			}
		}
	});

	return {
		...course,
		content: course?.generatedLessonPaths[0]?.content ?? []
	};
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

function CourseHeader({
	course,
	summary,
	content
}: {
	course: CourseProps["course"];
	summary: CourseProps["summary"];
	content: CourseProps["content"];
}) {
	const { withAuth, isAuthenticated } = useAuthentication();

	const enrollments = useEnrollments();
	const { enroll } = useEnrollmentMutations();
	const completion = useCourseCompletion(course.slug);

	const isEnrolled = useMemo(() => {
		if (!enrollments) return false;
		return !!enrollments.find(e => e.course.slug === course.slug);
	}, [enrollments, course]);

	const nextLessonSlug: string | null = useMemo(() => {
		if (!completion) return null;

		for (const chapter of content) {
			for (const lesson of chapter.content) {
				if (!completion.completedLessons[lesson.lessonId]) {
					return lesson.slug;
				}
			}
		}

		return null;
	}, [completion, content]);

	const firstLessonFromChapter = content[0]?.content[0] ?? null;
	const lessonCompletionCount = completion?.courseCompletion.completedLessonCount ?? 0;
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
						<AuthorsList authors={course.authors} />
						<CreatedUpdatedDates
							createdAt={formatDateAgo(course.createdAt)}
							updatedAt={formatDateAgo(course.updatedAt)}
						/>
					</div>
				</div>

				<div className="flex w-full flex-col gap-4 rounded-lg">
					<div className="relative h-64 w-full shrink-0 grow">
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

						<ul className="absolute bottom-0 grid w-full grid-cols-3 divide-x divide-secondary rounded-b-lg border border-light-border border-t-transparent bg-white bg-opacity-80 p-2 text-center">
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
						<Link
							href={
								firstLessonFromChapter
									? `/courses/${course.slug}/${
											nextLessonSlug ?? firstLessonFromChapter.slug
										}`
									: `/courses/${course.slug}`
							}
							className="btn-primary"
						>
							<span>
								{nextLessonSlug
									? lessonCompletionCount === 0
										? "Starten"
										: "Fortfahren"
									: "Öffnen"}
							</span>
							<PlayIcon className="h-5" />
						</Link>
					)}
					{!isEnrolled && (
						<button
							className="btn-primary disabled:opacity-50"
							onClick={() => {
								withAuth(() => {
									enroll({ courseId: course.courseId });
								});
							}}
						>
							{isAuthenticated && (
								<>
									<span>Zum Lernplan hinzufügen</span>
									<PlusCircleIcon className="h-5" />
								</>
							)}
							{!isAuthenticated && <span>Lernplan nach Login verfügbar</span>}
						</button>
					)}
					{<CoursePath courseId={course.courseId} />}
				</div>
			</div>
		</section>
	);
}

function TableOfContents({ content, course }: { content: ToC.Content; course: Course }) {
	const completion = useCourseCompletion(course.slug);

	const hasContent = content.length > 0;

	if (!hasContent) {
		return (
			<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
				<h3 className="heading flex gap-4 text-2xl">
					<span className="text-secondary">Kein Inhalt verfügbar</span>
				</h3>
				<span className="mt-4 text-light">
					Du hast dir noch keinen Kurspfad generiert. Bitte wähle einen Kurspfad aus.
				</span>
			</div>
		);
	}

	return (
		<section className="flex flex-col gap-8">
			<h2 className="mb-4 text-4xl">Inhalt</h2>
			<ul className="flex flex-col gap-16">
				{content.map((chapter, index) => (
					<li key={index} className="flex flex-col rounded-lg bg-gray-100 p-8">
						<h3 className="heading flex gap-4 text-2xl">
							<span>{index + 1}.</span>
							<span className="text-secondary">{chapter.title}</span>
						</h3>
						<span className="mt-4 text-light">{chapter.description}</span>

						<ul className="mt-8 flex flex-col gap-1">
							{chapter.content.map(lesson => (
								<Lesson
									key={lesson.lessonId}
									href={`/courses/${course.slug}/${lesson.slug}`}
									lesson={lesson}
									isCompleted={!!completion?.completedLessons[lesson.lessonId]}
								/>
							))}
						</ul>
					</li>
				))}
			</ul>
		</section>
	);
}

function Lesson({
	lesson,
	href,
	isCompleted
}: {
	lesson: ToC.Content[0]["content"][0];
	href: string;
	isCompleted: boolean;
}) {
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
			className={`flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm ${
				isCompleted ? "border-emerald-500" : "border-gray-300"
			}`}
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

function CreatedUpdatedDates({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
	return (
		<div className="flex flex-wrap gap-2 text-xs text-light">
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
		<div className="prose prose-emerald max-w-full">
			<MDXRemote {...content}></MDXRemote>
		</div>
	);
}

function CoursePath({courseId}:{courseId: string}) {
	const { mutateAsync } = trpc.course.generateCoursePreview.useMutation();
	const [selectedPath, setSelectedPath] = useState("");
	const [openDialog, setOpenDialog] = useState<React.JSX.Element | null>(null);
	const router = useRouter();

	const onSelectedKnowledge = async (skills: SkillFormModel[]) =>{
		try {
			const generatedCourse = await mutateAsync({
				courseId: courseId,
				knowledge: skills.map(skill => skill.id),
			});

			setOpenDialog(<ShowGeneratedPath selectedSkills={skills} />);

			router.reload();
		} catch (error) {
			console.error("Error generating course preview:", error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Der Kurs konnte nicht generiert werden."
			});
		}
	}

	return (
		<div>
			<h3 className="font-semibold text-lg">Kurspfad wählen </h3>
			<div className="mt-2 space-y-2">
				<label
					className="block p-4 border rounded-lg cursor-pointer"
					onClick={() => setSelectedPath("no-knowledge")}
				>
					<input
						type="radio"
						name="course-path"
						checked={selectedPath === "no-knowledge"}
						className="mr-2"
						readOnly
					/>
					<span className="font-medium">Ohne Vorwissen</span>
					<p className="text-sm text-gray-500">
						Alle Lerneinheiten werden dem Pfad hinzugefügt, ungeachtet des Vorwissens
						des Nutzers.
					</p>
				</label>
				<label
					className="block p-4 border rounded-lg cursor-pointer"
					onClick={() => setSelectedPath("with-knowledge")}
				>
					<input
						type="radio"
						name="course-path"
						checked={selectedPath === "with-knowledge"}
						className="mr-2"
						readOnly
					/>
					<span className="font-medium">Mit Vorwissen</span>
					<p className="text-sm text-gray-500">
						Lerneinheiten, bei denen der Nutzer bereits den Skill erworben hat, werden
						nicht dem Pfad hinzugefügt.
					</p>
				</label>
			</div>

			<button
				className="btn-primary mt-4 w-full text-white p-3 rounded-lg flex items-center justify-center font-semibold"
				onClick={async () => {
					setOpenDialog(<HandleChosenPath
						selectedPath={selectedPath}
						onClose={async skills => 
							await onSelectedKnowledge(skills)
						}
					/>);
				}}
			>
				Starten
			</button>
			{openDialog}
		</div>
	);
}

function HandleChosenPath({
	selectedPath,
	onClose
}: {
	selectedPath: string;
	onClose: (skills: SkillFormModel[]) => void;
}) {
	const [isOpen, setIsOpen] = useState(true);
	if (selectedPath == "with-knowledge") {
		return (
			<>
				{isOpen && (
					<SelectSkillDialog
						onClose={skills => {
							onClose(skills ?? []);
							setIsOpen(false);
						}}
						repositoryId={"2"}
					/>
				)}
			</>
		);
	}

	return null;
}

function ShowGeneratedPath({
	selectedSkills
}: {
	selectedSkills: SkillFormModel[];
}) {
	const randomTime = (Math.random()* selectedSkills.length) * 1.5;

	return (
		<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
			<h3 className="heading flex gap-4 text-2xl">
				<span className="text-secondary">Generierter Kurs</span>
			</h3>
			<span className="mt-4 text-light">
				Der Kurs wurde erfolgreich generiert. Die Lerneinheiten sind nun verfügbar.
			</span>
			<span className="mt-4 text-light">
				Du hast dir durch dein Vorwissen { Math.floor(randomTime) } Module gespart.
			</span>
			<p className="mt-4 text-light">
				Du kannst den Kurs jetzt starten und dein Wissen erweitern.
			</p>
		</div>
	);
}
