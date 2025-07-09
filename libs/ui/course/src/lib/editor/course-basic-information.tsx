import {
	RelaxedCourseFormModel,
	relaxedCourseFormSchema,
	SkillManager
} from "@self-learning/teaching";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import {
	InputWithButton,
	LabeledField,
	Upload,
	useSlugify,
	FieldHint,
	MarkdownField,
	Form
} from "@self-learning/ui/forms";
import { AuthorsForm } from "libs/feature/teaching/src/lib/author/authors-form";
import {
	Dialog,
	DialogActions,
	getButtonSizeClass,
	GreyBoarderButton,
	IconButton,
	ImageOrPlaceholder,
	showToast
} from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { SkillRepositoryCreationModel, skillRepositoryCreationSchema } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";

type Props = {
	onCourseCreated: (courseId: string, selectors: string[]) => void;
};

export function CourseBasicInformation({ onCourseCreated }: Props) {
	const form = useForm<RelaxedCourseFormModel>({
		resolver: zodResolver(relaxedCourseFormSchema),
		defaultValues: {
			courseId: "",
			requires: [], // need this for skill manager
			provides: []
		}
	});

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors }
	} = form;

	const { mutateAsync: create } = trpc.course.createMinimal.useMutation();

	const createCourse = async () => {
		const course = form.getValues();

		try {
			const { title, slug, courseId } = await create(course);
			showToast({ type: "success", title: "Kurs erstellt!", subtitle: title });
			onCourseCreated(courseId, ["dummy-selector-1", "dummy-selector-2"]);
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
				onSubmit={handleSubmit(createCourse)}
				className="m-2 grid w-2/3 grid-cols-1 gap-6 p-2 md:grid-cols-2"
			>
				<div>
					<button type="submit" className="btn-primary w-full my-5">
						Kurs erstellen
					</button>
					<BasicInfo />
				</div>
				<div>
					<Skills></Skills>
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

function Skills() {
	const [openDialog, setDialogOpen] = useState(false);

	const closeRepoDialog = () => {
		setDialogOpen(false);
	};
	return (
		<>
			<div className="p-3">
				<h2 className="text-xl">Skillkarten</h2>
				<span className="text-sm text-light">Erstelle neue Skillkarten</span>
				<IconButton
					text="Neue Skillkarte Erstellen"
					icon={<PlusIcon className={getButtonSizeClass("medium")} />}
					onClick={() => setDialogOpen(true)}
					title={"Erstellen"}
				/>

				{openDialog && <SkillRepositoryDialog onClose={closeRepoDialog} />}
			</div>

			<CourseSkillManager />
		</>
	);
}

const CourseSkillManager = () => {
	return <SkillManager<RelaxedCourseFormModel> />;
};

function SkillRepositoryDialog({ onClose }: { onClose: () => void }) {
	const { data: session } = useSession();
	const ownerName = session?.user?.name ?? "";

	const form = useForm<SkillRepositoryCreationModel>({
		defaultValues: { name: "", description: "", ownerName: ownerName },
		resolver: zodResolver(skillRepositoryCreationSchema)
	});

	const errors = form.formState.errors;
	const { mutateAsync: createRepo } = trpc.skill.addRepo.useMutation();

	const handleCreate = form.handleSubmit(
		async data => {
			try {
				await createRepo({ rep: data });
				showToast({
					type: "success",
					title: "Skill Netzwerk gespeichert!",
					subtitle: ""
				});
				onClose();
			} catch (error) {
				if (error instanceof Error) {
					showToast({
						type: "error",
						title: "Skill Netzwerk konnte nicht erstellt werden.",
						subtitle: error.message
					});
				}
			}
		},
		validationErrors => {
			console.log("Validation failed:", validationErrors);
		}
	);

	return (
		<Dialog onClose={onClose} title={"Neue Skillkarte"}>
			<FormProvider {...form}>
				<form className="flex flex-col justify-between">
					<Form.SidebarSection>
						<div className="flex flex-col gap-4">
							<LabeledField label="Name" error={errors.name?.message}>
								<input
									type="text"
									className="textfield"
									{...form.register("name")}
								/>
							</LabeledField>
							<LabeledField label="Beschreibung" error={errors.description?.message}>
								<input
									type="text"
									className="textfield"
									{...form.register("description")}
								/>
							</LabeledField>
						</div>
					</Form.SidebarSection>
				</form>
			</FormProvider>

			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={handleCreate}>
					Speichern
				</button>
			</DialogActions>
		</Dialog>
	);
}
