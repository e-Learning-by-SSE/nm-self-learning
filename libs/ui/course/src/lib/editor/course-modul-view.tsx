import React, { ReactNode, useState } from "react";
import { OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import {
	LessonContentEditor,
	LessonFormModel,
	QuizEditor,
	ModuleInfoEditor
} from "@self-learning/teaching";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { CourseSkillForm, LessonSkillManager } from "libs/feature/teaching/src/lib/lesson/forms/lesson-skill-manager";
import { SkillFolderTable } from "libs/feature/teaching/src/lib/skills/folder-editor/folder-table";

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
		<div className={"py-4 mx-auto"}>
			<div>
				<Sidebar
					content={<div>Content</div>}
					footer={<div>footer</div>}
					header={<div>header</div>}
					form={form}
				/>
			</div>
			<div className="ml-[600px] m-3 px-4 max-w-[25%]">
				<FormProvider {...form}>
					<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
						{tabs.map((content, idx) => (
							<Tab key={idx}>{content}</Tab>
						))}
					</Tabs>
					<div className={"items-center justify-center"}>
						{renderContent(selectedIndex)}
					</div>

					<form id="lessonform" onSubmit={() => {}}></form>
				</FormProvider>
			</div>
		</div>
	);
}

function BasicData() {
	return <ModuleInfoEditor />;
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
	footer,
	form
}: {
	header: ReactNode;
	content: ReactNode;
	footer: ReactNode;
	form: UseFormReturn<LessonFormModel>; 
}) {
	return (
		<FormProvider {...form}>
			<div className="fixed ...">
				{header}
				{content}
				{footer}
				{/* {SkillFolderTable({
					repositoryId: "repository-id", 
					onSelectSkill: (skill: CourseSkillForm) => {
						console.log("Selected skill:", skill);
					}
				})} */}
			</div>
		</FormProvider>
	);
}