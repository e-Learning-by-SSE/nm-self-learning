import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema } from "@self-learning/types";
import { SectionHeader, showToast } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { useEffect } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { OpenAsJsonButton } from "../json-editor-dialog";
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
	const methods = useForm<LessonFormModel>({
		resolver: zodResolver(lessonSchema),
		defaultValues: lesson
	});

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
		<div className="bg-gray-50">
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
					<div className="mx-auto grid max-w-[1920px] gap-8 xl:grid-cols-[500px_1fr]">
						<aside className="playlist-scroll top-[61px] w-full overflow-auto border-t border-r-gray-200 pb-8 xl:sticky xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r">
							<div className="flex flex-col px-4 pb-8">
								<div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-light-border bg-gray-50 pt-8 pb-4">
									<div>
										<span className="font-semibold text-secondary">
											Lerneinheit editieren
										</span>

										<h1 className="text-2xl">{lesson.title}</h1>
									</div>

									<OpenAsJsonButton validationSchema={lessonSchema} />

									<button className="btn-primary w-full" type="submit">
										{isNew ? "Erstellen" : "Speichern"}
									</button>
								</div>

								<LessonInfoEditor />
							</div>
						</aside>

						<div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 pt-8 pb-16">
							<LessonDescriptionForm />
							<LessonContentEditor />
							<QuizEditor />
						</div>
					</div>
				</form>
			</FormProvider>
		</div>
	);
}

function LessonDescriptionForm() {
	const { control } = useFormContext<LessonFormModel>();

	return (
		<section>
			<SectionHeader
				title="Beschreibung"
				subtitle="Ausführliche Beschreibung dieser Lerneinheit. Unterstützt Markdown."
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
