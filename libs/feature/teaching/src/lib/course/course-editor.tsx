import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
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
		<div className="bg-gray-50" key={triggerRerender}>
			<FormProvider {...methods}>
				<form
					id="courseform"
					onSubmit={e => {
						if ((e.target as unknown as { id: string }).id === "courseform") {
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
					<div className="mx-auto grid max-w-[1920px] gap-8 xl:grid-cols-[500px_1fr]">
						<aside className="playlist-scroll sticky top-[61px] w-full overflow-auto border-t border-r-gray-200 pb-8 xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r">
							<div className="flex flex-col px-4 pb-8">
								<div className="sticky top-0 z-20 flex flex-col  gap-2 border-b border-light-border bg-gray-50 pt-8 pb-4">
									<div>
										<span className="font-semibold text-secondary">
											Kurs editieren
										</span>

										<Link href={`/courses/${course.slug}`}>
											<a>
												<h1 className="text-2xl">{course.title}</h1>
											</a>
										</Link>
									</div>

									<button
										type="button"
										className="btn-stroked"
										onClick={() => setOpenAsJson(true)}
									>
										<span>Als JSON bearbeiten</span>
										{openAsJson && (
											<JsonEditorDialog onClose={onJsonDialogClose} />
										)}
									</button>

									<button className="btn-primary w-full" type="submit">
										{isNew ? "Erstellen" : "Speichern"}
									</button>
								</div>

								<CourseInfoForm />
								<AuthorsForm />
							</div>
						</aside>

						<div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 pt-8 pb-16">
							<CourseDescriptionForm />
							<CourseContentForm />
						</div>
					</div>
				</form>
			</FormProvider>
		</div>
	);
}

function CourseDescriptionForm() {
	const { control } = useFormContext<{ description: CourseFormModel["description"] }>();

	return (
		<section>
			<SectionHeader
				title="Beschreibung"
				subtitle="Ausführliche Beschreibung dieses Kurses. Unterstützt Markdown."
			/>
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

// <Form.Title
// title={
// 	isNew ? (
// 		<>
// 			Neuen <span className="text-secondary">Kurs</span>{" "}
// 			hinzufügen
// 		</>
// 	) : (
// 		<>
// 			<Link href={`/courses/${course.slug}`} passHref>
// 				<a
// 					target="_blank"
// 					className="text-secondary hover:underline"
// 					rel="noopener noreferrer"
// 				>
// 					{course.title}
// 				</a>
// 			</Link>{" "}
// 			{/* <span className="text-emerald-600">{course.title}</span>{" "} */}
// 			editieren
// 		</>
// 	)
// }
// button={
// 	<button className="btn-primary h-fit w-fit" type="submit">
// 		{isNew ? "Erstellen" : "Speichern"}
// 	</button>
// }
// specialButtons={
// 	<button
// 		type="button"
// 		className="absolute bottom-16 text-sm font-semibold text-secondary"
// 		onClick={() => setOpenAsJson(true)}
// 	>
// 		<span>Als JSON bearbeiten</span>
// 		{openAsJson && <JsonEditorDialog onClose={onJsonDialogClose} />}
// 	</button>
// }
// />
