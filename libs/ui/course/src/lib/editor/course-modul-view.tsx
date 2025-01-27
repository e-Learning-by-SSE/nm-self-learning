import React, { ReactNode, useState } from "react";
import { OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import { FormProvider, useForm } from "react-hook-form";
import { LessonFormModel } from "@self-learning/teaching";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { LessonInfoEditor } from "../../../../../feature/teaching/src/lib/lesson/forms/lesson-info";
import { LessonContentEditor } from "../../../../../feature/teaching/src/lib/lesson/forms/lesson-content";
import { QuizEditor } from "../../../../../feature/teaching/src/lib/lesson/forms/quiz-editor";

export function CourseModulView({
	onSubmit,
	initialLesson
}: {
	onSubmit: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	const tabs = ["Basisdaten", "Lerninhalt", "Lernkontrolle"];
	const [selectedIndex, setSelectedIndex] = useState(0);

	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			//TODO input author here
			authors: []
		},
		resolver: zodResolver(lessonSchema)
	});

	function switchTab(index: number) {
		setSelectedIndex(index);
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <BasicData />;
			case 1:
				return <LearningContent />;
			case 2:
				return <LearningAssessment />;
			default:
				return null;
		}
	};

	return (
		<div>
			<Sidebar
				content={<div>Content</div>}
				footer={<div>footer</div>}
				header={<div>header</div>}
			/>
			<FormProvider {...form}>
				<form id="lessonform" onSubmit={() => {}}>
					<div className="ml-64 m-3">
						<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
							{tabs.map((content, idx) => (
								<Tab key={idx}>{content}</Tab>
							))}
						</Tabs>
						<div>{renderContent(selectedIndex)}</div>
					</div>
				</form>
			</FormProvider>
		</div>
	);
}

function BasicData() {
	return <LessonInfoEditor />;
}

function LearningContent() {
	return <LessonContentEditor />;
}

function LearningAssessment() {
	return <QuizEditor />;
}

export function Sidebar({
	header,
	content,
	footer
}: {
	header: ReactNode;
	content: ReactNode;
	footer: ReactNode;
}) {
	return (
		<div className="fixed left-0 z-10 flex h-full w-full flex-col overflow-hidden bg-white sm:w-64">
			{header}
			{content}
			{footer}
		</div>
	);
}
