import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import {
	ArrowSmDownIcon,
	ArrowSmUpIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	LinkIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	XIcon
} from "@heroicons/react/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { lessonSchema } from "@self-learning/types";
import { Dialog, DialogActions, OnDialogCloseFn, SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { getRandomId } from "@self-learning/util/common";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Fragment, useState } from "react";
import {
	useFieldArray,
	UseFieldArrayRemove,
	UseFieldArraySwap,
	useForm,
	useFormContext,
	UseFormRegister,
	useWatch
} from "react-hook-form";
import slugify from "slugify";
import { LessonFormModel } from "../lesson/lesson-form-model";
import { CourseFormModel } from "./course-form-model";

type Chapter = {
	type: "chapter";
	title: string;
	content: Content;
};

type ChapterWithNr = {
	type: "chapter";
	title: string;
	chapterNr: number;
	chapterId: string;
	content: MappedContent;
};
type LessonWithNr = Lesson & { lessonNr: number; lessonId: string };

type Lesson = {
	type: "lesson";
	title: string;
	lessonId: string;
};

type Content = (Chapter | Lesson)[];
type MappedContent = (ChapterWithNr | LessonWithNr)[];

function mapContent(content: Content, lessonNrPtr = { lessonNr: 1 }): MappedContent {
	let chapterNr = 1;

	return content.map((item): MappedContent[0] => {
		if (item.type === "chapter") {
			return {
				type: "chapter",
				chapterId: getRandomId(),
				chapterNr: chapterNr++,
				content: mapContent(item.content, lessonNrPtr),
				title: item.title
			};
		}

		if (item.type === "lesson") {
			return {
				type: "lesson",
				lessonId: item.lessonId,
				title: item.title,
				lessonNr: lessonNrPtr.lessonNr++
			};
		}

		return item;
	});
}

const baseContent: Chapter[] = [
	{
		type: "chapter",
		title: "Chapter 1",
		content: [
			{ type: "lesson", title: "Lesson 1", lessonId: getRandomId() },
			{ type: "lesson", title: "Lesson 2", lessonId: getRandomId() },
			{
				type: "chapter",
				title: "Chapter 1.1",
				content: [
					{ type: "lesson", title: "Lesson 3", lessonId: getRandomId() },
					{ type: "lesson", title: "Lesson 4", lessonId: getRandomId() }
				]
			},
			{
				type: "chapter",
				title: "Chapter 1.2",
				content: [
					{ type: "lesson", title: "Lesson 5", lessonId: getRandomId() },
					{ type: "lesson", title: "Lesson 6", lessonId: getRandomId() },
					{
						type: "chapter",
						title: "Nested Chapter",
						content: [
							{ type: "lesson", title: "Nested Lesson 1", lessonId: getRandomId() },
							{ type: "lesson", title: "Nested Lesson 2", lessonId: getRandomId() }
						]
					}
				]
			}
		]
	},
	{
		type: "chapter",
		title: "Chapter 2",
		content: [
			{
				type: "chapter",
				title: "Chapter 2.1",
				content: [
					{ type: "lesson", title: "Lesson 7", lessonId: getRandomId() },
					{ type: "lesson", title: "Lesson 8", lessonId: getRandomId() }
				]
			},
			{
				type: "chapter",
				title: "Chapter 2.2",
				content: [
					{ type: "lesson", title: "Lesson 9", lessonId: getRandomId() },
					{ type: "lesson", title: "Lesson 10", lessonId: getRandomId() }
				]
			},
			{ type: "lesson", title: "Lesson 11", lessonId: getRandomId() }
		]
	}
];

function findChapterById(content: MappedContent, id: string): ChapterWithNr | null {
	for (const chapter of content) {
		if (chapter.type === "chapter") {
			if (chapter.chapterId === id) {
				return chapter;
			}

			const found = findChapterById(chapter.content, id);
			if (found) {
				return found;
			}
		}
	}

	return null;
}

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
	// const { register, control } = useFormContext<CourseFormModel>();
	// const {
	// 	append,
	// 	remove,
	// 	swap,
	// 	fields: chapters
	// } = useFieldArray({
	// 	control,
	// 	name: "content"
	// });

	// const addChapter = useCallback(() => {
	// 	append({
	// 		chapterId: getRandomId(),
	// 		title: "",
	// 		description: "",
	// 		lessons: []
	// 	});
	// }, [append]);

	const [content, setContent] = useState<MappedContent>(mapContent(baseContent));
	const [openNewChapterDialog, setOpenNewChapterDialog] = useState(false);
	const [addChapterTarget, setAddChapterTarget] = useState<string | null>(null);

	function onAddChapter(chapterId: string) {
		// Find chapter with chapterId
		console.log(chapterId);
		setAddChapterTarget(chapterId);
		setOpenNewChapterDialog(true);
	}

	function addChapterDialogClosed(result?: NewChapterDialogResult) {
		console.log(result);
		setOpenNewChapterDialog(false);

		if (result && addChapterTarget) {
			setContent(prev => {
				const chapter = findChapterById(prev, addChapterTarget);

				if (chapter) {
					chapter.content.push({
						type: "chapter",
						chapterId: getRandomId(),
						title: result.title,
						content: [],
						chapterNr: 0 // will be set by mapContent
					});
				}

				return mapContent(prev);
			});
		}

		setAddChapterTarget(null);
	}

	return (
		<CenteredContainer>
			<SectionHeader title="Inhalt" subtitle="Inhalte des Kurses." />

			<div className="card overflow-hidden bg-white">
				<ul className="playlist-scroll flex flex-col overflow-auto">
					{content.map((chapter, index) => (
						<Chapter
							key={index}
							parentChapter=""
							chapter={chapter as ChapterWithNr}
							onAddChapter={onAddChapter}
						/>
					))}
				</ul>
			</div>

			{openNewChapterDialog && <NewChapterDialog onClose={addChapterDialogClosed} />}
		</CenteredContainer>
	);
}

function Chapter({
	parentChapter,
	chapter,
	onAddChapter
}: {
	chapter: ChapterWithNr;
	parentChapter: string;
	onAddChapter(chapterId: string): void;
}) {
	const [lessonSelectorOpen, setLessonSelectorOpen] = useState(false);
	const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
	const [expanded, setExpanded] = useState(true);

	function onCloseLessonSelector(lesson?: LessonSummary) {
		console.log(lesson);
		setLessonSelectorOpen(false);
	}

	function onCreateLesson(a: any) {
		//
		setCreateLessonDialogOpen(false);
	}

	return (
		<li className="group flex flex-col pt-2">
			<span className="relative flex items-center gap-4">
				<button
					type="button"
					className="absolute text-gray-400"
					onClick={() => setExpanded(v => !v)}
				>
					{expanded ? (
						<ChevronDownIcon className="h-5" />
					) : (
						<ChevronRightIcon className="h-5" />
					)}
				</button>
				<span className="group ml-2 grid grid-cols-[auto_1fr] gap-4 whitespace-nowrap py-1 pl-[32px]">
					<span className="w-fit min-w-[32px] text-center text-light">
						{parentChapter.length > 0
							? `${parentChapter}.${chapter.chapterNr}`
							: `${chapter.chapterNr}`}
					</span>
					<span className="font-semibold">{chapter.title}</span>
				</span>

				<div className="group flex gap-2">
					<button
						type="button"
						className="flex shrink-0 items-center gap-1 rounded-full border border-light-border  p-1 px-3 text-gray-300 transition-colors hover:bg-secondary hover:text-white"
					>
						<PencilIcon className="h-5" />
						<span className="text-xs">Ändern</span>
					</button>
					<button
						type="button"
						className="flex shrink-0 items-center gap-1 rounded-full border border-light-border  p-1 px-3 text-gray-300 transition-colors hover:bg-secondary hover:text-white"
						title="Neue Lerneinheit erstellen"
						onClick={() => setCreateLessonDialogOpen(true)}
					>
						<PlusIcon className="h-5" />
						<span className="text-xs">Le. erstellen</span>
					</button>
					<button
						type="button"
						className="flex shrink-0 items-center gap-1 rounded-full border border-light-border  p-1 px-3 text-gray-300 transition-colors hover:bg-secondary hover:text-white"
						title="Existierende Lerneinheit verknüpfen"
						onClick={() => setLessonSelectorOpen(true)}
					>
						<LinkIcon className="h-5" />
						<span className="text-xs">Le. verknüpfen</span>
					</button>
					<button
						type="button"
						className="flex shrink-0 items-center gap-1 rounded-full border border-light-border  p-1 px-3 text-gray-300 transition-colors hover:bg-secondary hover:text-white"
						onClick={() => onAddChapter(chapter.chapterId)}
					>
						<PlusIcon className="h-5" />
						<span className="text-xs">Unterkapitel</span>
					</button>
				</div>
			</span>
			<AnimatePresence initial={false}>
				{expanded && (
					<motion.ul
						initial={{ height: 0 }}
						animate={{ height: "auto" }}
						exit={{ height: 0 }}
						transition={{ type: "tween", duration: 0.2 }}
						className="ml-2 flex flex-col overflow-hidden border-l border-light-border py-2 pl-8"
					>
						{chapter.content.map((chapterOrLesson, elementIndex) =>
							chapterOrLesson.type === "lesson" ? (
								<Lesson
									key={elementIndex}
									lesson={chapterOrLesson as LessonWithNr}
								/>
							) : (
								<Chapter
									key={elementIndex}
									parentChapter={
										parentChapter.length > 0
											? `${parentChapter}.${chapter.chapterNr}`
											: `${chapter.chapterNr}`
									}
									chapter={chapterOrLesson as ChapterWithNr}
									onAddChapter={onAddChapter}
								/>
							)
						)}
					</motion.ul>
				)}
			</AnimatePresence>
			{lessonSelectorOpen && (
				<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
			)}
			{createLessonDialogOpen && <CreateLessonDialog onClose={onCreateLesson} />}
		</li>
	);
}

function Lesson({ lesson }: { lesson: LessonWithNr }) {
	return (
		<li className="grid grid-cols-[auto_1fr] gap-4 whitespace-nowrap py-1 text-sm">
			<span className="min-w-[32px] text-center text-light">{lesson.lessonNr}</span>
			<span>{lesson.title}</span>
		</li>
	);
}

type NewChapterDialogResult = { title: string; description?: string };

function NewChapterDialog({ onClose }: { onClose: (result?: NewChapterDialogResult) => void }) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	return (
		<Dialog title="Kapitel hinzufügen" onClose={onClose}>
			<div className="flex flex-col gap-8">
				<LabeledField label="Titel">
					<input
						className="textfield"
						value={title}
						onChange={e => setTitle(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && title.length > 0) {
								onClose({ title, description });
							}
						}}
					/>
				</LabeledField>

				<LabeledField label="Beschreibung">
					<textarea
						className="textfield"
						value={description}
						onChange={e => setDescription(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && title.length > 0) {
								onClose({ title, description });
							}
						}}
					/>
				</LabeledField>

				<DialogActions onClose={onClose}>
					<button
						type="button"
						className="btn-primary"
						onClick={() => onClose({ title, description })}
					>
						Hinzufügen
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}

function CreateLessonDialog({ onClose }: { onClose: OnDialogCloseFn<any> }) {
	const {
		register,
		getValues,
		setValue,
		handleSubmit,
		formState: { errors }
	} = useForm<LessonFormModel>({
		defaultValues: {
			content: [],
			quiz: [],
			title: "",
			slug: ""
		},
		resolver: zodResolver(lessonSchema)
	});

	function slugifyTitle() {
		const title = getValues("title");
		const slug = slugify(title, { lower: true });
		setValue("slug", slug);
	}

	return (
		<Dialog title="Neue Lerneinheit erstellen" onClose={onClose}>
			<form
				id="lessonForm"
				className="flex flex-col gap-8 overflow-auto"
				onSubmit={handleSubmit(data => {
					console.log(data);
				})}
			>
				<LabeledField label="Titel" error={errors.title?.message}>
					<input
						{...register("title")}
						placeholder="Die Neue Lerneinheit"
						onBlur={() => {
							if (getValues("slug") === "") {
								slugifyTitle();
							}
						}}
					/>
				</LabeledField>

				<div className="grid items-start gap-2 sm:flex">
					<LabeledField label="Slug" error={errors.slug?.message}>
						<input
							{...register("slug")}
							placeholder='Wird in der URL angezeigt, z. B.: "die-neue-lerneinheit"'
						/>
					</LabeledField>

					<button
						type="button"
						className="btn-stroked h-fit self-end"
						onClick={slugifyTitle}
					>
						Generieren
					</button>
				</div>

				<DialogActions onClose={onClose}>
					<button type="submit" className="btn-primary" form="lessonForm">
						Erstellen
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

function ChapterForm({
	index,
	chapterId,
	remove,
	register,
	swap,
	isLast
}: {
	index: number;
	chapterId: string;
	register: UseFormRegister<CourseFormModel>;
	swap: UseFieldArraySwap;
	remove: UseFieldArrayRemove;
	isLast: boolean;
}) {
	const {
		formState: { errors }
	} = useFormContext<CourseFormModel>();

	return (
		<Form.SectionCard>
			<LabeledField
				label={`Kapitel ${index + 1}`}
				error={errors.content?.[index]?.title?.message}
			>
				<input
					{...register(`content.${index}.title`)}
					placeholder={`Kapitel ${index + 1}`}
				/>
			</LabeledField>

			<LabeledField label="Beschreibung">
				<textarea
					rows={3}
					{...register(`content.${index}.description`)}
					placeholder="Beschreibung des Kapitels"
				/>
			</LabeledField>

			<Lessons chapterIndex={index} chapterId={chapterId} />

			<div className="flex w-full justify-center gap-4">
				<button
					type="button"
					className="rounded border border-light-border p-1 disabled:text-slate-200"
					title="Nach oben verschieben"
					onClick={() => swap(index, index - 1)}
					disabled={index === 0}
				>
					<ArrowSmUpIcon className="h-5" />
				</button>
				<button
					type="button"
					className="rounded border border-light-border p-1 disabled:text-slate-200"
					title="Nach unten verschieben"
					onClick={() => swap(index, index + 1)}
					disabled={isLast}
				>
					<ArrowSmDownIcon className="h-5" />
				</button>
				<button
					type="button"
					className="rounded border border-light-border p-1 text-red-500"
					title="Entfernen"
					onClick={() => remove(index)}
				>
					<XIcon className="h-5" />
				</button>
			</div>
		</Form.SectionCard>
	);
}

function Lessons({ chapterIndex, chapterId }: { chapterIndex: number; chapterId: string }) {
	const [open, setOpen] = useState(false);

	const { control, setValue } = useFormContext<CourseFormModel>();
	const {
		append: addLesson,
		remove: removeLesson,
		swap: swapLesson,
		fields: lessons
	} = useFieldArray({
		control,
		name: `content.${chapterIndex}.lessons`
	});

	const lessonList = useWatch({
		name: `content.${chapterIndex}.lessons`,
		control
	});

	function onLessonSelected(lesson?: LessonSummary) {
		setOpen(false);
		if (lesson) {
			addLesson({
				lessonId: lesson.lessonId,
				slug: lesson.slug,
				title: lesson.title
			});
		}
	}

	function onReorder(lessons: LessonSummary[]) {
		setValue(`content.${chapterIndex}.lessons`, lessons);
	}

	return (
		<LabeledField label="Lerneinheiten">
			<Reorder.Group
				onReorder={onReorder}
				values={lessonList}
				axis="y"
				className="flex flex-col divide-y divide-light-border overflow-hidden"
			>
				<AnimatePresence>
					{lessonList.map((lesson, lessonIndex) => (
						<Reorder.Item
							value={lesson}
							key={lesson.lessonId}
							className="flex flex-wrap items-center justify-between gap-2 bg-white p-3"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<span className="flex gap-4 text-sm font-medium">
								<span className="text-secondary">{lessonIndex + 1}.</span>
								<span>{lesson.title}</span>
							</span>
							<div className="flex gap-2">
								<button
									type="button"
									className="rounded border border-light-border p-1 disabled:text-slate-200"
									title="Nach oben verschieben"
									onClick={() => swapLesson(lessonIndex, lessonIndex - 1)}
									disabled={lessonIndex === 0}
								>
									<ArrowSmUpIcon className="h-5" />
								</button>
								<button
									type="button"
									className="rounded border border-light-border p-1 disabled:text-slate-200"
									title="Nach unten verschieben"
									onClick={() => swapLesson(lessonIndex, lessonIndex + 1)}
									disabled={lessonIndex === lessons.length - 1}
								>
									<ArrowSmDownIcon className="h-5" />
								</button>
								<button
									type="button"
									className="rounded border border-light-border p-1 text-red-500"
									title="Entfernen"
									onClick={() => removeLesson(lessonIndex)}
								>
									<XIcon className="h-5" />
								</button>
							</div>
						</Reorder.Item>
					))}
				</AnimatePresence>
				<div className="py-1">
					<motion.button
						layoutId={`add-${chapterId}`}
						layout="position"
						type="button"
						className="btn-stroked mt-2 w-full"
						onClick={() => setOpen(true)}
					>
						<PlusIcon className="h-5" />
					</motion.button>
				</div>
			</Reorder.Group>

			{open && <LessonSelector open={open} onClose={onLessonSelected} />}
		</LabeledField>
	);
}

export function LessonSelector({
	open,
	onClose
}: {
	open: boolean;
	onClose: (lesson?: LessonSummary) => void;
}) {
	const [title, setTitle] = useState("");
	const { data } = trpc.useQuery(["lessons.findMany", { title }], {
		staleTime: 10_000,
		keepPreviousData: true
	});

	return (
		<HeadlessDialog open={open} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full translate-y-1/4 justify-center">
					{/* The actual dialog panel  */}
					<HeadlessDialog.Panel
						className="mx-auto flex h-fit w-[90vw] flex-col overflow-hidden rounded-lg bg-white lg:w-[800px]"
						style={{ maxHeight: "624px" }}
					>
						<Combobox value={null} onChange={onClose}>
							<span className="flex items-center border-b border-b-light-border py-1 px-3">
								<SearchIcon className="h-6 text-light" />
								<Combobox.Input
									className="w-full border-none focus:ring-0"
									placeholder="Suche nach Titel"
									onChange={e => setTitle(e.target.value)}
								/>
							</span>
							<div className="divide-border-light playlist-scroll mt-8 flex flex-col divide-y overflow-auto">
								<Combobox.Options className="flex flex-col divide-y divide-light-border">
									{data?.lessons.map(lesson => (
										<Combobox.Option
											value={lesson}
											key={lesson.lessonId}
											as={Fragment}
										>
											{({ active }) => (
												<button
													type="button"
													className={`flex flex-col gap-1 rounded px-4 py-2 ${
														active ? "bg-secondary text-white" : ""
													}`}
												>
													<span className="text-sm font-medium ">
														{lesson.title}
													</span>
													<span
														className={`text-xs font-normal ${
															active ? "text-white" : "text-light"
														}`}
													>
														von{" "}
														{lesson.authors
															.map(a => a.displayName)
															.join(", ")}
													</span>
												</button>
											)}
										</Combobox.Option>
									))}
								</Combobox.Options>
							</div>
						</Combobox>
					</HeadlessDialog.Panel>
				</div>
			</div>
		</HeadlessDialog>
	);
}

type LessonSummary = { lessonId: string; title: string; slug: string };
