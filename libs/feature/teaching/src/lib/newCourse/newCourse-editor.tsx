"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField, OpenAsJsonButton } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../author/authors-form";
import { CourseFormModel } from "../course/course-form-model";
import { NewCourseFormModel, newCourseFormSchema } from "./newCourse-form-model";
import { CourseInfoForm } from "../course/course-info-form";
import { NewCourseContentForm } from "./newCourse-content-form";

export function NewCourseEditor({
	course,
	onConfirm
}: {
	course: NewCourseFormModel;
	onConfirm: (course: NewCourseFormModel) => void;
}) {
	const isNew = course.courseId === "";

	const form = useForm<NewCourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(newCourseFormSchema)
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
										const validated = newCourseFormSchema.parse(data);
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

								<OpenAsJsonButton
									form={form}
									validationSchema={newCourseFormSchema}
								/>

								<div className="flex space-x-2">
									<button className="btn-primary w-full" type="submit">
										{isNew ? "Erstellen" : "Speichern"}
									</button>
								</div>

								<CourseInfoForm />
								<AuthorsForm
									subtitle="Die Autoren dieses Kurses."
									emptyString="Für diesen Kurs sind noch keine Autoren hinterlegt."
								/>
							</>
						}
					>
						<CourseDescriptionForm />
						<NewCourseContentForm />
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
