"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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
			subtitle: "Die Lernheit konnte nicht gespeichert werden."
		});
	}
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
			router.push("/dashboard/author");
		}
	}

	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				className="w-full bg-gray-100"
			>
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<div className="flex justify-between mb-8">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-2xl text-secondary">
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
						{selectedTab === 0 && <LessonInfoEditor />}
						{selectedTab === 1 && <LessonContentEditor />}
						{selectedTab === 2 && <QuizEditor />}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
