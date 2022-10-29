import {
	ArrowDownIcon,
	ArrowUpIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	PlusIcon
} from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { QuizContent } from "@self-learning/question-types";
import { CourseChapter, LessonContent, LessonMeta } from "@self-learning/types";
import { OnDialogCloseFn, SectionHeader, showToast } from "@self-learning/ui/common";
import { useState } from "react";
import { LessonFormModel } from "../../lesson/lesson-form-model";
import { EditLessonDialog } from "./dialogs/edit-lesson-dialog";
import { LessonSelector, LessonSummary } from "./dialogs/lesson-selector";
import { NewChapterDialog } from "./dialogs/new-chapter-dialog";
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
		moveLesson,
		openNewChapterDialog,
		addChapterDialogClosed,
		onAddChapter,
		onAddLesson
	} = useCourseContentForm();

	return (
		<section>
			<SectionHeader title="Inhalt" subtitle="Der Inhalt des Kurses." />

			<ul className="flex flex-col gap-12">
				{content.map((chapter, index) => (
					<ChapterNode
						key={chapter.title}
						chapter={chapter}
						chapterNr={index + 1}
						onAddLesson={onAddLesson}
						moveLesson={moveLesson}
					/>
				))}
			</ul>

			<button className="btn-primary mt-4" onClick={onAddChapter}>
				<PlusIcon className="mr-2 h-5" />
				<span>Kapitel hinzufügen</span>
			</button>

			{openNewChapterDialog && <NewChapterDialog onClose={addChapterDialogClosed} />}
		</section>
	);
}

function LessonNode({ lesson, moveLesson }: { lesson: { lessonId: string }; moveLesson: any }) {
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
		<span className="flex justify-between gap-4 rounded-lg bg-gray-200 px-4 py-2">
			<div className="flex gap-8">
				<div className="flex gap-4">
					<button
						type="button"
						className="rounded p-1 hover:bg-gray-300"
						onClick={() => moveLesson(lesson.lessonId, "up")}
					>
						<ArrowUpIcon className="h-3" />
					</button>
					<button
						type="button"
						className="rounded p-1 hover:bg-gray-300"
						onClick={() => moveLesson(lesson.lessonId, "down")}
					>
						<ArrowDownIcon className="h-3" />
					</button>
				</div>

				<button
					type="button"
					className="flex items-center whitespace-nowrap hover:text-secondary"
					onClick={() => setLessonEditorDialog(true)}
				>
					<span className="text-sm">{data ? data.title : "Loading..."}</span>

					{lessonEditorDialog && (
						<EditExistingLessonDialog
							lessonId={lesson.lessonId}
							onClose={handleEditDialogClose}
						/>
					)}
				</button>
			</div>

			{(data?.meta as LessonMeta)?.hasQuiz && (
				<span className="rounded-full bg-secondary px-3 py-[2px] text-xs font-medium text-white">
					Lernkontrolle
				</span>
			)}
		</span>
	);
}

function ChapterNode({
	chapter,
	chapterNr,
	onAddLesson,
	moveLesson
}: {
	chapter: CourseChapter;
	chapterNr: number;
	onAddLesson(chapterId: string, lesson: any): void;
	moveLesson: any;
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
		<li className="flex flex-col rounded-lg bg-gray-100 p-4">
			<span className="flex items-center justify-between gap-4">
				<span className="flex items-center gap-4 whitespace-nowrap text-xl font-semibold ">
					<span className="w-fit min-w-[24px] text-center text-gray-400">
						{chapterNr}.
					</span>
					<span className="tracking-tight text-secondary">{chapter.title}</span>
				</span>

				<button
					type="button"
					className="text-gray-400"
					onClick={() => setExpanded(v => !v)}
				>
					{expanded ? (
						<ChevronDownIcon className="h-5" />
					) : (
						<ChevronLeftIcon className="h-5" />
					)}
				</button>
			</span>

			{expanded && (
				<>
					{chapter.description && chapter.description.length > 0 && (
						<p className="pt-2 pb-4 text-sm text-light">{chapter.description}</p>
					)}

					<ul className="flex flex-col gap-1">
						{chapter.content.map((lesson, index) => (
							<LessonNode
								key={lesson.lessonId}
								lesson={lesson}
								moveLesson={moveLesson}
							/>
						))}
						<button
							type="button"
							className="mx-auto mt-2 flex w-fit items-center rounded-full bg-secondary p-2 transition-transform hover:scale-110"
							title="Hinzufügen"
						>
							<PlusIcon className="h-5 text-white" />
						</button>
					</ul>
				</>
			)}

			{lessonSelectorOpen && (
				<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
			)}
			{createLessonDialogOpen && <EditLessonDialog onClose={handleLessonEditorClosed} />}
		</li>
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
