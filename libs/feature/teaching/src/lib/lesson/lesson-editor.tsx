import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema } from "@self-learning/types";
import { SectionHeader, showToast } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { JsonEditorDialog } from "../json-editor-dialog";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";

export function LessonEditor({
	lesson,
	onConfirm
}: {
	lesson: LessonFormModel;
	onConfirm: (lesson: LessonFormModel) => void;
}) {
	const isNew = lesson.lessonId === "";
	const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);

	const methods = useForm<LessonFormModel>({
		resolver: zodResolver(lessonSchema),
		defaultValues: lesson
	});

	function setFromJsonDialog(value: LessonFormModel | undefined) {
		if (value) {
			methods.reset(value);
		}

		setIsJsonDialogOpen(false);
	}

	useEffect(() => {
		// Log an error, if given lesson data does not match the form's expected schema
		// Only validate when the lesson is not new, because otherwise the form is empty
		if (lesson.lessonId !== "") {
			const validation = lessonSchema.safeParse(lesson);

			if (!validation.success) {
				console.error(
					"The lesson object that was passed into the LessonEditor is invalid.",
					validation.error
				);
			}
		}
	}, [lesson]);

	return (
		<div className="bg-gray-50 pb-32">
			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(
						data => {
							onConfirm(data);
						},
						onInvalid => {
							console.log(
								"Form could not be saved due to the following errors:",
								onInvalid
							);
							showToast({
								type: "error",
								title: "Speichern fehlgeschlagen",
								subtitle: "Das Formular enthält ungültige Werte."
							});
						}
					)}
					className="flex flex-col"
				>
					<Form.Title
						title={
							isNew ? (
								<>
									Neue <span className="text-secondary">Lerneinheit</span>{" "}
									hinzufügen
								</>
							) : (
								<>
									<span className="text-secondary">{lesson.title}</span> editieren
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
								onClick={() => setIsJsonDialogOpen(true)}
							>
								Als JSON bearbeiten
								{isJsonDialogOpen && (
									<JsonEditorDialog
										onClose={setFromJsonDialog}
										validationSchema={lessonSchema}
									/>
								)}
							</button>
						}
					/>

					<Form.Container>
						<LessonInfoEditor />
						<LessonDescriptionForm />
						<LessonContentEditor />
						<QuizEditor />
						<CenteredContainer>
							<button className="btn-primary ml-auto mr-0 self-end" type="submit">
								{isNew ? "Erstellen" : "Speichern"}
							</button>
						</CenteredContainer>
					</Form.Container>
				</form>
			</FormProvider>
		</div>
	);
}

function LessonDescriptionForm() {
	const { control } = useFormContext<LessonFormModel>();

	return (
		<section>
			<CenteredContainer>
				<SectionHeader
					title="Beschreibung"
					subtitle="Ausführliche Beschreibung dieser Lerneinheit. Unterstützt Markdown."
				/>
			</CenteredContainer>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<MarkdownField
							content={field.value as string}
							setValue={field.onChange}
							minHeight="300px"
						/>
					)}
				></Controller>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
