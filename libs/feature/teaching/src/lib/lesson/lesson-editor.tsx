import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema, createLessonMeta } from "@self-learning/types";
import { SectionHeader, showToast } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { OpenAsJsonButton } from "../json-editor-dialog";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";
import { LessonType } from "@prisma/client";
import { useRouter } from "next/router";

export function LessonEditor({
	lesson,
	onConfirm
}: {
	lesson: LessonFormModel;
	onConfirm: (lesson: LessonFormModel) => void;
}) {
	const isNew = lesson.lessonId === "";
	const form = useForm<LessonFormModel>({
		resolver: zodResolver(lessonSchema),
		defaultValues: lesson
	});

	const [selectedLessonType, setLessonType] = useState(lesson.lessonType);
	const router = useRouter();

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

	function redirectToPreview() {
		const currentLessonValues = form.getValues();
		const lessonMeta = createLessonMeta(currentLessonValues);
		const currentLessonValuesWithMeta = { ...currentLessonValues, meta: lessonMeta };
		const serializedData = JSON.stringify(currentLessonValuesWithMeta);
		localStorage.setItem("lessonInEditing", serializedData);

		router.push({
			pathname: "/teaching/lessons/preview",
			query: { data: currentLessonValues.title }
		});
	}

	return (
		<div className="bg-gray-50">
			<FormProvider {...form}>
				<button className="btn-primary" onClick={redirectToPreview}>
					Vorschau
				</button>
				<form
					onSubmit={form.handleSubmit(
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
					<SidebarEditorLayout
						sidebar={
							<>
								<div>
									<span className="font-semibold text-secondary">
										Lerneinheit editieren
									</span>

									<h1 className="text-2xl">{lesson.title}</h1>
								</div>

								<OpenAsJsonButton form={form} validationSchema={lessonSchema} />

								<button className="btn-primary w-full" type="submit">
									{isNew ? "Erstellen" : "Speichern"}
								</button>

								<LessonInfoEditor setLessonType={setLessonType} />
							</>
						}
					>
						<LessonDescriptionForm />
						{selectedLessonType === LessonType.SELF_REGULATED && (
							<LessonPreQuestionEditor />
						)}
						<LessonContentEditor />
						<QuizEditor />
					</SidebarEditorLayout>
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

function LessonPreQuestionEditor() {
	const { control } = useFormContext<LessonFormModel>();

	return (
		<section>
			<SectionHeader
				title="Aktivierungsfrage"
				subtitle="Die Aktivierungsfrage, die den Lernenden helfen soll, ihre Wissensbasis zu aktivieren."
			/>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="selfRegulatedQuestion"
					render={({ field }) => (
						<MarkdownField content={field.value as string} setValue={field.onChange} />
					)}
				></Controller>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
