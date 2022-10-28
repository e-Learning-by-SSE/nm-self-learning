import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { QuizContent } from "@self-learning/question-types";
import { LessonContent } from "@self-learning/types";
import {
	OnDialogCloseFn,
	SectionCardHeader,
	SectionHeader,
	showToast
} from "@self-learning/ui/common";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { EditLessonDialog } from "./dialogs/edit-lesson-dialog";
import { LessonSelector, LessonSummary } from "./dialogs/lesson-selector";
import { NewChapterDialog } from "./dialogs/new-chapter-dialog";
import { Summary, TeachingChapter } from "./types";
import { useCourseContentForm } from "./use-content-form";

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
		onAddLesson
	} = useCourseContentForm();

	const { setValue } = useFormContext<{ content: unknown[] }>(); // widen content type to prevent circular path error

	return (
		<section>
			<SectionHeader title="Inhalt" subtitle="Der Inhalt des Kurses." />

			<div className="rounded-lg border border-light-border bg-white p-4">TODO</div>

			{openNewChapterDialog && <NewChapterDialog onClose={addChapterDialogClosed} />}
		</section>
	);
}

function LessonNode({ lesson }: { lesson: any }) {
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
		<button
			type="button"
			className="flex items-center whitespace-nowrap text-light hover:text-secondary"
			onClick={() => setLessonEditorDialog(true)}
		>
			<span className="w-8 shrink-0 text-center text-xs text-secondary">
				{lesson.lessonNr}
			</span>
			<span className="text-sm font-normal">{data ? data.title : "Loading..."}</span>

			{lessonEditorDialog && (
				<EditExistingLessonDialog
					lessonId={lesson.lessonId}
					onClose={handleEditDialogClose}
				/>
			)}
		</button>
	);
}

function ChapterNode({
	chapter,
	onAddChapter,
	onAddLesson
}: {
	chapter: TeachingChapter;
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
			// onAddLesson(chapter.chapterId, lesson);
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
			// onAddLesson(chapter.chapterId, result);
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
						{/* {chapter.chapterNr} */}
					</span>
					<span className="font-semibold">{chapter.title}</span>
				</span>
			</span>

			{/* {expanded && (
				<ul className="flex flex-col border-l border-light-border pl-4">
					{chapter.content.map((chapterOrLesson, elementIndex) =>
						chapterOrLesson.type === "lesson" ? (
							<LessonNode key={chapterOrLesson.lessonId} lesson={chapterOrLesson} />
						) : (
						)
					)}
				</ul>
			)} */}

			{lessonSelectorOpen && (
				<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
			)}
			{createLessonDialogOpen && <EditLessonDialog onClose={handleLessonEditorClosed} />}
		</li>
	);
}

function SummaryPanel({ summary }: { summary: { count: Summary["count"]; competences: any[] } }) {
	return (
		<div className="flex flex-col rounded-lg border border-light-border bg-white p-8 xl:max-w-[400px]">
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
					<li className="text-slate-300">Noch nicht implementiert.</li>
				</ul>
			</section>
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
