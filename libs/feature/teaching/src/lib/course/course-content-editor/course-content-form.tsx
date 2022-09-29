import {
	ChevronDownIcon,
	ChevronRightIcon,
	LinkIcon,
	PencilIcon,
	PlusIcon
} from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { QuizContent } from "@self-learning/question-types";
import { LessonContent } from "@self-learning/types";
import {
	Divider,
	IconButton,
	OnDialogCloseFn,
	SectionCard,
	SectionCardHeader,
	showToast
} from "@self-learning/ui/common";
import { getRandomId } from "@self-learning/util/common";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useEffect, useId, useState } from "react";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { EditLessonDialog } from "./dialogs/edit-lesson-dialog";
import { LessonSelector, LessonSummary } from "./dialogs/lesson-selector";
import { NewChapterDialog } from "./dialogs/new-chapter-dialog";
import { ChapterWithNr, Competence, LessonWithNr, MappedContent, Summary } from "./types";
import { useCourseContentForm } from "./use-content-form";

const HighlightContext = createContext({
	highlightedCompetence: null as string | null,
	setHighlightedCompetence: (title: string | null) => {
		/** */
	}
});

/**
 * Allows the user to edit the course content.
 *
 * Must be wrapped in a provider that provides the form context.
 *
 * @example
 *	const methods = useForm<CourseFormModel>({
 *		defaultValues: { ...course }
 *	});
 *
 * return (
 * 	<FormProvider {...methods}>
 * 		<CourseContentForm />
 * 	</FormProvider>
 * )
 */
export function CourseContentForm() {
	const {
		content,
		summary,
		openNewChapterDialog,
		addChapterDialogClosed,
		onAddChapter,
		onAddLesson,
		showInfo,
		setShowInfo,
		highlightedCompetence,
		setHighlightedCompetence
	} = useCourseContentForm();

	return (
		<HighlightContext.Provider value={{ highlightedCompetence, setHighlightedCompetence }}>
			<section>
				<div className="grid items-stretch gap-8 px-4 xl:grid-cols-[400px_1fr_500px]">
					<TreeView content={content} />

					<SectionCard>
						<SectionCardHeader title="Inhalt" subtitle="Inhalte des Kurses." />
						<button
							type="button"
							className="mb-8 w-fit text-sm text-secondary"
							onClick={() => setShowInfo(v => !v)}
						>
							{showInfo ? "Details ausblenden" : "Details anzeigen"}
						</button>

						<ul className="flex flex-col gap-4">
							{content.map((chapterOrLesson, index) =>
								chapterOrLesson.type === "chapter" ? (
									<Chapter
										key={chapterOrLesson.chapterNr}
										parentChapter=""
										chapter={chapterOrLesson as ChapterWithNr}
										showInfo={showInfo}
										onAddChapter={onAddChapter}
										onAddLesson={onAddLesson}
									/>
								) : (
									<Lesson
										lesson={chapterOrLesson}
										showInfo={showInfo}
										key={chapterOrLesson.lessonId}
									/>
								)
							)}
						</ul>
					</SectionCard>

					<SummaryPanel summary={summary} />
				</div>

				{openNewChapterDialog && <NewChapterDialog onClose={addChapterDialogClosed} />}
			</section>
		</HighlightContext.Provider>
	);
}

function TreeView({ content }: { content: MappedContent }) {
	return (
		<div className="flex overflow-hidden rounded-lg border border-light-border bg-white py-4 px-4">
			<ul className="playlist-scroll overflow-auto">
				{content.map((chapterOrLesson, elementIndex) =>
					chapterOrLesson.type === "lesson" ? (
						<LessonNode key={chapterOrLesson.lessonId} lesson={chapterOrLesson} />
					) : (
						<ChapterNode key={elementIndex} chapter={chapterOrLesson} />
					)
				)}
			</ul>
		</div>
	);
}

function LessonNode({ lesson }: { lesson: LessonWithNr }) {
	const { data } = trpc.lesson.findOne.useQuery({ lessonId: lesson.lessonId });

	return (
		<a
			href={`#${lesson.lessonId}`}
			className="flex items-center whitespace-nowrap text-sm text-light hover:text-secondary"
		>
			<span className="px-2 text-center text-xs text-secondary">{lesson.lessonNr}</span>
			<span className="text-sm">{data ? data.title : "Loading..."}</span>
		</a>
	);
}

function ChapterNode({ chapter }: { chapter: ChapterWithNr }) {
	const [expanded, setExpanded] = useState(true);

	return (
		<li className="flex flex-col">
			<span className="flex items-center justify-between gap-4 py-1">
				<button
					type="button"
					className="absolute -ml-2 text-gray-400"
					onClick={() => setExpanded(v => !v)}
				>
					{expanded ? (
						<ChevronDownIcon className="h-5" />
					) : (
						<ChevronRightIcon className="h-5" />
					)}
				</button>
				<span className="-ml-2 grid grid-cols-[auto_1fr] gap-4 whitespace-nowrap py-1 pl-[32px] text-sm">
					<span className="w-fit min-w-[16px] text-center text-light">
						{chapter.chapterNr}
					</span>
					<span className="font-semibold">{chapter.title}</span>
				</span>
			</span>

			{expanded && (
				<ul className="flex flex-col border-l border-light-border pl-4">
					{chapter.content.map((chapterOrLesson, elementIndex) =>
						chapterOrLesson.type === "lesson" ? (
							<LessonNode key={chapterOrLesson.lessonId} lesson={chapterOrLesson} />
						) : (
							<ChapterNode key={elementIndex} chapter={chapterOrLesson} />
						)
					)}
				</ul>
			)}
		</li>
	);
}

function SummaryPanel({
	summary
}: {
	summary: { count: Summary["count"]; competences: Competence[] };
}) {
	const { highlightedCompetence, setHighlightedCompetence } = useContext(HighlightContext);

	return (
		<div className="flex flex-col rounded-lg border border-light-border bg-white p-8">
			<SectionCardHeader title="Zusammenfassung" />

			<div className="grid grid-cols-2 gap-4">
				<span className="flex flex-col items-center rounded-lg border border-light-border p-4 text-light">
					<span className="font-semibold text-secondary">{summary.count.chapters}</span>
					<span>Kapitel</span>
				</span>
				<span className="flex flex-col items-center rounded-lg border border-light-border p-4 text-light">
					<span className="font-semibold text-secondary">{summary.count.lessons}</span>
					<span>Lerneinheiten</span>
				</span>
				<span className="flex flex-col items-center rounded-lg border border-light-border p-4 text-light">
					<span className="font-semibold text-secondary">{summary.count.quizzes}</span>
					<span>Lernkontrollen</span>
				</span>
				<span className="flex flex-col items-center rounded-lg border border-light-border p-4 text-light">
					<span className="font-semibold text-secondary">
						{summary.competences.length}
					</span>
					<span>Kompetenzen</span>
				</span>
			</div>

			<section className="mt-8 flex flex-col gap-4">
				<div>
					<p className="text-lg font-semibold">Kompetenzen</p>
					<p className="mt-2 text-sm text-light">
						Klicke auf eine Kompetenz, um zugehörige Lernheiten hervorzuheben.
					</p>
				</div>

				<ul className="flex flex-col gap-1 text-sm">
					{summary.competences.map(competence => (
						<button
							key={competence.title}
							type="button"
							onClick={() => setHighlightedCompetence(competence.title)}
							className={`w-fit ${
								highlightedCompetence === competence.title
									? "font-semibold text-secondary"
									: "text-light"
							}`}
						>
							{competence.title} ({competence.level})
						</button>
					))}
				</ul>
			</section>
		</div>
	);
}

function Chapter({
	parentChapter,
	chapter,
	onAddChapter,
	onAddLesson,
	showInfo
}: {
	showInfo: boolean;
	chapter: ChapterWithNr;
	parentChapter: string;
	onAddChapter(chapterId: string): void;
	onAddLesson(chapterId: string, lesson: any): void;
}) {
	const [lessonSelectorOpen, setLessonSelectorOpen] = useState(false);
	const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
	const [expanded, setExpanded] = useState(true);
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();

	function onCloseLessonSelector(lesson?: LessonSummary) {
		setLessonSelectorOpen(false);

		if (lesson) {
			onAddLesson(chapter.chapterId, lesson);
		}
	}

	async function handleLessonEditorClosed(lesson?: LessonFormModel) {
		if (!lesson) {
			return setCreateLessonDialogOpen(false);
		}

		try {
			console.log("Creating lesson...", lesson);
			const result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
			onAddLesson(chapter.chapterId, result);
			setCreateLessonDialogOpen(false);
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Lerneinheit konnte nicht erstellt werden."
			});
		}
	}

	return (
		<li className="flex flex-col rounded-lg border border-light-border bg-white p-4">
			<span className="relative flex items-center justify-between gap-4">
				<span className="flex items-center">
					<button
						type="button"
						className="absolute rounded-full p-2 text-gray-400 hover:bg-gray-100"
						onClick={() => setExpanded(v => !v)}
					>
						{expanded ? (
							<ChevronDownIcon className="h-5" />
						) : (
							<ChevronRightIcon className="h-5" />
						)}
					</button>
					<span className="ml-2 grid grid-cols-[auto_1fr] gap-4 whitespace-nowrap py-1 pl-[32px]">
						<span className="w-fit min-w-[32px] text-center text-light">
							{chapter.chapterNr}
						</span>
						<span className="font-semibold text-secondary">{chapter.title}</span>
					</span>
				</span>

				<div className="flex gap-2">
					<IconButton text="Ändern" icon={<PencilIcon className="h-5" />} />
					<IconButton
						text="Le. erstellen"
						icon={<PlusIcon className="h-5" />}
						onClick={() => setCreateLessonDialogOpen(true)}
					/>
					<IconButton
						text="Le. verknüpfen"
						icon={<LinkIcon className="h-5" />}
						onClick={() => setLessonSelectorOpen(true)}
					/>
					<IconButton
						text="Unterkapitel"
						icon={<PlusIcon className="h-5" />}
						onClick={() => onAddChapter(chapter.chapterId)}
					/>
				</div>
			</span>

			{showInfo && (
				<p className="py-2 pl-12 text-xs text-light">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore impedit sequi
					id enim dolores repellat sapiente officiis, distinctio deserunt dignissimos
					cupiditate optio laboriosam assumenda eaque? Placeat impedit ut cum qui.
				</p>
			)}

			<AnimatePresence initial={false}>
				{expanded && (
					<motion.ul
						initial={{ height: 0 }}
						animate={{ height: "auto" }}
						exit={{ height: 0 }}
						transition={{ type: "tween", duration: 0.2 }}
						className="ml-2 flex flex-col gap-2 overflow-hidden py-2 pl-8"
					>
						{chapter.content.map((chapterOrLesson, elementIndex) =>
							chapterOrLesson.type === "lesson" ? (
								<Lesson
									key={elementIndex}
									lesson={chapterOrLesson as LessonWithNr}
									showInfo={showInfo}
								/>
							) : (
								<Chapter
									key={elementIndex}
									showInfo={showInfo}
									parentChapter={
										parentChapter.length > 0
											? `${parentChapter}.${chapter.chapterNr}`
											: `${chapter.chapterNr}`
									}
									chapter={chapterOrLesson as ChapterWithNr}
									onAddChapter={onAddChapter}
									onAddLesson={onAddLesson}
								/>
							)
						)}
					</motion.ul>
				)}
			</AnimatePresence>
			{lessonSelectorOpen && (
				<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
			)}
			{createLessonDialogOpen && <EditLessonDialog onClose={handleLessonEditorClosed} />}
		</li>
	);
}

function Lesson({ lesson, showInfo }: { lesson: LessonWithNr; showInfo: boolean }) {
	const { data } = trpc.lesson.findOne.useQuery({ lessonId: lesson.lessonId });
	const [lessonEditorDialog, setLessonEditorDialog] = useState(false);
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const trpcContext = trpc.useContext();

	const handleEditDialogClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		if (!updatedLesson) {
			return setLessonEditorDialog(false);
		}

		try {
			const result = await editLessonAsync({
				lesson: updatedLesson,
				lessonId: lesson.lessonId
			});
			showToast({
				type: "success",
				title: "Lerneinheit gespeichert!",
				subtitle: result.title
			});
			setLessonEditorDialog(false);
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Die Lernheit konnte nicht gespeichert werden."
			});
		} finally {
			trpcContext.lesson.findOneAllProps.invalidate({ lessonId: lesson.lessonId });
			trpcContext.lesson.findOne.invalidate({ lessonId: lesson.lessonId });
		}
	};

	return (
		<li
			id={lesson.lessonId}
			className={`grid grid-cols-[auto_1fr_auto] gap-1 whitespace-nowrap rounded-lg border border-light-border bg-gray-50 text-sm ${
				showInfo ? "py-2" : ""
			}`}
		>
			<span className="my-auto min-w-[32px] px-4 text-center text-light">
				{lesson.lessonNr}
			</span>
			<span className="my-auto flex flex-col gap-1">
				<span className="font-medium">{data ? data.title : "Loading..."}</span>
				{/* {showInfo && <Competences requires={lesson.requires} rewards={lesson.rewards} />} */}
			</span>
			<span className="flex items-center gap-2 px-2 text-xs text-gray-400">
				<button
					type="button"
					className="h-fit rounded-full p-2 hover:bg-gray-100"
					onClick={() => setLessonEditorDialog(true)}
				>
					<PencilIcon className="h-4" />
				</button>
			</span>

			{lessonEditorDialog && (
				<EditExistingLessonDialog
					lessonId={lesson.lessonId}
					onClose={handleEditDialogClose}
				/>
			)}
		</li>
	);
}

function Competences({ requires, rewards }: { requires?: Competence[]; rewards?: Competence[] }) {
	const { highlightedCompetence, setHighlightedCompetence } = useContext(HighlightContext);

	return (
		<div className="mt-2 flex flex-col gap-1 text-xs text-light">
			<span className="flex gap-2">
				<span className="font-light text-gray-400">Benötigt:</span>
				<ul className="flex flex-wrap gap-2 text-xs text-light">
					{requires?.map(competence => (
						<button
							key={competence.title}
							type="button"
							className={
								competence.title === highlightedCompetence
									? "font-semibold text-secondary"
									: ""
							}
							onClick={() => setHighlightedCompetence(competence.title)}
						>
							{competence.title} ({competence.level})
						</button>
					))}
				</ul>
			</span>
			<Divider />
			<span className="flex gap-2">
				<span className="font-light text-gray-400">Bringt bei:</span>
				<ul className="flex gap-2 text-xs text-light">
					{rewards?.map(competence => (
						<button
							key={competence.title}
							type="button"
							className={
								competence.title === highlightedCompetence
									? "font-semibold text-secondary"
									: ""
							}
							onClick={() => setHighlightedCompetence(competence.title)}
						>
							{competence.title} ({competence.level})
						</button>
					))}
				</ul>
			</span>
		</div>
	);
}

function EditExistingLessonDialog({
	lessonId,
	onClose
}: {
	lessonId: string;
	onClose: OnDialogCloseFn<LessonFormModel>;
}) {
	const { data } = trpc.lesson.findOneAllProps.useQuery({ lessonId });

	return data ? (
		<EditLessonDialog
			onClose={onClose}
			initialLesson={{
				...data,
				content: (data.content ?? []) as LessonContent,
				quiz: (data.quiz ?? []) as QuizContent
			}}
		/>
	) : null;
}
