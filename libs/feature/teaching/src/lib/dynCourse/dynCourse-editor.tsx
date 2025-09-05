"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField, OpenAsJsonButton } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../author/authors-form";
import { CourseFormModel } from "../course/course-form-model";
import { DynCourseFormModel, dynCourseFormSchema } from "./dynCourse-form-model";
import { CourseInfoForm } from "../course/course-info-form";
import { DynCourseContentForm } from "./dynCourse-content-form";

export function DynCourseEditor({
	course,
	onConfirm
}: {
	course: DynCourseFormModel;
	onConfirm: (course: DynCourseFormModel) => void;
}) {
	const isNew = course.courseId === "";

	const form = useForm<DynCourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(dynCourseFormSchema)
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
									try {
										const validated = dynCourseFormSchema.parse(data);
										onConfirm(validated);
									} catch (error) {
										console.error(error);
									}
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
									validationSchema={dynCourseFormSchema}
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
						<DynCourseContentForm />
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
