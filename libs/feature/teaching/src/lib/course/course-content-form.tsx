import { ArrowSmDownIcon, ArrowSmUpIcon, PlusIcon, XIcon } from "@heroicons/react/solid";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
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
			lessonIds: []
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
										disabled={index === chapters.length - 1}
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
