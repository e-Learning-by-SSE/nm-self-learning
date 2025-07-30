import React, { useState } from "react";
import { showToast, Tab, Tabs } from "@self-learning/ui/common";
import { FormProvider, useForm } from "react-hook-form";
import {
	LessonContentEditor,
	LessonFormModel,
	QuizEditor,
	ModuleInfoEditor
} from "@self-learning/teaching";
import { createEmptyLesson, lessonSchema, SkillFormModel } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { DragDropContext } from "@hello-pangea/dnd";
import { ModuleDependency } from "./module-dependency";
import { SkillSelectHandler } from "libs/feature/teaching/src/lib/skills/folder-editor/skill-display";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { ModuleViewProvider } from "@self-learning/teaching";

export function CourseModuleView({
	initialLesson,
	authorId
}: {
	initialLesson?: LessonFormModel;
	authorId: number;
}) {
	const tabs = ["Basisdaten", "Lerninhalt", "Lernkontrolle"];
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { data: skills } = trpc.skill.getSkillsByAuthorId.useQuery();
	const [modules, setModules] = useState<Map<string, LessonFormModel>>(new Map());
	const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
	const allSkills = new Map<string, SkillFormModel>();
	skills?.forEach(skill => {
		allSkills.set(skill.id, skill);
	});
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson()
		},
		resolver: zodResolver(lessonSchema)
	});

	function switchTab(index: number) {
		setSelectedIndex(index);
	}
	const isProvidedSkill = (skillId: string): boolean => {
		const skill = allSkills.get(skillId);
		const provides = form.getValues("provides") ?? [];
		const alreadyProvided = provides.some(s => s.id === skill?.id);
		if (alreadyProvided) {
			return true;
		}
		for (const module of modules.values()) {
			if (module.provides?.some(s => s.id === skillId)) {
				return true;
			}
		}
		return false;
	};
	const onSkillSelect: SkillSelectHandler = skillId => {
		const skill = skillId ? allSkills.get(skillId) : undefined;

		if (!skill) {
			showToast({
				type: "error",
				title: "Skill nicht gefunden",
				subtitle: "Der ausgewählte Skill existiert nicht."
			});
			return;
		}

		if (!form.getValues("title")) {
			form.setValue("title", skill.name);
		}

		if (isProvidedSkill(skill.id)) {
			showToast({
				type: "error",
				title: "Skill bereits vorhanden",
				subtitle: `Der Skill ${skill.name} ist bereits in der Liste der zu vermittelnden Skills enthalten.`
			});
			return;
		}
		form.setValue("provides", [
			...(form.getValues("provides") ?? []),
			{
				id: skill.id,
				name: skill.name,
				description: skill.description ?? null,
				authorId: skill.authorId ?? authorId,
				children: [],
				parents: []
			}
		]);
		showToast({
			type: "success",
			title: "Skill hinzugefügt",
			subtitle: skill.name
		});
	};
	const addSkills = (skillsToAdd: SkillFormModel[], field: "provides" | "requires") => {
		const alreadyRequired = form.getValues("provides")?.some(s => skillsToAdd.some(skill => skill.id === s.id));
		const alreadyProvided = form.getValues("requires")?.some(s => skillsToAdd.some(skill => skill.id === s.id));
		if (alreadyRequired || alreadyProvided) {
			showToast({
				type: "error",
				title: "Skill bereits vorhanden",
				subtitle: `Einige der ausgewählten Skills sind bereits in der Liste der ${field === "provides" ? "vermittelten" : "benötigten"} Skills enthalten.`
			});
			return;
		}
		form.setValue(field, [
			...(form.getValues(field) ?? []),
			...skillsToAdd.map(skill => ({ ...skill, children: [], parents: [] }))
		]);
	};

	const onCreateNewModule = () => form.reset(createEmptyLesson());

	const onSubmit = form.handleSubmit((lesson: LessonFormModel) => {
		const id = selectedModuleId ?? lesson.lessonId ?? crypto.randomUUID();
		const updatedModules = new Map(modules);
		updatedModules.set(id, { ...lesson, lessonId: id });
		setModules(updatedModules);
		setSelectedModuleId(null);
		showToast({
			type: "success",
			title: "Modul gespeichert!",
			subtitle: lesson.title
		});
		setSelectedIndex(0);
		form.reset(createEmptyLesson());
	});

	const onDragEnd = (result: import("@hello-pangea/dnd").DropResult) => {
		if (!result.destination) return;
		if (["provides", "requires"].includes(result.destination.droppableId)) {
			//Filter out the skill ID from the draggableId because only the number after the last colon is the skill ID
			const skillId = result.draggableId.split(":").pop() ?? "";
			const skill = allSkills.get(skillId);
			if (
				form.getValues("provides")?.some(s => s.id === skillId) ||
				form.getValues("requires")?.some(s => s.id === skillId)
			) {
				showToast({
					type: "error",
					title: "Skill bereits vorhanden",
					subtitle: `Der Skill ${skill?.name} ist bereits in der ausgewählten Liste enthalten.`
				});
				return;
			}
			if (skill) {
				addSkills([skill], result.destination.droppableId as "provides" | "requires");
			}
		}
	};
	function handleModuleClick(id: string) {
		const lesson = modules.get(id);
		if (lesson) {
			form.reset(lesson);
			setSelectedModuleId(id);
		}
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <ModuleInfoEditor addSkills={addSkills} />;
			case 1:
				return <LessonContentEditor />;
			case 2:
				return <QuizEditor />;
			default:
				return null;
		}
	};

	return (
		<div className="grid grid-cols-[1fr_2fr] min-h-screen">
			<DragDropContext onDragEnd={onDragEnd}>
				<FormProvider {...form}>
					<ModuleViewProvider
						modules={modules}
						setModules={setModules}
						selectedModuleId={selectedModuleId}
						setSelectedModuleId={setSelectedModuleId}
						allSkills={allSkills}
					>
						<SidebarEditorLayout
							sidebar={
								<ModuleDependency
									onSelectModule={handleModuleClick}
									onSkillSelect={onSkillSelect}
									onCreateNewModule={onCreateNewModule}
								/>
							}
						/>
						<main className="flex-1 min-w-[500px] max-w-[900px] p-8 pr-4 py-4 text-sm">
							<form
								id="lessonform"
								onSubmit={onSubmit}
								className="flex flex-col h-full justify-between"
							>
								<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
									{tabs.map((content, idx) => (
										<Tab key={idx}>{content}</Tab>
									))}
								</Tabs>

								<div className="flex-grow">{renderContent(selectedIndex)}</div>

								<div className="flex justify-end mb-8">
									<button className="btn btn-primary" type="submit">
										{selectedModuleId
											? "Nanomodul speichern"
											: "Nanomodul hinzufügen"}
									</button>
								</div>
							</form>
						</main>
					</ModuleViewProvider>
				</FormProvider>
			</DragDropContext>
		</div>
	);
}
