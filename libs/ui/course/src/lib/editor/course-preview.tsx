import { trpc } from "@self-learning/api-client";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCourseCompletion } from "@self-learning/completion";
import {
	AuthorsList,
	showToast,
	ButtonActions,
	OnDialogCloseFn,
	AuthorProps
} from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredSection, useAuthentication } from "@self-learning/ui/layouts";
import { formatDateAgo, formatSeconds } from "@self-learning/util/common";
import { useCourseGenerationSSE } from "@self-learning/util/common";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Dialog } from "@self-learning/ui/common";
import { DynCourseFormModel, DynCourseGenPathFormModel } from "@self-learning/teaching";

type RawChapter = {
	title: string;
	description?: string | null;
	content: { lessonId: string }[];
};

export function CoursePreviewOld() {
	const params = useParams();
	const slug = params?.["slug"] as string;

	const { data: course, isLoading } = trpc.dynCourse.getCourse.useQuery(
		{ slug },
		{ enabled: !!slug }
	);

	const { data: generatedPath, isLoading: pathLoading } =
		trpc.dynCourse.getNewestLessonPath.useQuery(
			{ courseId: course?.courseId ?? "" },
			{ enabled: !!course?.courseId }
		);

	const [needRefresh, setNeedRefresh] = useState(false);
	const isGenerated = !!generatedPath;

	let lessonIds: string[] = [];
	if (!pathLoading) {
		if (!generatedPath) {
			console.log("No lesson path available");
		}
	}
	if (course && generatedPath && generatedPath.content) {
		lessonIds = (generatedPath.content as RawChapter[]).flatMap((chapter: any) =>
			chapter.content.map((l: any) => l.lessonId)
		);
	}
	const { data: lessonsData, isLoading: lessonsLoading } = trpc.lesson.findByIds.useQuery(
		{ lessonIds },
		{ enabled: lessonIds.length > 0 }
	);

	let mappedAuthors: AuthorProps[] = [];

	if (isLoading) {
		return <div>Loading...</div>;
	}
	/*
	if (!course) {
		return <div>Loading (no course)...</div>;
	}

	if (pathLoading || lessonsLoading) {
		return <div>Loading (no path)...</div>;
	}
*/
	let content: ToC.Content = [];

	if (generatedPath && Array.isArray(generatedPath.content)) {
		content =
			lessonsData && generatedPath
				? generatedPath.content.map((chapter: any) => ({
						title: chapter.title,
						description: chapter.description,
						content: chapter.content.map((l: any, i: number) => {
							const lesson = lessonsData.find(ld => ld.lessonId === l.lessonId)!;
							return {
								lessonId: lesson.lessonId,
								title: lesson.title,
								slug: lesson.slug,
								meta: lesson.meta,
								lessonNr: i + 1
							};
						})
					}))
				: [];
	}

	if (course) {
		mappedAuthors = course.authors.map(a => ({
			displayName: a.displayName ?? "Unknown",
			slug: a.slug ?? a.username,
			imgUrl: a.imgUrl ?? null
		}));
	}

	if (!course) {
		return <div>Course not found</div>;
	}

	return (
		<CenteredSection className="bg-gray-50">
			<CourseHeader
				course={course}
				authors={mappedAuthors}
				content={content}
				summary={{ lessons: 0, chapters: 0, duration: 0 }}
				needsARefresh={needRefresh}
				isGenerated={isGenerated}
			/>
		</CenteredSection>
	);
}

export function CoursePreview() {
	const params = useParams();
	const slug = params?.["slug"] as string;

	const { data: course, isLoading } = trpc.dynCourse.getCourse.useQuery(
		{ slug },
		{ enabled: !!slug }
	);

	const { data: lessonPath, isLoading: pathLoading } =
		trpc.dynCourse.getNewestLessonPath.useQuery(
			{ courseId: course?.courseId ?? "" },
			{ enabled: !!course?.courseId }
		);

	const [needRefresh, setNeedRefresh] = useState(false);
	const isGenerated = !!lessonPath;

	useEffect(() => {
		if (course && lessonPath) {
			if (course.courseVersion !== lessonPath.courseVersion) {
				console.log(
					`[CoursePreview] Version mismatch detected: course=${course.courseVersion}, path=${lessonPath.courseVersion}`
				);
				setNeedRefresh(true);
			} else {
				setNeedRefresh(false);
			}
		}
	}, [course?.courseVersion, lessonPath?.courseVersion, course, lessonPath]);

	let lessonIds: string[] = [];
	if (!pathLoading) {
		if (!lessonPath) {
			console.log("No lesson path available");
		}
	}
	if (course && lessonPath && lessonPath.content) {
		lessonIds = (lessonPath.content as RawChapter[]).flatMap((chapter: any) =>
			chapter.content.map((l: any) => l.lessonId)
		);
	}

	const { data: lessonsData, isLoading: lessonsLoading } = trpc.lesson.findByIds.useQuery(
		{ lessonIds },
		{ enabled: lessonIds.length > 0 }
	);

	let mappedAuthors: AuthorProps[] = [];

	if (isLoading) {
		return <div>Loading...</div>;
	}

	let content: ToC.Content = [];

	if (lessonPath && Array.isArray(lessonPath.content)) {
		content =
			lessonsData && lessonPath
				? lessonPath.content.map((chapter: any) => ({
						title: chapter.title,
						description: chapter.description,
						content: chapter.content.map((l: any, i: number) => {
							const lesson = lessonsData.find(ld => ld.lessonId === l.lessonId)!;
							return {
								lessonId: lesson.lessonId,
								title: lesson.title,
								slug: lesson.slug,
								meta: lesson.meta,
								lessonNr: i + 1
							};
						})
					}))
				: [];
	}

	if (course) {
		mappedAuthors = course.authors.map(a => ({
			displayName: a.displayName ?? "Unknown",
			slug: a.slug ?? a.username,
			imgUrl: a.imgUrl ?? null
		}));
	}

	if (!course) {
		return <div>Course not found</div>;
	}

	return (
		<CenteredSection className="bg-gray-50">
			<CourseHeader
				course={course}
				authors={mappedAuthors}
				content={content}
				summary={{ lessons: 0, chapters: 0, duration: 0 }}
				needsARefresh={needRefresh}
				isGenerated={isGenerated}
			/>
		</CenteredSection>
	);
}

type Summary = {
	/** Total number of lessons in this course. */
	lessons: number;
	/** Total number of chapters in this course. Includes subchapters (tbd). */
	chapters: number;
	/** Duration in seconds of video material. */
	duration: number;
};

function CourseHeader({
	isGenerated,
	needsARefresh,
	authors,
	course,
	summary,
	content
}: {
	isGenerated: boolean;
	needsARefresh: boolean;
	authors: AuthorProps[];
	course: DynCourseGenPathFormModel;
	summary: Summary;
	content: ToC.Content;
}) {
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

						{/*(!isGenerated || needsARefresh) && (
							<CoursePath course={course} needsARefresh={needsARefresh} />
						)*/}
						<CoursePath
							course={course}
							needsARefresh={needsARefresh}
							isGenerated={isGenerated}
						/>

						{isGenerated && (
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
			{isGenerated && (
				<TableOfContents content={content} course={course} isGenerated={isGenerated} />
			)}
		</section>
	);
}

function TableOfContents({
	content,
	course,
	isGenerated
}: {
	content: ToC.Content;
	course: DynCourseGenPathFormModel;
	isGenerated: boolean;
}) {
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

	if (isGenerated && !hasContent) {
		return (
			<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
				<span className="text-secondary">Keine Inhalte verfügbar</span>
				<span className="mt-4 text-light">
					Du hast entweder alle Skills schon erreicht oder es sind keine Lerninhalte
					verfügbar.
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
						{content.length > 0 && (
							<>
								<h3 className="heading flex gap-4 text-2xl">
									<span>{index + 1}.</span>
									<span className="text-secondary">{chapter.title} </span>
								</h3>
								<span className="mt-4 text-light">{chapter.description}</span>
							</>
						)}

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

function RefreshGeneratedCourse({ onClick }: { onClick: () => void }) {
	return (
		<div className="flex flex-col gap-4 p-8 rounded-lg bg-gray-100">
			<h3 className="heading flex gap-4 text-2xl">
				<span className="text-secondary">Kurs aktualisieren</span>
			</h3>
			<span className="mt-4 text-red-600">
				Die Ziele oder Anforderungen des Kurses wurden geändert. Ein neuer Kurspfad ist
				wahrscheinlich verfügbar.
			</span>

			<button
				className="btn-primary mt-4 w-full text-white p-3 rounded-lg flex items-center justify-center font-semibold"
				onClick={onClick}
			>
				Kurspfade Neugenerieren
			</button>
		</div>
	);
}

function CoursePath({
	course,
	needsARefresh,
	isGenerated
}: {
	course: DynCourseGenPathFormModel;
	needsARefresh: boolean;
	isGenerated: boolean;
}) {
	//needsARefresh = true;
	const { mutateAsync } = trpc.dynCourse.generateDynCourse.useMutation(); //
	const router = useRouter();
	const [isGenerating, setIsGenerating] = useState(false);
	//const [hasPath, setHasPath] = useState(isGenerated);
	const [generationId, setGenerationId] = useState<string | null>(null);
	const [isComplete, setIsComplete] = useState(false);

	const generateDynamicCourse = async () => {
		try {
			setIsGenerating(true);
			setIsComplete(false);
			const result = await mutateAsync({
				courseId: course.courseId ?? "",
				knowledge: []
			});
			setGenerationId(result.generationId);
		} catch (error) {
			setIsGenerating(false);
			console.error("Error generating course preview:", error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Der Kurs konnte nicht generiert werden."
			});
		}
	};

	if (needsARefresh) {
		return <RefreshGeneratedCourse onClick={generateDynamicCourse} />;
	}
	return (
		<div>
			{isGenerating && (
				<GeneratingCourseDialog
					generationId={generationId}
					onClose={() => {
						setIsGenerating(false);
						setGenerationId(null);
						if (isComplete) {
							router.reload();
						}
					}}
					onComplete={() => setIsComplete(true)}
				/>
			)}
			{/* <h3 className="font-semibold text-lg">Kurspfad generieren</h3> */}
			<button
				className="btn-primary mt-4 w-full text-white p-3 rounded-lg flex items-center justify-center font-semibold"
				onClick={generateDynamicCourse}
				disabled={isGenerating}
			>
				{isGenerated ? "Kurspfad Neugenerieren" : "Kurspfad Generieren"}
			</button>
		</div>
	);
}

function GeneratingCourseDialog({
	onClose,
	generationId,
	onComplete
}: {
	onClose: OnDialogCloseFn<string>;
	generationId: string | null;
	onComplete: () => void;
}) {
	const { event, isConnected, error } = useCourseGenerationSSE(generationId);
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		if (event?.type === "result") {
			setIsComplete(true);
			onComplete();
		}
	}, [event, onComplete]);

	return (
		<Dialog title="Kurspfad wird erstellt" onClose={onClose} style={{ minWidth: 480 }}>
			<div className="flex flex-col items-center justify-center py-4">
				{!isComplete ? (
					<>
						<div className="mb-6 relative">
							<div className="w-24 h-24 rounded-full border-4 border-t-emerald-500 border-r-emerald-300 border-b-emerald-200 border-l-gray-200 animate-spin"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 animate-pulse"></div>
								</div>
							</div>
						</div>
						<p className="text-center text-lg font-medium">
							Dein individueller Kurspfad wird generiert...
						</p>
						<p className="text-center text-sm text-light mt-2">
							KI erstellt deinen personalisierten Lerninhalt. Dies kann einen Moment
							dauern.
						</p>
						{!isConnected && !error && (
							<p className="text-center text-sm text-light mt-2">
								Verbinde mit Server...
							</p>
						)}
						{error && <p className="text-center text-sm text-red-500 mt-2">{error}</p>}
					</>
				) : (
					<>
						<div className="mb-6 text-emerald-500">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-24 w-24"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<p className="text-center text-lg font-medium">
							Dein Kurspfad wurde erfolgreich erstellt!
						</p>
						<p className="text-center text-sm text-light mt-2">
							Klicke auf Schließen, um mit dem Kurs zu beginnen.
						</p>
						<button
							className="btn-primary mt-6 px-8 py-2"
							onClick={() => onClose(ButtonActions.OK)}
						>
							Schließen
						</button>
					</>
				)}
			</div>
		</Dialog>
	);
}
