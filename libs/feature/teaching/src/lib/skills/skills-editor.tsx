import { ResourceSkillsFormType, SkillFormModel } from "@self-learning/types";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { LessonSkillManagerDragDrop } from "../lesson/forms/lesson-skill-manager-dragdrop";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useTableSkillDisplay } from "./folder-editor";
import { showToast } from "@self-learning/ui/common";
import { SkillTreeEditor } from "./skill-tree/skill-tree-editor";
import { useMemo } from "react";
import { SkillResourceProvider } from "./skill-tree/skill-resource-context";

/**
 * If you edit a course or standalone lesson - provide nothing
 * If you edit a dynamic course - provide:
 * - courseId if already exists
 * If you edit a nanomodule (lesson of a course) - provide:
 * - courseId
 * - lessonId if already exists
 * @returns
 */
export function SkillsEditor({
	target,
	courseId,
	lessonId
}: {
	target: "lesson" | "course";
	courseId?: string;
	lessonId?: string;
}) {
	const { control, getValues } = useFormContext<ResourceSkillsFormType>();
	const { append: appendProvides, update: updateProvides } = useFieldArray({
		control,
		name: "provides"
	});
	const { append: appendRequires, update: updateRequires } = useFieldArray({
		control,
		name: "requires"
	});

	const requires = useWatch({ control, name: "requires" });
	const provides = useWatch({ control, name: "provides" });

	const { data: ctx } = trpc.course.getSkillContext.useQuery(
		{ courseId: courseId as string },
		{ enabled: !!courseId }
	);

	const requiresSet = useMemo(() => new Set(requires.map(skill => skill.id)), [requires]);
	const providesSet = useMemo(() => new Set(provides.map(skill => skill.id)), [provides]);

	// TODO could be nice also to display course skill goals! - now only display siblings & self
	// TODO who is the author of new skills

	const requiredIds = useMemo(() => {
		const ids = new Set(requiresSet);
		if (!ctx) return ids;
		// append skills from course
		if (target === "lesson") {
			for (const id of ctx.requires) ids.add(id);
		}
		// append skills from siblings
		for (const lesson of ctx.lessons) {
			if (lesson.lessonId === lessonId) continue; // exclude from the current edited lesson
			for (const id of lesson.requires) ids.add(id);
		}
		return ids;
	}, [requiresSet, ctx, lessonId, target]);

	const providedIds = useMemo(() => {
		const ids = new Set(providesSet);
		if (!ctx) return ids;
		// append skills from course
		if (target === "lesson") {
			for (const id of ctx.provides) ids.add(id);
		}
		// append skills from siblings
		for (const lesson of ctx.lessons) {
			if (lesson.lessonId === lessonId) continue; // exclude from the current edited lesson
			for (const id of lesson.provides) ids.add(id);
		}
		return ids;
	}, [providesSet, ctx, lessonId, target]);
	// locked skills - of currently edited resource
	const currentIds = useMemo(
		() => new Set([...requiresSet, ...providesSet]),
		[requiresSet, providesSet]
	);
	// top level ids = course ids
	const topIds =
		target === "lesson"
			? new Set([...(ctx?.requires ?? []), ...(ctx?.provides ?? [])])
			: currentIds;

	const { data: skills } = trpc.skill.getSkills.useQuery();
	const allSkills = useMemo(() => {
		const skillMap = new Map<string, SkillFormModel>();
		skills?.forEach(skill => skillMap.set(skill.id, skill));
		return skillMap;
	}, [skills]);
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(allSkills);

	function addSkills(skillsToAdd: SkillFormModel[], field: "provides" | "requires") {
		const attached = new Set([
			...(getValues("provides") ?? []).map(item => item.id),
			...(getValues("requires") ?? []).map(item => item.id)
		]);
		const append = field === "provides" ? appendProvides : appendRequires;
		for (const skill of skillsToAdd) {
			if (attached.has(skill.id)) {
				showToast({
					type: "error",
					title: "Skill bereits vorhanden",
					subtitle: `Der Skill ${skill.name} ist bereits in der ausgewählten Liste enthalten.`
				});
				continue;
			}
			append(skill);
			attached.add(skill.id);
		}
	}

	function onDragEnd(result: DropResult) {
		const destination = result.destination?.droppableId;
		if (destination !== "provides" && destination !== "requires") return;
		//Filter out the skill ID from the draggableId because only the number after the last colon is the skill ID
		// TODO ::: is used as separator - contract must be declared in one place or use separator as constant
		const skillId = result.draggableId.split(":::").pop() ?? "";
		const skill = allSkills.get(skillId);
		if (skill) addSkills([skill], destination);
	}

	function onSkillUpdated(skillId: string, name: string, description: string) {
		const { provides: provided, requires: required } = getValues();
		provided.forEach((item, index) => {
			if (item.id === skillId) updateProvides(index, { ...item, name, description });
		});
		required.forEach((item, index) => {
			if (item.id === skillId) updateRequires(index, { ...item, name, description });
		});
	}

	return (
		<div>
			<DragDropContext onDragEnd={onDragEnd}>
				<SidebarEditorLayout
					sidebar={
						<SkillResourceProvider
							requiredIds={requiredIds}
							providedIds={providedIds}
							currentIds={currentIds}
							topIds={topIds}
						>
							<SkillTreeEditor
								skillDisplayData={skillDisplayData}
								updateSkillDisplay={updateSkillDisplay}
								onSkillSelect={id => {
									console.log("edit skill", id);
								}}
								onSkillCreate={name => console.log("add skill", name)}
							/>
						</SkillResourceProvider>
					}
				>
					<LessonSkillManagerDragDrop addSkills={addSkills} />
				</SidebarEditorLayout>
			</DragDropContext>
		</div>
	);
}
