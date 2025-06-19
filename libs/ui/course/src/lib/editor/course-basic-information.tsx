import { ExtendedCourseFormModel, SkillManager } from "@self-learning/teaching";
import { Controller, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import {
	InputWithButton,
	LabeledField,
	Upload,
	useSlugify,
	FieldHint,
	MarkdownField
} from "@self-learning/ui/forms";
import { AuthorsForm } from "libs/feature/teaching/src/lib/author/authors-form";
import { GreyBoarderButton, ImageOrPlaceholder } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";

export function CourseBasicInformation() {
	const form = useFormContext<ExtendedCourseFormModel>();

	const {
		register,
		control,
		formState: { errors }
	} = form;

	return (
		<div className="m-2 grid w-2/3 grid-cols-1 gap-6 p-2 md:grid-cols-2">
			<div>
				<BasicInfo />
			</div>

			<div>
				<CourseSkillManager />
			</div>
		</div>
	);
}

const CourseSkillManager = () => {
	return SkillManager<ExtendedCourseFormModel>();
};

function BasicInfo() {
	const form = useFormContext<ExtendedCourseFormModel>();

	const {
		register,
		setValue,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	const { data: subjects = [], isLoading: isLoadingSubjects } =
		trpc.subject.getAllSubjects.useQuery();
	useEffect(() => {
		if (isLoadingSubjects) return;

		if (subjects.length > 0) {
			setValue("subjectId", subjects[0]?.subjectId || "");
		} else {
			console.error("Failed to fetch subjects from DB!");
		}
	}, [subjects, setValue, isLoadingSubjects]);

	const { data: specializations = [], isLoading: isLoadingSpecializations } =
		trpc.specialization.getAll.useQuery();
	useEffect(() => {
		if (isLoadingSpecializations) return;
		if (specializations.length > 0) {
			setValue("specializationId", specializations[0]?.specializationId || "");
		} else {
			console.error("Failed to fetch specializations from DB!");
		}
	}, [specializations, isLoadingSpecializations, setValue]);

	const onSubjectChange = (subjectId: string) => {
		setValue("subjectId", subjectId);
	};
	const onSpecializationChange = (specializationId: string) => {
		setValue("specializationId", specializationId);
	};

	return (
		<div className="space-y-3">
			<LabeledField label="Titel" error={errors.title?.message}>
				<input
					{...register("title")}
					type="text"
					className="textfield"
					placeholder="Der neue Kurs"
					onBlur={slugifyIfEmpty}
				/>
			</LabeledField>

			<LabeledField label="Slug" error={errors.slug?.message}>
				<InputWithButton
					input={
						<input
							className="textfield"
							placeholder=""
							type={"text"}
							{...register("slug")}
						/>
					}
					button={
						<GreyBoarderButton
							type="button"
							onClick={slugifyField}
							title={"Generiere Slug"}
						>
							<span className={"text-gray-600"}>Generieren</span>
						</GreyBoarderButton>
					}
				/>
				<FieldHint>
					Der <strong>slug</strong> wird in der URL angezeigt. Muss einzigartig sein.
				</FieldHint>
			</LabeledField>

			<LabeledField label="Untertitel" error={errors.subtitle?.message} optional={true}>
				<Controller
					control={form.control}
					name="subtitle"
					render={({ field }) => (
						<MarkdownField
							content={field.value as string}
							setValue={field.onChange}
							inline={true}
							placeholder="1-2 Sätze über diesen Kurs."
						/>
					)}
				></Controller>
			</LabeledField>

			<LabeledField
				label={"Beschreibung"}
				error={errors.description?.message}
				optional={true}
			>
				<Controller
					control={form.control}
					name={"description"}
					render={({ field }) => (
						<MarkdownField
							content={field.value as string}
							setValue={field.onChange}
							inline={true}
							placeholder={"1-2 Sätze welche diese Lerneinheit beschreibt."}
						></MarkdownField>
					)}
				></Controller>
			</LabeledField>

			<LabeledField label="Fachgebiet" error={errors.subjectId?.message}>
				<SubjectDropDown subjects={subjects} onChange={onSubjectChange} />
			</LabeledField>

			<LabeledField label="Spezialisierung" error={errors.specializationId?.message}>
				<SpecializationDropDown
					specializations={specializations}
					onChange={onSpecializationChange}
				/>
			</LabeledField>

			<Controller
				control={form.control}
				name="imgUrl"
				render={({ field }) => (
					<LabeledField label="Bild" error={errors.imgUrl?.message}>
						<div className="flex w-full gap-4">
							<div className="flex w-full flex-col gap-2">
								<Upload
									mediaType="image"
									onUploadCompleted={field.onChange}
									preview={
										<ImageOrPlaceholder
											src={field.value ?? undefined}
											className="mx-auto h-32 w-32 shrink-0 rounded-lg"
										/>
									}
								/>
							</div>
						</div>
					</LabeledField>
				)}
			></Controller>

			<div className="my-5 border-t border-gray-200">
				<AuthorsForm
					subtitle="Die Autoren dieses Kurses."
					emptyString="Für diesen Kurs sind noch keine Autoren hinterlegt."
				/>
			</div>
		</div>
	);
}

type subject = {
	subjectId: string;
	title: string;
};

function SubjectDropDown({
	subjects,
	onChange
}: {
	subjects: subject[];
	onChange: (id: string) => void;
}) {
	const [selectedSubject, setSelectedSubject] = useState<string>(subjects?.[0]?.subjectId ?? "");

	const changeDisplaySelectedRepository = (id: string) => {
		setSelectedSubject(id);
	};

	useEffect(() => {
		onChange(selectedSubject);
	}, [onChange, selectedSubject]);

	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={selectedSubject ?? subjects[0].subjectId}
				onChange={e => {
					changeDisplaySelectedRepository(e.target.value);
				}}
			>
				{subjects.map(subject => (
					<option key={subject.subjectId} value={subject.subjectId}>
						{subject.title}
					</option>
				))}
			</select>
		</div>
	);
}

type specialization = {
	specializationId: string;
	title: string;
};

function SpecializationDropDown({
	specializations,
	onChange
}: {
	specializations: specialization[];
	onChange: (id: string) => void;
}) {
	const [selectedSpecialization, setSelectedSpecialization] = useState<string>(
		specializations?.[0]?.specializationId ?? ""
	);

	const changeDisplaySelectedSpecialization = (id: string) => {
		setSelectedSpecialization(id);
	};

	useEffect(() => {
		onChange(selectedSpecialization);
	}, [onChange, selectedSpecialization]);

	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={selectedSpecialization ?? specializations[0].specializationId}
				onChange={e => {
					changeDisplaySelectedSpecialization(e.target.value);
				}}
			>
				{specializations.map(specialization => (
					<option
						key={specialization.specializationId}
						value={specialization.specializationId}
					>
						{specialization.title}
					</option>
				))}
			</select>
		</div>
	);
}
