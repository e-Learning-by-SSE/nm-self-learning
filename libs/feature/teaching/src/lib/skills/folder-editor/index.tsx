import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { useCallback, useMemo, useState } from "react";
import { DialogHandler, Divider } from "@self-learning/ui/common";
import { SkillFormModel } from "@self-learning/types";
import { RepositoryInfoMemorized } from "../repository/repository-edit-form";

import { SelectedSkillsInfoForm } from "./skill-edit-form";
import { ShowCyclesDialog, checkCycles2 } from "./cycle-detection/cycle-detection";
import {
	OptionalVisualizationWithRequiredId,
	SkillFolderVisualization,
	SkillSelectHandler,
	createDisplayData,
	switchSelectionDisplayValue,
	updateDisplay
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
	const [selectedItem, setSelectedItem] = useState<{
		previousSkill?: string;
		currentSkill?: string;
	}>({});

	const [skillDisplayData, setSkillDisplayData] = useState(
		new Map<string, SkillFolderVisualization>()
	);

	const [displayBuffer, setDisplayBuffer] = useState<
		OptionalVisualizationWithRequiredId[] | null
	>();

	const updateSkillDisplay = useCallback(
		(displayUpdate: OptionalVisualizationWithRequiredId[] | null) => {
			const { displayData, displayWithoutSkill } = updateDisplay({
				historicDisplayData: skillDisplayData,
				displayUpdate,
				skills
			});
			setSkillDisplayData(displayData);
			setDisplayBuffer(prev => prev?.concat(displayWithoutSkill) ?? displayWithoutSkill);
		},
		[skills, skillDisplayData]
	);

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
	useMemo(() => {
		/*  will update all display information with db skills
			will remove any old display data
		 */
		const displayData = new Map<string, SkillFolderVisualization>();
		const checkNewItemBuffer = (skillId: string) =>
			displayBuffer?.filter(s => s.id === skillId)?.[0];
		setSkillDisplayData(prev => {
			skills.forEach(skill => {
				const existingDisplayData = prev.get(skill.id) ?? checkNewItemBuffer(skill.id);
				displayData.set(skill.id, createDisplayData(skill, existingDisplayData));
			});
			return displayData;
		});
		console.log(displayData);
	}, [skills, displayBuffer]);

	const cycleParticipants = checkCycles2(skills);
	const cyclesFound = cycleParticipants.length > 0;
	const selectedSkill = skills.get(selectedItem.currentSkill ?? "");
	const previousSkill = skills.get(selectedItem.previousSkill ?? "");

	return (
		<div className="bg-gray-50">
			<SidebarEditorLayout
				sidebar={
					<SidebarContentEditor
						selectedItem={{ currentSkill: selectedSkill, previousSkill }}
						changeEditTarget={changeEditTarget}
						repository={repository}
					/>
				}
			>
				{cyclesFound && <ShowCyclesDialog cycleParticipants={cycleParticipants} />}
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
type SidebarContentProps = {
	selectedItem: {
		currentSkill?: SkillFormModel;
		previousSkill?: SkillFormModel;
	};
	changeEditTarget: SkillSelectHandler;
	repository: SkillRepository;
};

function SidebarContentEditor({ selectedItem, changeEditTarget, repository }: SidebarContentProps) {
	return (
		<>
			<span className="text-2xl font-semibold text-secondary">Skillkarten editieren</span>

			<RepositoryInfoMemorized repository={repository} />
			<Divider />

			{selectedItem.currentSkill ? (
				<SelectedSkillsInfoForm
					skills={[selectedItem.currentSkill]} // TODO check multiple skills
					onSkillSelect={changeEditTarget}
				/>
			) : (
				"Einen Skill aus der Liste auswählen um das Bearbeiten zu starten..."
			)}
		</>
	);
}
