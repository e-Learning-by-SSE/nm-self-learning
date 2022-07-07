import { Combobox, Dialog as HeadlessDialog } from "@headlessui/react";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	LinkIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	SwitchVerticalIcon
} from "@heroicons/react/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { lessonSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	Divider,
	IconButton,
	OnDialogCloseFn,
	SectionCard,
	SectionCardHeader
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { getRandomId } from "@self-learning/util/common";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, Fragment, useCallback, useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { LessonFormModel } from "../lesson/lesson-form-model";

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
	hasQuiz: boolean;
	requires?: Competence[];
	rewards?: Competence[];
};

type Competence = { title: string; level: number; context?: string };

type Content = (Chapter | Lesson)[];

type Summary = {
	count: {
		lessons: number;
		chapters: number;
		quizzes: number;
	};
	competences: Map<string, Competence>;
};

type MappedContent = (ChapterWithNr | LessonWithNr)[];

function mapContent(content: Content, lessonNrPtr = { lessonNr: 1 }): MappedContent {
	let chapterNr = 1;

	const mappedContent: MappedContent = content.map((item): MappedContent[0] => {
		if (item.type === "chapter") {
			return {
				type: "chapter",
				chapterNr: chapterNr++,
				chapterId: getRandomId(),
				content: mapContent(item.content, lessonNrPtr),
				title: item.title
			};
		}

		if (item.type === "lesson") {
			return {
				...item,
				lessonNr: lessonNrPtr.lessonNr++
			};
		}

		return item;
	});

	return mappedContent;
}

function traverseContent(content: MappedContent, fn: (c: MappedContent[0]) => void) {
	content.forEach(item => {
		if (item.type === "chapter") {
			fn(item);
			traverseContent(item.content, fn);
		} else {
			fn(item);
		}
	});
}

function createSummary(content: MappedContent) {
	const summary: Summary = {
		competences: new Map<string, Competence>(),
		count: {
			chapters: 0,
			lessons: 0,
			quizzes: 0
		}
	};

	traverseContent(content, item => {
		if (item.type === "chapter") {
			summary.count.chapters++;
		} else if (item.type === "lesson") {
			summary.count.lessons++;

			if (item.hasQuiz) {
				summary.count.quizzes++;
			}

			if (item.rewards) {
				for (const competence of item.rewards) {
					const exists = summary.competences.get(competence.title);

					if (!exists || exists.level < competence.level) {
						summary.competences.set(competence.title, competence);
					}
				}
			}
		}
	});

	return summary;
}

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
	const [content, setContent] = useState<MappedContent>(
		mapContent([
			{
				type: "chapter",
				title: "Chapter 1",
				content: [
					{
						type: "lesson",
						title: "Lesson 1",
						lessonId: getRandomId(),
						hasQuiz: true,
						requires: [],
						rewards: [
							{ level: 1, title: "elementary-command" },
							{ level: 1, title: "basic-program-structure" }
						]
					},
					{
						type: "lesson",
						title: "Lesson 2",
						lessonId: getRandomId(),
						hasQuiz: true,
						requires: [{ level: 1, title: "elementary-command" }],
						rewards: [{ level: 2, title: "elementary-command" }]
					},
					{
						type: "chapter",
						title: "Chapter 1.1",
						content: [
							{
								type: "lesson",
								title: "Lesson 3",
								lessonId: getRandomId(),
								hasQuiz: true,
								requires: [
									{ level: 2, title: "elementary-command" },
									{ level: 2, title: "basic-program-structure" }
								],
								rewards: [{ level: 3, title: "elementary-command" }]
							},
							{
								type: "lesson",
								title: "Lesson 4",
								hasQuiz: false,
								lessonId: getRandomId()
							}
						]
					},
					{
						type: "chapter",
						title: "Chapter 1.2",
						content: [
							{
								type: "lesson",
								title: "Lesson 5",
								hasQuiz: false,
								lessonId: getRandomId()
							},
							{
								type: "lesson",
								title: "Lesson 6",
								hasQuiz: false,
								lessonId: getRandomId()
							},
							{
								type: "chapter",
								title: "Nested Chapter",
								content: [
									{
										type: "lesson",
										title: "Nested Lesson 1",
										hasQuiz: true,
										lessonId: getRandomId()
									},
									{
										type: "lesson",
										title: "Nested Lesson 2",
										hasQuiz: true,
										lessonId: getRandomId()
									}
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
							{
								type: "lesson",
								title: "Lesson 7",
								hasQuiz: true,
								lessonId: getRandomId()
							},
							{
								type: "lesson",
								title: "Lesson 8",
								hasQuiz: true,
								lessonId: getRandomId()
							}
						]
					},
					{
						type: "chapter",
						title: "Chapter 2.2",
						content: [
							{
								type: "lesson",
								title: "Lesson 9",
								hasQuiz: true,
								lessonId: getRandomId()
							},
							{
								type: "lesson",
								title: "Lesson 10",
								hasQuiz: true,
								lessonId: getRandomId()
							}
						]
					},
					{ type: "lesson", title: "Lesson 11", hasQuiz: true, lessonId: getRandomId() }
				]
			}
		])
	);

	const summary = useMemo(() => {
		const sum = createSummary(content);
		return { count: sum.count, competences: [...sum.competences.values()] };
	}, [content]);

	const [openNewChapterDialog, setOpenNewChapterDialog] = useState(false);
	const [addChapterTarget, setAddChapterTarget] = useState<string | null>(null);
	const [showInfo, setShowInfo] = useState(true);
	const [highlightedCompetence, _setHighlightedCompetence] = useState<string | null>(null);

	const setHighlightedCompetence = useCallback(
		(title: string | null) => {
			setShowInfo(true);
			_setHighlightedCompetence(current => (current === title ? null : title));
		},
		[_setHighlightedCompetence]
	);

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
		<HighlightContext.Provider value={{ highlightedCompetence, setHighlightedCompetence }}>
			<section>
				<div className="grid gap-8 px-4 xl:grid-cols-[1fr_500px] xl:px-64">
					<SectionCard>
						<SectionCardHeader title="Inhalt" subtitle="Inhalte des Kurses." />
						<button
							type="button"
							className="mb-8 w-fit text-sm text-secondary"
							onClick={() => setShowInfo(v => !v)}
						>
							{showInfo ? "Details ausblenden" : "Details anzeigen"}
						</button>

						<ul className="flex flex-col gap-4 rounded-lg border border-light-border bg-gray-50 p-4">
							{content.map((chapter, index) => (
								<Chapter
									key={index}
									parentChapter=""
									chapter={chapter as ChapterWithNr}
									onAddChapter={onAddChapter}
									showInfo={showInfo}
								/>
							))}
						</ul>
					</SectionCard>

					<SummaryPanel summary={summary} />
				</div>

				{openNewChapterDialog && <NewChapterDialog onClose={addChapterDialogClosed} />}
			</section>
		</HighlightContext.Provider>
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
	showInfo
}: {
	showInfo: boolean;
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

	const chapterNr =
		parentChapter.length > 0 ? `${parentChapter}.${chapter.chapterNr}` : `${chapter.chapterNr}`;

	const depth = chapterNr.split(".").length;

	// increase background opacity for each level

	return (
		<li className="flex flex-col py-4">
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
							{chapterNr}
						</span>
						<span className="font-semibold text-secondary">{chapter.title}</span>
					</span>
				</span>

				<div className="group flex gap-2">
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

function Lesson({ lesson, showInfo }: { lesson: LessonWithNr; showInfo: boolean }) {
	return (
		<li className="grid grid-cols-[auto_1fr_auto] gap-1 whitespace-nowrap rounded-lg border border-light-border bg-white py-2 text-sm">
			<span className="my-auto min-w-[32px] px-4 text-center text-light">
				{lesson.lessonNr}
			</span>
			<span className="my-auto flex flex-col gap-1">
				<span className="font-medium">{lesson.title}</span>
				{showInfo && <Competences requires={lesson.requires} rewards={lesson.rewards} />}
			</span>
			<span className="flex items-center gap-2 px-2 text-xs text-gray-400">
				<button type="button" className="h-fit rounded-full p-2 hover:bg-gray-100">
					<PencilIcon className="h-4" />
				</button>
				<button type="button" className="h-fit rounded-full p-2 hover:bg-gray-100">
					<SwitchVerticalIcon className="h-4" />
				</button>
			</span>
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
		keepPreviousData: true,
		enabled: title.length > 0
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
