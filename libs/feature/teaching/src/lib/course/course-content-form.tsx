import { Combobox, Dialog } from "@headlessui/react";
import {
	ArrowSmDownIcon,
	ArrowSmUpIcon,
	PlusIcon,
	SearchIcon,
	XIcon
} from "@heroicons/react/solid";
import { apiFetch, FindLessonsResponse } from "@self-learning/api";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Fragment, useCallback, useState } from "react";
import {
	useFieldArray,
	UseFieldArrayRemove,
	UseFieldArraySwap,
	useFormContext,
	UseFormRegister
} from "react-hook-form";
import { useQuery } from "react-query";
import { CourseFormModel } from "./course-editor";

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
	const { register, control } = useFormContext<CourseFormModel>();
	const {
		append,
		remove,
		swap,
		fields: chapters
	} = useFieldArray({
		control,
		name: "content"
	});

	const addChapter = useCallback(() => {
		append({
			title: "",
			description: "",
			lessons: []
		});
	}, [append]);

	return (
		<CenteredContainer>
			<SectionHeader title="Inhalt" subtitle="Inhalte des Kurses." />

			<motion.div
				layout="size"
				className="flex flex-col gap-16"
				initial={{ height: 0 }}
				animate={{ height: "auto" }}
				transition={{ duration: 0.3, type: "tween" }}
			>
				<AnimatePresence>
					{chapters.map((chapter, index) => (
						<motion.div
							layout
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							key={chapter.id}
						>
							<ChapterForm
								index={index}
								register={register}
								remove={remove}
								swap={swap}
								isLast={index === chapters.length - 1}
							/>
						</motion.div>
					))}
				</AnimatePresence>
			</motion.div>

			{chapters.length === 0 ? (
				<button
					type="button"
					onClick={addChapter}
					title="Kapitel hinzufügen"
					className="flex w-full flex-col place-items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white px-8 py-16 text-secondary"
				>
					<PlusIcon className="h-6" />
					<span className="font-semibold">Kapitel hinzufügen</span>
				</button>
			) : (
				<div className="flex place-content-center pt-8">
					<button
						type="button"
						onClick={addChapter}
						title="Kapitel hinzufügen"
						className="rounded-full bg-secondary p-4 text-white"
					>
						<PlusIcon className="h-6" />
					</button>
				</div>
			)}
		</CenteredContainer>
	);
}

function ChapterForm({
	index,
	remove,
	register,
	swap,
	isLast
}: {
	index: number;
	register: UseFormRegister<CourseFormModel>;
	swap: UseFieldArraySwap;
	remove: UseFieldArrayRemove;
	isLast: boolean;
}) {
	return (
		<Form.SectionCard>
			<LabeledField label={`Kapitel ${index + 1}`}>
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

			<Lessons chapterIndex={index} />

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

function Lessons({ chapterIndex }: { chapterIndex: number }) {
	const [open, setOpen] = useState(false);

	const { control } = useFormContext<CourseFormModel>();
	const {
		append: addLesson,
		remove: removeLesson,
		swap: swapLesson,
		fields: lessons
	} = useFieldArray({
		control,
		name: `content.${chapterIndex}.lessons`
	});

	function onLessonSelected(lesson?: FindLessonsResponse[0]) {
		setOpen(false);
		if (lesson) {
			addLesson({
				lessonId: lesson.lessonId,
				slug: lesson.slug,
				title: lesson.title
			});
		}
	}

	return (
		<LabeledField label="Lerneinheiten">
			<div className="flex flex-col divide-y divide-light-border">
				{lessons.map((lesson, lessonIndex) => (
					<div
						key={lesson.lessonId}
						className="flex flex-wrap items-center justify-between gap-2 rounded-lg p-3"
					>
						<Link href={`/teaching/lessons/edit/${lesson.slug}`}>
							<a className="flex gap-4 text-sm font-medium">
								<span className="text-secondary">{lessonIndex + 1}.</span>
								<span>{lesson.title}</span>
							</a>
						</Link>
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
					</div>
				))}
				<div className="py-1">
					<button
						type="button"
						className="btn-stroked mt-2 w-full"
						onClick={() => setOpen(true)}
					>
						<PlusIcon className="h-5" />
					</button>
				</div>
			</div>
			{open && <LessonSelector open={open} onClose={onLessonSelected} />}
		</LabeledField>
	);
}

export function LessonSelector({
	open,
	onClose
}: {
	open: boolean;
	onClose: (lesson?: FindLessonsResponse[0]) => void;
}) {
	const [title, setTitle] = useState("");
	const { data } = useQuery(
		["lessons", title],
		() => {
			return apiFetch<FindLessonsResponse, void>("GET", `/api/lessons/find?title=${title}`);
		},
		{ staleTime: 10_000, placeholderData: [], keepPreviousData: true } // Cache for 10 seconds
	);

	return (
		<Dialog open={open} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full translate-y-1/4 justify-center">
					{/* The actual dialog panel  */}
					<Dialog.Panel
						className="mx-auto flex h-fit w-[90vw] flex-col overflow-hidden rounded-lg bg-white lg:w-[800px]"
						style={{ maxHeight: "624px" }}
					>
						<Combobox
							value={null as unknown as FindLessonsResponse[0]}
							onChange={onClose}
						>
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
									{data?.map(lesson => (
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
					</Dialog.Panel>
				</div>
			</div>
		</Dialog>
	);
}
