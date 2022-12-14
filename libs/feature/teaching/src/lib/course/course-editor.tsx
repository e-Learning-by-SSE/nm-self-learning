import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../author/authors-form";
import { OpenAsJsonButton } from "../json-editor-dialog";
import { SpecializationForm } from "../subject/subject-form";
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
	const isNew = course.courseId === "";

	const form = useForm<CourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(courseFormSchema)
	});

	return (
		<div className="bg-gray-50">
			<FormProvider {...form}>
				<form
					id="courseform"
					onSubmit={e => {
						if ((e.target as unknown as { id: string }).id === "courseform") {
							form.handleSubmit(
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
					<SidebarEditorLayout
						sidebar={
							<>
								<div>
									<span className="font-semibold text-secondary">
										Kurs editieren
									</span>

									<Link href={`/courses/${course.slug}`} target="_blank">
										<h1 className="text-2xl">{course.title}</h1>
									</Link>
								</div>

								<OpenAsJsonButton form={form} validationSchema={courseFormSchema} />

								<button className="btn-primary w-full" type="submit">
									{isNew ? "Erstellen" : "Speichern"}
								</button>

								<CourseInfoForm />
								<SpecializationForm subtitle="Die Spezialisierungen, in denen dieser Kurs angezeigt werden soll." />
								<AuthorsForm
									subtitle="Die Autoren dieses Kurses."
									emptyString="Für diesen Kurs sind noch keine Autoren hinterlegt."
								/>
							</>
						}
					>
						<CourseDescriptionForm />
						<CourseContentForm />
					</SidebarEditorLayout>
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
