"use client";
import { SidebarEditorLayout, useRequiredSession } from "@self-learning/ui/layouts";
import { useCallback, useMemo, useState } from "react";
import { DialogHandler, LoadingBox } from "@self-learning/ui/common";
import { SkillFormModel } from "@self-learning/types";
import { SelectedSkillsInfoForm } from "./skill-edit-form";
import { ShowCyclesDialog } from "./cycle-detection/cycle-detection";
import {
	OptionalVisualizationWithRequiredId,
	SkillFolderVisualization,
	SkillSelectHandler,
	createDisplayData,
	switchSelectionDisplayValue,
	changeDisplay,
	getCycleDisplayInformation
} from "./skill-display";
import { SkillFolderTable } from "./folder-table";
import { trpc } from "@self-learning/api-client";

export function CreateAndViewSkills({
	initialSkills,
	selectedSkill
}: {
	initialSkills: SkillFormModel[];
	selectedSkill?: SkillFormModel;
}) {
	const { data: skills = initialSkills, isLoading } = trpc.skill.getParentSkills.useQuery();

	const session = useRequiredSession();
	const username = session.data?.user.name;

	const { data: author } = trpc.author.getByUsername.useQuery({
		username: username ?? ""
	});

	if (isLoading) {
		return <LoadingBox />;
	}

	if (!author) {
		return <div>Author Missing</div>;
	}

	const treeContent = new Map<string, SkillFormModel>();

	skills?.forEach(skill => {
		treeContent.set(skill.id, skill);
	});

	return (
		<SkillFolderEditor
			skills={treeContent}
			authorId={author.id}
			initiallySelectedSkill={selectedSkill}
		/>
	);
}

export function SkillFolderEditor({
	initiallySelectedSkill,
	skills,
	authorId
}: {
	initiallySelectedSkill?: SkillFormModel;
	skills: Map<string, SkillFormModel>;
	authorId: number;
}) {
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(skills);

	const [selectedItem, setSelectedItem] = useState<{
		previousSkill?: string;
		currentSkill?: string;
	}>({ currentSkill: initiallySelectedSkill?.id });

	const cycles = useMemo(() => {
		const cycleData = getCycleDisplayInformation(skills);
		updateSkillDisplay(cycleData);
		return cycleData;
	}, [skills, updateSkillDisplay]);

	const showCyclesDialog = cycles.length > 0;

	const selectedSkill = skills.get(selectedItem.currentSkill ?? "");

	const changeEditTarget = useCallback(
		(skillId?: string) => {
			setSelectedItem(({ currentSkill: previousSelection }) => {
				const visualsToUpdate = switchSelectionDisplayValue(previousSelection, skillId);
				updateSkillDisplay(visualsToUpdate);

				return {
					previousSkill: previousSelection,
					currentSkill: skillId
				};
			});
		},
		[updateSkillDisplay]
	);
	return (
		<div className="bg-gray-50">
			<SidebarEditorLayout
				sidebar={
					<SidebarContentEditor
						skill={selectedSkill}
						changeEditTarget={changeEditTarget}
					/>
				}
			>
				{!!showCyclesDialog && <ShowCyclesDialog cycleParticipants={cycles} />}
				<SkillFolderTable
					skillDisplayData={skillDisplayData}
					selectedSkill={selectedSkill}
					onSkillSelect={changeEditTarget}
					updateSkillDisplay={updateSkillDisplay}
					authorId={authorId}
				/>
			</SidebarEditorLayout>
			<DialogHandler id={"simpleDialog"} />
		</div>
	);
}

export function useTableSkillDisplay(skills: Map<string, SkillFormModel>) {
	const [skillDisplayData, setSkillDisplayData] = useState(
		new Map<string, SkillFolderVisualization>()
	);

	const [displayBuffer, setDisplayBuffer] = useState<
		OptionalVisualizationWithRequiredId[] | null
	>();

	const updateSkillDisplay = useCallback(
		(displayUpdate: OptionalVisualizationWithRequiredId[] | null) => {
			setSkillDisplayData(historicDisplayData => {
				const { displayData, ignoredData: displayWithoutSkill } = changeDisplay({
					historicDisplayData,
					displayUpdate,
					skills
				});
				if (displayWithoutSkill.length > 0) {
					setDisplayBuffer(
						prev => prev?.concat(displayWithoutSkill) ?? displayWithoutSkill
					);
				}

				return displayData;
			});
		},
		[skills]
	);

	useMemo(() => {
		const checkNewItemBuffer = (skillId: string) =>
			displayBuffer?.filter(s => s.id === skillId)?.[0];
		const displayData = new Map<string, SkillFolderVisualization>();
		setSkillDisplayData(prev => {
			skills.forEach(skill => {
				const existingDisplayData = prev.get(skill.id) ?? checkNewItemBuffer(skill.id);
				displayData.set(skill.id, createDisplayData(skill, existingDisplayData));
			});
			return displayData;
		});
	}, [skills, displayBuffer]);

	return { skillDisplayData, updateSkillDisplay };
}

function SidebarContentEditor({
	skill,
	changeEditTarget
}: {
	skill?: SkillFormModel;
	changeEditTarget: SkillSelectHandler;
}) {
	return (
		<div>
			{skill ? (
				<SelectedSkillsInfoForm
					skills={[skill]} // TODO check multiple skills
					onSkillSelect={changeEditTarget}
				/>
			) : (
				"Einen Skill aus der Liste auswählen um das Bearbeiten zu starten..."
			)}
		</div>
	);
}
