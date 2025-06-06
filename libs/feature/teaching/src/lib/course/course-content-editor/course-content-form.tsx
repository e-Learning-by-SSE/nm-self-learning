import {
	ArrowDownIcon,
	ArrowUpIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	LinkIcon,
	PencilIcon,
	PlusIcon
} from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { Quiz } from "@self-learning/quiz";
import {
	LessonFormModel,
	onLessonCreatorSubmit,
	onLessonEditorSubmit
} from "@self-learning/teaching";
import { CourseChapter, LessonContent, LessonMeta } from "@self-learning/types";
import { OnDialogCloseFn, SectionHeader, XButton } from "@self-learning/ui/common";
import { useState } from "react";
import { ChapterDialog } from "./dialogs/chapter-dialog";
import { LessonEditorDialogWithGuard } from "./dialogs/lesson-editor-dialog";
import { LessonSelector, LessonSummary } from "./dialogs/lesson-selector";
import { useCourseContentForm } from "./use-content-form";

type UseCourseContentForm = ReturnType<typeof useCourseContentForm>;

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
		updateChapter,
		moveChapter,
		moveLesson,
		addChapter,
		addLesson,
		removeChapter,
		removeLesson
	} = useCourseContentForm();

	const [openNewChapterDialog, setOpenNewChapterDialog] = useState(false);

	function handleAddChapterDialogClose(result?: CourseChapter) {
		if (result) {
			addChapter(result);
		}
		setOpenNewChapterDialog(false);
	}

	function onRemoveChapter(index: number) {
		const confirmed = window.confirm(
			`Kapitel "${content[index].title}" wirklich entfernen? Hinweis: Enthaltene Lerneinheiten werden nicht gelöscht.`
		);

		if (confirmed) {
			removeChapter(index);
		}
	}

	const onRemoveLesson: UseCourseContentForm["removeLesson"] = (
		chapterIndex,
		lessonId: string
	) => {
		const confirmed = window.confirm(
			"Lerneinheit wirklich entfernen? Hinweis: Die Lerneinheit wird nur aus dem Kapitel entfernt und nicht gelöscht."
		);

		if (confirmed) {
			removeLesson(chapterIndex, lessonId);
		}
	};

	return (
		<section>
			<SectionHeader title="Inhalt" subtitle="Der Inhalt des Kurses." />

			<ul className="flex flex-col gap-12">
				{content.map((chapter, index) => (
					<ChapterNode
						key={chapter.title}
						chapter={chapter}
						index={index}
						onChapterUpdated={updateChapter}
						onLessonAdded={addLesson}
						moveChapter={moveChapter}
						onRemove={() => onRemoveChapter(index)}
						moveLesson={moveLesson}
						removeLesson={onRemoveLesson}
					/>
				))}
			</ul>

			<button
				type="button"
				className="btn-primary mt-4"
				onClick={() => setOpenNewChapterDialog(true)}
			>
				<PlusIcon className="mr-2 h-5" />
				<span>Kapitel hinzufügen</span>
			</button>

			{openNewChapterDialog && <ChapterDialog onClose={handleAddChapterDialogClose} />}
		</section>
	);
}

function LessonNode({
	lesson,
	moveLesson,
	onRemove
}: {
	lesson: { lessonId: string };
	moveLesson: UseCourseContentForm["moveLesson"];
	onRemove: () => void;
}) {
	const { data } = trpc.lesson.findOne.useQuery({ lessonId: lesson.lessonId });
	const [lessonEditorDialogOpen, setLessonEditorDialogOpen] = useState(false);

	return (
		<span className="flex justify-between gap-4 rounded-lg bg-white px-4 py-2">
			<div className="flex gap-8">
				<div className="flex gap-4">
					<button
						type="button"
						title="Nach oben"
						className="rounded p-1 hover:bg-gray-200"
						onClick={() => moveLesson(lesson.lessonId, "up")}
					>
						<ArrowUpIcon className="h-3" />
					</button>
					<button
						type="button"
						title="Nach unten"
						className="rounded p-1 hover:bg-gray-200"
						onClick={() => moveLesson(lesson.lessonId, "down")}
					>
						<ArrowDownIcon className="h-3" />
					</button>
				</div>

				<button
					type="button"
					className="flex items-center whitespace-nowrap hover:text-secondary"
					onClick={() => setLessonEditorDialogOpen(true)}
				>
					<span className="text-sm">{data ? data.title : "Loading..."}</span>

					{lessonEditorDialogOpen && (
						<EditExistingLessonDialog
							setLessonEditorDialogOpen={setLessonEditorDialogOpen}
							lessonId={lesson.lessonId}
						/>
					)}
				</button>
			</div>

			<div className="flex gap-4">
				{(data?.meta as LessonMeta)?.hasQuiz && (
					<span className="rounded-full bg-secondary px-3 py-[2px] text-xs font-medium text-white">
						Lernkontrolle
					</span>
				)}
				<XButton onClick={onRemove} title="Entfernen" size="medium" />
			</div>
		</span>
	);
}

function ChapterNode({
	chapter,
	index,
	onLessonAdded,
	moveChapter,
	moveLesson,
	onChapterUpdated,
	onRemove,
	removeLesson
}: {
	chapter: CourseChapter;
	index: number;
	onLessonAdded: UseCourseContentForm["addLesson"];
	moveChapter: UseCourseContentForm["moveChapter"];
	moveLesson: UseCourseContentForm["moveLesson"];
	onChapterUpdated: UseCourseContentForm["updateChapter"];
	onRemove: () => void;
	removeLesson: UseCourseContentForm["removeLesson"];
}) {
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();
	const [lessonSelectorOpen, setLessonSelectorOpen] = useState(false);
	const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
	const [editChapterDialogOpen, setEditChapterDialogOpen] = useState(false);
	const [expanded, setExpanded] = useState(true);

	function onCloseLessonSelector(lesson?: LessonSummary) {
		setLessonSelectorOpen(false);

		if (lesson) {
			onLessonAdded(index, lesson);
		}
	}

	function handleEditChapterDialogClosed(updatedChapter?: CourseChapter) {
		if (updatedChapter) {
			onChapterUpdated(index, updatedChapter);
		}

		setEditChapterDialogOpen(false);
	}

	async function handleCreateDialogClose(lesson?: LessonFormModel) {
		const createdLesson = await onLessonCreatorSubmit(
			() => {
				setCreateLessonDialogOpen(false);
			},
			createLessonAsync,
			lesson
		);

		if (createdLesson) {
			onLessonAdded(index, createdLesson);
		}
	}

	return (
		<li className="flex flex-col gap-2 rounded-lg bg-gray-100 p-4">
			<span className="flex items-center justify-between gap-4">
				<span className="flex items-center gap-4 whitespace-nowrap text-xl font-semibold ">
					<span className="w-fit min-w-[24px] text-center text-gray-400">
						{index + 1}.
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
						<p className="pb-4 text-sm text-light">{chapter.description}</p>
					)}

					<ul className="flex flex-col gap-1">
						{chapter.content.map(lesson => (
							<LessonNode
								key={lesson.lessonId}
								lesson={lesson}
								moveLesson={moveLesson}
								onRemove={() => removeLesson(index, lesson.lessonId)}
							/>
						))}
					</ul>

					<div className="flex flex-wrap items-center justify-between gap-4 pl-4 pt-4">
						<div className="flex gap-4">
							<button
								type="button"
								title="Nach oben"
								className="rounded p-1 hover:bg-gray-300"
								onClick={() => moveChapter(index, "up")}
							>
								<ArrowUpIcon className="h-3" />
							</button>
							<button
								type="button"
								title="Nach unten"
								className="rounded p-1 hover:bg-gray-300"
								onClick={() => moveChapter(index, "down")}
							>
								<ArrowDownIcon className="h-3" />
							</button>
							<button
								type="button"
								className="btn-stroked"
								onClick={() => setEditChapterDialogOpen(true)}
							>
								<PencilIcon className="icon" />
								<span>Editieren</span>
							</button>
						</div>

						<div className="flex gap-4">
							<button
								type="button"
								className="btn-stroked"
								onClick={() => setCreateLessonDialogOpen(true)}
							>
								<PlusIcon className="icon" />
								<span>Neue Lerneinheit erstellen</span>
							</button>

							<button
								type="button"
								className="btn-stroked"
								onClick={() => setLessonSelectorOpen(true)}
							>
								<LinkIcon className="icon" />
								<span>Lerneinheit verknüpfen</span>
							</button>
						</div>

						<button type="button" className="btn-stroked" onClick={onRemove}>
							<span>Entfernen</span>
						</button>
					</div>
				</>
			)}

			{lessonSelectorOpen && (
				<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
			)}
			{createLessonDialogOpen && (
				<LessonEditorDialogWithGuard onClose={handleCreateDialogClose} />
			)}
			{editChapterDialogOpen && (
				<ChapterDialog chapter={chapter} onClose={handleEditChapterDialogClosed} />
			)}
		</li>
	);
}

function EditExistingLessonDialog({
	lessonId,
	setLessonEditorDialogOpen
}: {
	lessonId: string;
	setLessonEditorDialogOpen: (value: boolean) => void;
}) {
	const { data } = trpc.lesson.findOneAllProps.useQuery({ lessonId });
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();

	const handleEditDialogClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		await onLessonEditorSubmit(
			() => {
				setLessonEditorDialogOpen(false);
			},
			editLessonAsync,
			updatedLesson
		);
	};

	return data ? (
		<LessonEditorDialogWithGuard
			onClose={handleEditDialogClose}
			initialLesson={{
				...data,
				requires: data.requires.map(req => ({
					...req,
					children: req.children.map(c => c.name),
					parents: req.parents.map(p => p.name)
				})),
				provides: data.provides.map(goal => ({
					...goal,
					children: goal.children.map(c => c.name),
					parents: goal.parents.map(p => p.name)
				})),
				// currently there is no license label in the UI so we don't need to set this; see sample implementation below
				// licenseId: data.licenseId ?? trpc.licenseRouter.getDefault.useQuery().data?.licenseId ?? 0,
				authors: data.authors.map(a => ({ username: a.username })),
				content: (data.content ?? []) as LessonContent,
				quiz: data.quiz as Quiz
			}}
		/>
	) : null;
}
