import { EntryFormModel, entryFormSchema } from "./entry-form-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { LabeledField } from "@self-learning/ui/forms";
import { useEffect, useState } from "react";
import { LocationType, StrategyType } from "@prisma/client";
import { XIcon, PlusIcon } from "@heroicons/react/solid";
import {
	getLocationNameByType,
	getStrategyNameByType,
	getStrategyNames,
	isUserSpecific
} from "@self-learning/types";
import { StarRating } from "libs/ui/common/src/lib/rating/star-rating";
import { SectionHeader, Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import Select from "react-select";
import { format, parseISO } from "date-fns";

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
									console.log("form data", data);
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
						<EntryTopForm lessons={lessons} form={form} />
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
	form
}: Readonly<{
	lessons: Lessons[];
	form: UseFormReturn<EntryFormModel>;
}>) {
	const {
		register,
		formState: { errors }
	} = form;
	const today1 = new Date();
	today1.setMinutes(today1.getMinutes() - 45);

	const today2 = new Date();
	today2.setMinutes(today1.getMinutes() - 15);

	return (
		<div className="flex flex-col gap-5">
			<SectionHeader title="Lernsession" subtitle="Beschreibung der Lernsession." />

			<div className="mb-2 flex flex-row">
				<div className="mx-auto flex w-full flex-row  gap-4">
					<span className="text-sm font-semibold"> Kurs: </span>
					<span className="text-light">Objectorientierte Programmierung mit Java</span>
				</div>
				<div className="mx-auto flex w-full flex-row gap-4">
					<span className="text-sm font-semibold"> Ort: </span>
					<ListBoxLocation form={form} />
				</div>
			</div>

			<div className="mt-5 flex flex-col">
				<Table
					head={
						<>
							<TableHeaderColumn>Lerneinheit</TableHeaderColumn>
							<TableHeaderColumn>Start</TableHeaderColumn>
							<TableHeaderColumn>Dauer (in Minuten)</TableHeaderColumn>
							<TableHeaderColumn>Video Dauer (in Minuten)</TableHeaderColumn>
							<TableHeaderColumn>Video Stopps</TableHeaderColumn>
							<TableHeaderColumn>
								<div title="Richtige Antworten/ Falsche Antworten/ Hinweise">
									Quiz (R/F/H)
								</div>
							</TableHeaderColumn>
						</>
					}
				>
					<tr key={1}>
						<TableDataColumn>
							<span className="text-light">Einleitung & Motivation</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">
								{format(parseISO(today1.toISOString()), "dd/MM/yyyy (HH:mm") +
									"Uhr)"}
							</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">20</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">2</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">3</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">(5/3/1)</span>
						</TableDataColumn>
					</tr>
					<tr key={2}>
						<TableDataColumn>
							<span className="text-light">Installation des JDKs</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">
								{format(parseISO(today2.toISOString()), "dd/MM/yyyy (HH:mm") +
									"Uhr)"}
							</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">15</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">0,5</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">1</span>
						</TableDataColumn>
						<TableDataColumn>
							<span className="text-light">-</span>
						</TableDataColumn>
					</tr>
				</Table>
			</div>
		</div>
	);
}

export function EntryNotesForm({ form }: Readonly<{ form: UseFormReturn<EntryFormModel> }>) {
	const {
		register,
		control,
		formState: { errors }
	} = form;
	return (
		<div className="mt-5 flex flex-col">
			<SectionHeader
				title="Notizen"
				subtitle="Ausführliche Beschreibung der Ablenkungen und Bemühungen während der Lernsession (Optional)."
			/>
			<div className="flex flex-col gap-5 border-black">
				<div className="mb-2 flex flex-row items-center">
					<div className="mx-auto flex w-full flex-row justify-between gap-4">
						<span className="text-sm font-semibold">Ablenkungen:</span>
					</div>
					<span className="ml-5">
						<Controller
							name={"distractions"}
							control={control}
							render={({ field: { onChange, value } }) => (
								<StarRating
									onChange={onChange}
									value={value ? value : 0}
								></StarRating>
							)}
						/>
					</span>
				</div>
				<div className="mb-2 flex flex-row items-center">
					<div className="mx-auto flex w-full flex-row justify-between gap-4">
						<span className="text-sm font-semibold">Bemühungen:</span>
					</div>
					<span className="ml-5">
						<Controller
							name={"efforts"}
							control={control}
							render={({ field: { onChange, value } }) => (
								<StarRating
									onChange={onChange}
									value={value ? value : 0}
								></StarRating>
							)}
						/>
					</span>
				</div>
				<LabeledField label="Sonstige Notizen" error={errors.notes?.message}>
					<textarea {...register("notes")} className="textarea" />
				</LabeledField>
			</div>
		</div>
	);
}

export function EntryStrategieForm({ form }: Readonly<{ form: UseFormReturn<EntryFormModel> }>) {
	const { control } = form;

	const { fields, append, remove } = useFieldArray({
		name: "learningStrategies",
		control
	});

	return (
		<div className="mt-5 flex flex-col">
			<SectionHeader title="Verwendete Lernstrategie" />
			<div className="flex-col">
				<button
					type="button"
					className="btn-primary mt-5 w-full"
					onClick={() =>
						append({
							confidenceRating: 0,
							type: StrategyType.REPEATING_PREKNOWLEDGEACTIVATION,
							notes: ""
						})
					}
				>
					<PlusIcon className="icon h-5" />
					<span>Strategie hinzufügen</span>
				</button>
				<div className="mt-2 flex flex-row items-center">
					<span className="mx-auto flex w-full flex-row justify-between text-sm font-semibold">
						Strategie:
					</span>
					<span className="text-sm font-semibold">Hilfreich:</span>
				</div>
				{fields.map((field, number) => {
					return (
						<div className="mb-2 flex flex-row items-center" key={field.id}>
							<div className="mx-auto flex w-full flex-row justify-between gap-4">
								<ListBoxStrategy key={field.id} index={number} form={form} />
							</div>
							<span className="ml-5">
								<Controller
									name={`learningStrategies.${number}.confidenceRating`}
									control={control}
									render={({ field: { onChange, value } }) => (
										<StarRating onChange={onChange} value={value}></StarRating>
									)}
								/>
							</span>
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
	const { register, getValues, control } = form;
	const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>(
		StrategyType.REPEATING_PREKNOWLEDGEACTIVATION
	);
	useEffect(() => {
		setSelectedStrategy(getValues(`learningStrategies.${index}.type`));
	}, [getValues, index]);
	return (
		<div className="gab-2 flex flex-col">
			<Controller
				name={`learningStrategies.${index}.type`}
				control={control}
				render={({ field: { onChange, value } }) => (
					<div style={{ width: "500px" }}>
						<Select
							isSearchable={true}
							defaultValue={{ label: getStrategyNameByType(value), value: value }}
							onChange={e => {
								setSelectedStrategy(e?.value as StrategyType);
								onChange(e?.value as StrategyType);
							}}
							options={getStrategyNames()}
						/>
					</div>
				)}
			/>

			{isUserSpecific(selectedStrategy) && (
				<input
					type="text"
					className="textfield max-content mt-1"
					defaultValue={""}
					placeholder="Name der Lernstrategie"
					{...register(`learningStrategies.${index}.notes` as const)}
				/>
			)}
		</div>
	);
};

const ListBoxLocation = ({ form }: { form: UseFormReturn<EntryFormModel> }) => {
	const { register, getValues } = form;
	const [selectedLocation, setSelectedLocation] = useState<LocationType>(LocationType.HOME);
	useEffect(() => {
		setSelectedLocation(getValues(`location`));
	}, [getValues]);
	return (
		<div className="gab-2 flex flex-col">
			<select
				{...register("location")}
				onChange={e => {
					setSelectedLocation(e.target.value as LocationType);
				}}
			>
				<option value={""} hidden>
					Bitte wählen...
				</option>
				{Object.values(LocationType).map(type => (
					<option key={type} value={type}>
						{getLocationNameByType(type)}
					</option>
				))}
			</select>
			{selectedLocation === LocationType.USERSPECIFIC && (
				<input
					type="text"
					className="textfield max-content mt-1"
					defaultValue={""}
					placeholder="Beschreibung des Orts"
					{...register(`locationNote` as const)}
				/>
			)}
		</div>
	);
};
