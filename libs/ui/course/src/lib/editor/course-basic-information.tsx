import { RelaxedCourseFormModel, relaxedCourseFormSchema } from "@self-learning/teaching";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
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
import { GreyBoarderButton, ImageOrPlaceholder, showToast } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LessonSkillManager } from "libs/feature/teaching/src/lib/lesson/forms/lesson-skill-manager";

type Props = {
	onCourseCreated: (slug: string, selectors: string[]) => void;
	initialCourse?: RelaxedCourseFormModel;
};

export function CourseBasicInformation({ onCourseCreated, initialCourse }: Props) {
	const form = useForm<RelaxedCourseFormModel>({
		resolver: zodResolver(relaxedCourseFormSchema),
		defaultValues: {
			courseId: "",
			requires: [], // needed for skill manager
			provides: []
		}
	});

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors }
	} = form;

	const [id, setId] = useState<string>();
	const { mutateAsync: create } = trpc.course.createMinimal.useMutation();
	const { mutateAsync: edit } = trpc.course.editMinimal.useMutation();

	useEffect(() => {
		if (initialCourse) {
			reset({
				...initialCourse,
				requires: initialCourse.requires ?? [],
				provides: initialCourse.provides ?? []
			});
		}
	}, [initialCourse, reset]);

	//console.log("initialCourse", initialCourse);

	const handleCourseSubmit = async () => {
		const course = form.getValues();
		console.log("course", course);
		try {
			if (initialCourse) {
				if (!initialCourse?.courseId) {
					console.error("Editing course, but courseId is missing.");
					showToast({
						type: "error",
						title: "Fehlende Kurs-ID",
						subtitle: "Die Kurs-ID fehlt für das Update."
					});
					return;
				}

				const { title, slug, courseId } = await edit({
					courseId: initialCourse.courseId,
					slug: initialCourse.slug,
					course: course
				});
				showToast({ type: "success", title: "Kurs aktualisiert!", subtitle: title });
				onCourseCreated(slug, ["dummy-selector-1", "dummy-selector-2"]);
			} else {
				const { title, slug, courseId } = await create(course);
				showToast({ type: "success", title: "Kurs erstellt!", subtitle: title });
				setId(courseId);
				onCourseCreated(slug, ["dummy-selector-1", "dummy-selector-2"]);
			}
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: JSON.stringify(error, null, 2)
			});
		}
	};

	useEffect(() => {
		if (Object.keys(errors).length > 0) {
			console.log("Form validation errors:", errors);
		}
	}, [errors]);

	return (
		<FormProvider {...form}>
			<form
				onSubmit={handleSubmit(handleCourseSubmit)}
				className="m-2 grid w-2/3 grid-cols-1 gap-6 p-2 md:grid-cols-2"
			>
				<div>
					<button type="submit" className="btn-primary w-full my-5">
						{initialCourse ? "Kurs aktualisieren" : "Kurs erstellen"}
					</button>

					<BasicInfo />
				</div>
				<div>
					<LessonSkillManager />
				</div>
			</form>
		</FormProvider>
	);
}

function BasicInfo() {
	const form = useFormContext<RelaxedCourseFormModel>();

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
		console.log("specializationId", specializationId);
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
