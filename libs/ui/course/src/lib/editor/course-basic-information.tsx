import { ExtendedCourseFormValues } from "@self-learning/teaching";
import { Controller, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { InputWithButton, LabeledField, Upload, useSlugify } from "@self-learning/ui/forms";
import { AuthorsForm } from "libs/feature/teaching/src/lib/author/authors-form";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import { ImageOrPlaceholder, OnDialogCloseFn } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";

export function CourseBasicInformation() {
	const form = useFormContext<ExtendedCourseFormValues>();

	const {
		register,
		control,
		formState: { errors }
	} = form;

	const { data: authors = [] } = trpc.author.getAll.useQuery();

	const onSelectorChange = (authorSlug: string) => {
		console.log("on selector change", authorSlug);
	};

	const onAddAuthor = () => {};
	const onDeleteAuthor = () => {};

	return (
		<div className="m-2 grid w-2/3 grid-cols-1 gap-6 p-2 md:grid-cols-2">
			<div>
				<BasicInfo />
			</div>

			<div>
				<Skills />

				<Selectors
					authors={authors}
					onAddAuthor={onAddAuthor}
					onDeleteAuthor={onDeleteAuthor}
				/>
			</div>
		</div>
	);
}

function BasicInfo() {
	const form = useFormContext<ExtendedCourseFormValues>();

	const {
		register,
		setValue,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	const { data: subjects } = trpc.subject.getAllSubjects.useQuery();
	const { data: specializations } = trpc.specialization.getAll.useQuery();

	useEffect(() => {
		if (specializations && specializations.length > 0) {
			setValue("specializationId", specializations[0]?.specializationId);
		}
	}, [specializations]); // TODO do we need this?

	useEffect(() => {
		if (subjects && subjects.length > 0) {
			setValue("subjectId", subjects[0].subjectId);
		}
	}, [subjects, setValue]);

	const onSubjectChange = (subjectId: string) => {
		setValue("subjectId", subjectId);
	};
	const onSpecializationChange = (specializationId: string) => {
		setValue("specializationId", specializationId);
	};

	console.log("form", form.getValues());

	return (
		<>
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
							placeholder="der-neue-Kurs"
							type={"text"}
							{...register("slug")}
						/>
					}
					button={
						<button type="button" className="btn-stroked" onClick={slugifyField}>
							Generieren
						</button>
					}
				/>
			</LabeledField>
			<LabeledField label="Beschreibung" error={errors.description?.message}>
				<textarea {...register("description")} placeholder="" className="h-full" />
			</LabeledField>

			<LabeledField label="Fachgebiet" error={errors.subjectId?.message}>
				{subjects && <SubjectDropDown subjects={subjects} onChange={onSubjectChange} />}
			</LabeledField>

			<LabeledField label="Spezialisierung" error={errors.specializationId?.message}>
				{specializations && (
					<SpecializationDropDown
						specializations={specializations}
						onChange={onSpecializationChange}
					/>
				)}
			</LabeledField>
			{/** TODO: who knows if it works - cannot connect to MinIO */}
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
		</>
	);
}

function Skills() {
	const form = useFormContext<ExtendedCourseFormValues>();
	const {
		register,
		control,
		formState: { errors }
	} = form;
	return (
		<>
			<div className="p-3">
				<SidebarSectionTitle
					title="Skills bearbeiten"
					subtitle={"Kursziele und Voraussetzungen dieses Kurses."}
				/>
			</div>

			<div className="p-3">
				<LabeledField label="Verlinkte Skill-Repositories"></LabeledField>
			</div>
			<div className="p-3">
				<LabeledField label="Kursziele"></LabeledField>
			</div>
			<div className="p-3">
				<LabeledField label="Voraussetzungen"></LabeledField>
			</div>
		</>
	);
}

type AuthorSelector = {
	displayName: string;
	slug: string; // TODO: is slug unique?
};

function Selectors({
	authors,
	onAddAuthor,
	onDeleteAuthor
}: {
	authors: AuthorSelector[];
	onAddAuthor: (authorSlug: AuthorSelector[] | undefined) => void;
	onDeleteAuthor: (author: AuthorSelector) => void;
}) {
	const [selectAuthorSelector, setSelectAuthorSelectorModal] = useState(false);

	return (
		<>
			<div className="p-3 border-t border-gray-200">
				<SidebarSectionTitle title="Selektoren" subtitle={""} />
			</div>
			<div className="p-3">
				<LabeledField label="Authoren"></LabeledField>
				<LabeledField label="Fachgebiet"></LabeledField>
			</div>
		</>
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
