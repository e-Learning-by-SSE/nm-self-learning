import { EntryFormModel, entryFormSchema } from "./entry-form-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { LabeledField } from "@self-learning/ui/forms";
import { Listbox } from "@headlessui/react";
import { SetStateAction, useEffect, useState } from "react";
import { StrategyType } from "@prisma/client";
import { XIcon } from "@heroicons/react/solid";
import { getStrategyNameByType } from "@self-learning/types";

export type Lessons = { id: string; name: string };

export function EntryEditor({
	entry,
	lessons,
	onConfirm
}: Readonly<{
	entry: EntryFormModel;
	lessons: Lessons[];
	onConfirm: (entry: EntryFormModel) => void;
}>) {
	const isNew = entry.id === "";
	const form = useForm<EntryFormModel>({
		resolver: zodResolver(entryFormSchema),
		defaultValues: entry,
		shouldUnregister: false
	});

	const { reset } = form;

	if (entry.completedLessonId != null && entry.completedLessonId <= 0)
		entry.completedLessonId = null;
	useEffect(() => {
		reset(entry);
	}, [entry, reset]);
	return (
		<div>
			<FormProvider {...form}>
				<form
					id="entryForm"
					onSubmit={e => {
						if ((e.target as HTMLElement).id === "entryForm") {
							form.handleSubmit(
								data => {
									console.log("data", data);
									try {
										const validated = entryFormSchema.parse(data);
										onConfirm(validated);
									} catch (error) {
										console.error(error);
									}
								},
								invalid => {
									console.log("invalid", invalid);
								}
							)(e);
						}
					}}
				>
					<div>
						<span className="mb-5 font-semibold text-secondary">Eintrag editieren</span>
						<EntryTopForm
							lessons={lessons}
							form={form}
							defaultLessonId={entry.lessonId}
						/>
						<div className="mt-5 flex-row justify-between">
							<EntryStrategieForm form={form} />
							<EntryNotesForm form={form} />
						</div>
						<button className="btn-primary mt-5 w-full" type="submit">
							{isNew ? "Erstellen" : "Speichern"}
						</button>
					</div>
				</form>
			</FormProvider>
		</div>
	);
}

export function EntryTopForm({
	lessons,
	form,
	defaultLessonId
}: Readonly<{
	lessons: Lessons[];
	form: UseFormReturn<EntryFormModel>;
	defaultLessonId: string | null;
}>) {
	function getName(id: string) {
		let out: string;
		const lesson = lessons.find(ele => ele.id === id);
		if (lesson === undefined || lesson === null) out = "Eintrag auswählen";
		else out = lesson.name;
		return out;
	}

	const {
		register,
		control,
		formState: { errors }
	} = form;

	let dLId = "";
	if (defaultLessonId != null) {
		dLId = defaultLessonId;
	}
	const [selectedLesson, setSelectedLesson] = useState(dLId);
	useEffect(() => setSelectedLesson(dLId), [dLId]);
	return (
		<div className="flex flex-col gap-5">
			<LabeledField label="Titel des Tagebucheintrags:" error={errors.duration?.message}>
				<input {...register("title")} type="text" className="textarea" />
			</LabeledField>
			<div className="flex flex-col gap-5 border-black">
				<LabeledField label="Lerneinheit:">
					<Controller
						name="lessonId"
						control={control}
						render={({ field: { onChange } }) => (
							<Listbox
								as="div"
								defaultValue={dLId}
								value={selectedLesson}
								onChange={(e: SetStateAction<string>) => {
									onChange(e);
									setSelectedLesson(e);
								}}
							>
								<Listbox.Button className="focus:shadow-outline-blue relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5">
									{getName(selectedLesson)}
								</Listbox.Button>
								<Listbox.Options className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
									{lessons.map(lesson => (
										<Listbox.Option
											key={lesson.id}
											value={lesson.id}
											className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
										>
											{lesson.name}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Listbox>
						)}
					/>
				</LabeledField>
				<LabeledField label="Dauer (in Minuten):" error={errors.duration?.message}>
					<input
						{...register("duration", { valueAsNumber: true })}
						type="text"
						className="textarea"
					/>
				</LabeledField>
			</div>
		</div>
	);
}

export function EntryNotesForm({ form }: Readonly<{ form: UseFormReturn<EntryFormModel> }>) {
	const {
		register,
		formState: { errors }
	} = form;
	return (
		<div className="mt-5 flex flex-col">
			<span className="font-semibold text-secondary">Notizen (Optional)</span>
			<div className="flex flex-col gap-5 border-black">
				<LabeledField label="Ablenkungen:" error={errors.distractions?.message}>
					<textarea {...register("distractions")} className="textarea" />
				</LabeledField>
				<LabeledField label="Bemühungen" error={errors.efforts?.message}>
					<textarea {...register("efforts")} className="textarea" />
				</LabeledField>
				<LabeledField label="Sonstige Notizen" error={errors.notes?.message}>
					<textarea {...register("notes")} className="textarea" />
				</LabeledField>
			</div>
		</div>
	);
}

export function EntryStrategieForm({ form }: Readonly<{ form: UseFormReturn<EntryFormModel> }>) {
	const { register, control } = form;

	const { fields, append, remove } = useFieldArray({
		name: "learningStrategies",
		control
	});

	return (
		<div className="mt-5 flex flex-col">
			<span className="mb-2 font-semibold text-secondary">Verwendete Lernstrategie</span>
			<div className="flex-col">
				<div className="flex flex-row">
					<span className="mr-24 text-sm font-semibold">Strategie:</span>
					<span className="text-sm font-semibold">Vertrauensbewertung:</span>
				</div>
				{fields.map((field, number) => {
					return (
						<div
							className="form-control flex flex-row place-items-center"
							key={field.id}
						>
							<ListBoxStrategy key={field.id} index={number} form={form} />
							<input
								type="range"
								className="ml-5 max-w-xs"
								min={0}
								max={10}
								defaultValue={0}
								{...register(`learningStrategies.${number}.confidenceRating`, {
									valueAsNumber: true
								})}
							/>

							<button
								onClick={() => {
									console.log(number, ": ", field);
									remove(number);
								}}
								className="btn-small ml-5 place-content-center items-center"
								title="Strategie Löschen"
							>
								<XIcon className="h-3 w-3" />
							</button>
						</div>
					);
				})}
				<button
					type="button"
					className="btn-primary mt-5 w-full"
					onClick={() =>
						append({ confidenceRating: 0, type: StrategyType.REPEATING, notes: "" })
					}
				>
					Strategie hinzufügen
				</button>
			</div>
		</div>
	);
}

const ListBoxStrategy = ({
	index,
	form
}: {
	index: number;
	form: UseFormReturn<EntryFormModel>;
}) => {
	const { register, control, getValues } = form;
	const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>(StrategyType.REPEATING);
	const defaultStrategy = getValues(`learningStrategies.${index}.type`);
	useEffect(() => setSelectedStrategy(defaultStrategy), [defaultStrategy]);
	return (
		<div className="gab-2 flex flex-col">
			<Controller
				name={`learningStrategies.${index}.type`}
				control={control}
				render={({ field: { onChange } }) => (
					<Listbox
						as="div"
						value={selectedStrategy}
						defaultValue={StrategyType.REPEATING}
						onChange={(e: SetStateAction<StrategyType>) => {
							onChange(e);
							setSelectedStrategy(e);
						}}
					>
						<Listbox.Button className="focus:shadow-outline-blue relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5">
							{getStrategyNameByType(selectedStrategy)}
						</Listbox.Button>
						<Listbox.Options className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
							{Object.values(StrategyType).map(type => (
								<Listbox.Option
									key={type}
									value={type}
									className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
								>
									{getStrategyNameByType(type)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</Listbox>
				)}
			/>
			{selectedStrategy === StrategyType.USERSPECIFIC && (
				<input
					type="Text"
					className="mt-5 max-w-xs"
					defaultValue={""}
					placeholder="Name der Lernstrategie"
					{...register(`learningStrategies.${index}.notes` as const)}
				/>
			)}
		</div>
	);
};
