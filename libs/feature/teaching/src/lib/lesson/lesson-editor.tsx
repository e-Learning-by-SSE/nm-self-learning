"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useState } from "react";
import { FormProvider, useForm, FieldErrors } from "react-hook-form";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useRouter } from "next/router";

export async function onLessonCreatorSubmit(
	onClose: () => void,
	createLessonAsync: (lesson: LessonFormModel) => Promise<{
		title: string;
		lessonId: string;
		slug: string;
	}>,
	lesson?: LessonFormModel
) {
	try {
		let result = null;
		if (lesson) {
			result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
		}
		onClose();
		return result;
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Lerneinheit konnte nicht erstellt werden."
		});

		return null;
	}
}

export async function onLessonEditorSubmit(
	onClose: () => void,
	editLessonAsync: (lesson: {
		lesson: LessonFormModel;
		lessonId: string;
	}) => Promise<{ title: string }>,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			const result = await editLessonAsync({
				lesson: lesson,
				lessonId: lesson.lessonId as string
			});
			showToast({
				type: "success",
				title: "Lerneinheit gespeichert!",
				subtitle: result.title
			});
		}
		onClose();
	} catch (error) {
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Die Lerneinheit konnte nicht gespeichert werden."
		});
	}
}

type ValidationError = {
	field: string;
	message: string;
	type?: string;
};

/**
 * Traverse the nested FieldErrors object from react-hook-form and collect all error messages into a flat array.
 *
 * @param errors
 * @returns
 */

export function collectErrorMessages(errors: FieldErrors): ValidationError[] {
	const result: ValidationError[] = [];
	const visited = new WeakSet<object>();

	function traverse(obj: unknown, path: string[] = []) {
		if (!obj || typeof obj !== "object") return;

		if (visited.has(obj)) return;
		visited.add(obj);

		if ("message" in obj && typeof obj.message === "string") {
			result.push({
				field: path.join("."),
				message: obj.message,
				type: "type" in obj && typeof obj.type === "string" ? obj.type : undefined
			});

			return;
		}

		for (const [key, value] of Object.entries(obj)) {
			// Avoid endless loops on references and skip non-error properties
			if (key === "ref" || key === "type" || key === "message" || key === "types") {
				continue;
			}

			traverse(value, [...path, key]);
		}
	}

	traverse(errors);
	return result;
}

function showValidationErrors(errors: FieldErrors) {
	const errorMessages = collectErrorMessages(errors);
	const errorMsg = errorMessages
		.map(e => {
			switch (e.field) {
				case "title":
					return "🞄 Kein Titel vergeben. Geben Sie einen Titel für die Lerneinheit an.";
				case "slug":
					return "🞄 Keine eindeutige ID vergeben. Geben Sie einen eindeutigen Slug an, um eine URL für die Lerneinheit erzeugen zu können.";
				case "permissions":
					return "🞄 Es wurden keine Bearbeitungsrechte vergeben. Wählen Sie mindestens eine Bearbeitungsgruppe aus.";
				default:
					return `🞄 ${e.field}: ${e.message}`;
			}
		})
		.join("\n");

	showToast({
		type: "error",
		title: "Validierungsfehler",
		subtitle: `Beim Anlegen wurden die folgenden Felder fehlerhaft ausgefüllt:\n${errorMsg}`
	});
}

export function LessonEditor({
	onSubmit,
	initialLesson
}: {
	onSubmit: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
	isFullScreen: boolean;
}) {
	const isNew = initialLesson === null || initialLesson === undefined;
	const router = useRouter();
	const session = useRequiredSession();
	const [selectedTab, setSelectedTab] = useState(0);
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});

	function onCancel() {
		if (window.confirm("Änderungen verwerfen?")) {
			router.back();
		}
	}

	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onSubmit, showValidationErrors)}
				className="w-full"
			>
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<div className="flex justify-between mb-8">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-2xl text-c-primary">
								{initialLesson ? "Lerneinheit bearbeiten" : "Lerneinheit erstellen"}
							</span>
							<h1 className="text-4xl">{initialLesson?.title}</h1>
						</div>
						<div className="pointer-events-auto">
							<DialogActions onClose={onCancel}>
								<OpenAsJsonButton form={form} validationSchema={lessonSchema} />
								<button type="submit" className="btn-primary pointer-events-auto">
									{isNew ? "Erstellen" : "Speichern"}
								</button>
							</DialogActions>
						</div>
					</div>
					<div>
						<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
							<Tab>Grunddaten</Tab>
							<Tab>Lerninhalt</Tab>
							<Tab>Lernkontrolle</Tab>
						</Tabs>
						{selectedTab === 0 && <LessonInfoEditor isNew={isNew} />}
						{selectedTab === 1 && <LessonContentEditor />}
						{selectedTab === 2 && <QuizEditor />}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
