import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { JsonEditorDialog } from "../json-editor-dialog";
import { AuthorsForm } from "./authors-form";
import { CourseContentForm } from "./course-content-editor/course-content-form";
import { CourseFormModel, courseFormSchema } from "./course-form-model";
import { CourseInfoForm } from "./course-info-form";

export function CourseEditor({
	course,
	onConfirm
}: {
	course: CourseFormModel;
	onConfirm: (course: CourseFormModel) => void;
}) {
	// triggerRerender is used to force the form to re-render when course is updated from JSON dialog
	const [triggerRerender, setTriggerRerender] = useState(0);
	const [openAsJson, setOpenAsJson] = useState(false);
	const isNew = course.courseId === "";

	const methods = useForm<CourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(courseFormSchema)
	});

	function onJsonDialogClose(value: CourseFormModel | undefined) {
		if (value) {
			methods.reset(value);
		}

		setOpenAsJson(false);
		setTriggerRerender(r => r + 1);
	}

	return (
		<div className="bg-gray-50 pb-32" key={triggerRerender}>
			<FormProvider {...methods}>
				<form
					id="courseform"
					onSubmit={e => {
						if ((e.target as any)["id"] === "courseform") {
							methods.handleSubmit(
								data => {
									console.log("data", data);
									try {
										const validated = courseFormSchema.parse(data);
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
					<Form.Title
						title={
							isNew ? (
								<>
									Neuen <span className="text-emerald-600">Kurs</span> hinzufügen
								</>
							) : (
								<>
									<Link href={`/courses/${course.slug}`} passHref>
										<a
											target="_blank"
											className="text-emerald-600 hover:underline"
											rel="noopener noreferrer"
										>
											{course.title}
										</a>
									</Link>{" "}
									{/* <span className="text-emerald-600">{course.title}</span>{" "} */}
									editieren
								</>
							)
						}
						button={
							<button className="btn-primary h-fit w-fit" type="submit">
								{isNew ? "Erstellen" : "Speichern"}
							</button>
						}
						specialButtons={
							<button
								type="button"
								className="absolute bottom-16 text-sm font-semibold text-secondary"
								onClick={() => setOpenAsJson(true)}
							>
								<span>Als JSON bearbeiten</span>
								{openAsJson && <JsonEditorDialog onClose={onJsonDialogClose} />}
							</button>
						}
					/>

					<Form.Container>
						<AuthorsForm />
						<CourseInfoForm />
						<CourseDescriptionForm />
						<CourseContentForm />
					</Form.Container>

					<CenteredContainer className="mt-16">
						<button className="btn-primary ml-auto mr-0 self-end" type="submit">
							{isNew ? "Erstellen" : "Speichern"}
						</button>
					</CenteredContainer>
				</form>
			</FormProvider>
		</div>
	);
}

function CourseDescriptionForm() {
	const { control } = useFormContext<{ description: CourseFormModel["description"] }>();

	return (
		<section>
			<CenteredContainer>
				<SectionHeader
					title="Beschreibung"
					subtitle="Ausführliche Beschreibung dieses Kurses. Unterstützt Markdown."
				/>
			</CenteredContainer>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<MarkdownField content={field.value as string} setValue={field.onChange} />
					)}
				></Controller>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
