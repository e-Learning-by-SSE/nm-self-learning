import {
	DynCourseFormModel,
	dynCourseFormSchema,
	DynCourseGenPathFormModel,
	DynCourseSkillManager
} from "@self-learning/teaching";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { useEffect } from "react";
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
import { useRequiredSession } from "@self-learning/ui/layouts";

type Props = {
	onCourseCreated: (slug: string) => void;
	initialCourse?: DynCourseGenPathFormModel;
};

export function CourseBasicInformation({ onCourseCreated, initialCourse }: Props) {
	const session = useRequiredSession();
	const form = useForm<DynCourseFormModel>({
		resolver: zodResolver(dynCourseFormSchema),
		defaultValues: {
			courseId: "",
			title: "",
			slug: "",
			description: "",
			subtitle: "",
			imgUrl: "",
			subjectId: null,
			teachingGoals: [],
			requirements: []
		}
	});

	const {
		handleSubmit,
		reset,
		formState: { errors },
		getValues
	} = form;

	const { mutateAsync: create } = trpc.course.createDynamic.useMutation();
	const { mutateAsync: edit } = trpc.course.editDynamic.useMutation();

	useEffect(() => {
		if (session.data?.user?.name) {
			form.reset({
				...form.getValues(),
				authors: [{ username: session.data.user.name }]
			});
		}
	}, [session.data?.user?.name, form]);

	useEffect(() => {
		if (initialCourse) {
			reset({
				...initialCourse
			});
		}
	}, [initialCourse, reset]);

	const handleCourseSubmit = async () => {
		const course = form.getValues();
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

				// 🔍 Detect changes in teachingGoals or requirements
				const skillsChanged =
					JSON.stringify(initialCourse.teachingGoals ?? []) !==
						JSON.stringify(course.teachingGoals ?? []) ||
					JSON.stringify(initialCourse.requirements ?? []) !==
						JSON.stringify(course.requirements ?? []);

				const { title, slug } = await edit({
					courseId: course.courseId ?? "",
					course: course,
					skillsChanged // ✅ send to backend
				});

				showToast({
					type: "success",
					title: "Kurs aktualisiert!",
					subtitle: skillsChanged
						? `${title} (Ziele oder Anforderungen wurden geändert)`
						: title
				});
				onCourseCreated(slug);
			} else {
				const { title, slug } = await create(course);
				showToast({ type: "success", title: "Kurs erstellt!", subtitle: title });
				onCourseCreated(slug);
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

	/*
	const handleCourseSubmitOld = async () => {
		const course = form.getValues();
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

				const { title, slug } = await edit({
					courseId: course.courseId ?? "",
					course: course
				});
				showToast({ type: "success", title: "Kurs aktualisiert!", subtitle: title });
				onCourseCreated(slug);
			} else {
				const { title, slug } = await create(course);
				showToast({ type: "success", title: "Kurs erstellt!", subtitle: title });
				onCourseCreated(slug);
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
*/
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
					<DynCourseSkillManager />
				</div>
			</form>
		</FormProvider>
	);
}

function BasicInfo() {
	const form = useFormContext<DynCourseFormModel>();

	const {
		register,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	const { data: subjects = [], isLoading: isLoadingSubjects } =
		trpc.subject.getAllSubjects.useQuery();

	useEffect(() => {
		if (!isLoadingSubjects && subjects.length > 0) {
			form.setValue("subjectId", form.getValues("subjectId") || subjects[0].subjectId);
		}
	}, [isLoadingSubjects, subjects, form]);

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
				<Controller
					control={form.control}
					name="subjectId"
					render={({ field }) => (
						<SubjectDropDown
							subjects={subjects}
							value={field.value ?? ""}
							onChange={field.onChange}
						/>
					)}
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

type Subject = {
	subjectId: string;
	title: string;
};

function SubjectDropDown({
	subjects,
	value,
	onChange
}: {
	subjects: Subject[];
	value: string;
	onChange: (id: string) => void;
}) {
	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={value ?? ""}
				onChange={e => onChange(e.target.value)}
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
