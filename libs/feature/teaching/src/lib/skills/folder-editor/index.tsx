"use client";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { useCallback, useMemo, useState } from "react";
import { DialogHandler, Divider } from "@self-learning/ui/common";
import { SkillFormModel } from "@self-learning/types";
import { RepositoryInfoMemorized } from "../repository/repository-edit-form";

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
import { SkillRepository } from "@prisma/client";
import { SkillFolderTable } from "./folder-table";

export function SkillFolderEditor({
	repository,
	skills
}: {
	repository: SkillRepository;
	skills: Map<string, SkillFormModel>;
}) {
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(skills);

	const [selectedItem, setSelectedItem] = useState<{
		previousSkill?: string;
		currentSkill?: string;
	}>({});

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
		<div>
			<SidebarEditorLayout
				sidebar={
					<SidebarContentEditor
						skill={selectedSkill}
						changeEditTarget={changeEditTarget}
						repository={repository}
					/>
				}
			>
				{!!showCyclesDialog && <ShowCyclesDialog cycleParticipants={cycles} />}
				<SkillFolderTable
					repository={repository}
					skillDisplayData={skillDisplayData}
					onSkillSelect={changeEditTarget}
					updateSkillDisplay={updateSkillDisplay}
				/>
			</SidebarEditorLayout>
			<DialogHandler id={"simpleDialog"} />
		</div>
	);
}

function useTableSkillDisplay(skills: Map<string, SkillFormModel>) {
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
	changeEditTarget,
	repository
}: {
	skill?: SkillFormModel;
	changeEditTarget: SkillSelectHandler;
	repository: SkillRepository;
}) {
	return (
		<>
			<span className="text-2xl font-semibold text-secondary">Skillkarte bearbeiten</span>

			<RepositoryInfoMemorized repository={repository} />
			<Divider />

			{skill ? (
				<SelectedSkillsInfoForm
					skills={[skill]} // TODO check multiple skills
					onSkillSelect={changeEditTarget}
				/>
			) : (
				"Einen Skill aus der Liste auswählen um das Bearbeiten zu starten..."
			)}
		</>
	);
}
