"use client";
import { FieldErrors, FormProvider, useForm, useFormState, useWatch } from "react-hook-form";
import { CourseFormModel, courseFormSchema } from "../course/course-form-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { DialogActions, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { CourseType } from "@prisma/client";
import { CourseContentForm } from "../course/course-content-editor/course-content-form";
import { CourseInfoForm } from "../course/course-info-form";
import { SkillsEditor } from "../skills/skills-editor";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { collectErrorMessages } from "../lesson/lesson-editor";

export function CourseEditor({
	course,
	onSubmit
}: {
	course: CourseFormModel; // courseId "" when new
	onSubmit: (course: CourseFormModel) => Promise<{
		courseId: string;
		slug: string;
		title: string;
	}>;
}) {
	const router = useRouter();
	const form = useForm({ defaultValues: course, resolver: zodResolver(courseFormSchema) });
	const courseId = useWatch({ control: form.control, name: "courseId" });
	const type = useWatch({ control: form.control, name: "type" });
	const title = useWatch({ control: form.control, name: "title" });
	const { isDirty } = useFormState({ control: form.control });
	const [tab, setTab] = useState(0);
	const isPersisted = Boolean(courseId);

	// TODO do I need it here?
	const session = useRequiredSession();
	const username = session.data?.user?.name;
	const { data: author, isLoading } = trpc.author.getByUsername.useQuery(
		{ username: username as string },
		{ enabled: !!username }
	);

	const onTabChange = (index: number) => {
		if (!isPersisted && index > 0) {
			showToast({
				type: "warning",
				title: "Kurs zuerst anlegen",
				subtitle: "Speichern Sie die Grunddaten über Erstellen."
			});
			setTab(0);
			return;
		}
		setTab(index);
	};

	function onClose() {
		if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) {
			return;
		}
		// TODO will have to rollback saved stuff!!!
		router.back();
	}

	async function handleSave(data: CourseFormModel) {
		try {
			const saved = await onSubmit(data);
			const nextValues = { ...data, courseId: saved.courseId, slug: saved.slug };
			form.reset(nextValues);
			showToast({
				type: "success",
				title: isPersisted ? "Kurs gespeichert" : "Kurs erstellt",
				subtitle: saved.title
			});
			if (!isPersisted) {
				await router.replace(`/teaching/courses/edit/${saved.courseId}`);
			}
		} catch (error) {
			showToast({
				type: "error",
				title: "Speichern fehlgeschlagen",
				subtitle: error instanceof Error ? error.message : "Bitte erneut versuchen."
			});
		}
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!author) {
		return <div>Author not found.</div>;
	}

	return (
		<FormProvider {...form}>
			<form
				id="courseform"
				onSubmit={form.handleSubmit(handleSave, showCourseValidationErrors)}
				className="w-full"
			>
				{/** TODO duplicated from lesson editor */}
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<div className="flex justify-between mb-8">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-2xl text-c-primary">
								{isPersisted ? "Kurs bearbeiten" : "Kurs erstellen"}
							</span>
							<h1 className="text-4xl">{title}</h1>
						</div>
						<div className="pointer-events-auto">
							<DialogActions abortLabel="Schließen" onClose={onClose}>
								<OpenAsJsonButton form={form} validationSchema={courseFormSchema} />
								<button type="submit" className="btn-primary pointer-events-auto">
									{isPersisted ? "Speichern" : "Erstellen"}
								</button>
							</DialogActions>
						</div>
					</div>
					<Tabs selectedIndex={tab} onChange={onTabChange}>
						<Tab>Grunddaten</Tab>
						<ToggledTab enabled={isPersisted}>Skills</ToggledTab>
						<ToggledTab enabled={isPersisted}>Inhalt</ToggledTab>
						<ToggledTab enabled={isPersisted}>Vorschau</ToggledTab>
					</Tabs>
					{tab === 0 && <CourseInfoForm isNew={!isPersisted} />}
					{tab === 1 && <SkillsEditor />}
					{tab === 2 &&
						isPersisted &&
						(type === CourseType.STATIC ? (
							<CourseContentForm />
						) : (
							<CourseModuleView courseId={courseId} authorId={author.id} />
						))}
					{/* {tab === 3 && isPersisted && <CoursePreviewPane />} */}
				</div>
			</form>
		</FormProvider>
	);
}

function ToggledTab({ enabled, children }: { enabled: boolean; children: ReactNode }) {
	return (
		<Tab>
			<span className={enabled ? undefined : "opacity-30 cursor-not-allowed"}>
				{children}
			</span>
		</Tab>
	);
}

function showCourseValidationErrors(errors: FieldErrors) {
	const errorMsg = collectErrorMessages(errors)
		.map(item => {
			switch (item.field) {
				case "title":
					return "🞄 Kein Titel vergeben.";
				case "slug":
					return "🞄 Keine gültige URL-ID (Slug, mind. 3 Zeichen).";
				case "subtitle":
					return "🞄 Kein Untertitel vergeben.";
				case "permissions":
					return "🞄 Mindestens eine Gruppe mit Rechten wählen.";
				default:
					return `🞄 ${item.field}: ${item.message}`;
			}
		})
		.join("\n");
	showToast({
		type: "error",
		title: "Validierungsfehler",
		subtitle: errorMsg || "Bitte Pflichtfelder prüfen."
	});
}
