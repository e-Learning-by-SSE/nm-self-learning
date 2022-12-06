import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { OpenAsJsonButton } from "../json-editor-dialog";
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
	const isNew = course.courseId === "";

	const methods = useForm<CourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(courseFormSchema)
	});

	return (
		<div className="bg-gray-50">
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

								<OpenAsJsonButton validationSchema={courseFormSchema} />

								<button className="btn-primary w-full" type="submit">
									{isNew ? "Erstellen" : "Speichern"}
								</button>

								<CourseInfoForm />
								<AuthorsForm />
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
