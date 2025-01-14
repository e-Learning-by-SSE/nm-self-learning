import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { useCallback, useMemo, useState } from "react";
import { DialogHandler, Divider } from "@self-learning/ui/common";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
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
	repositories,
	repository,
	skills,
	updateSelectedRepository
}: {
	repositories: SkillRepository[];
	repository: SkillRepository;
	skills: Map<string, SkillFormModel>;
	updateSelectedRepository: (repositoryId: SkillRepositoryModel) => void;
}) {
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(skills);
	const [selectedRepository, setSelectedRepository] = useState(repository);

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
			if (skillId?.startsWith("RPO.")) {
				const repoId = skillId.replace("RPO.", "");
				const repository = repositories.find(repository => repository.id === repoId);
				if (repository) {
					updateSelectedRepository(repository);
					setSelectedRepository({ ...repository });
					changeEditTarget(undefined);
				}
			} else {
				setSelectedItem(({ currentSkill: previousSelection }) => {
					const visualsToUpdate = switchSelectionDisplayValue(previousSelection, skillId);
					updateSkillDisplay(visualsToUpdate);

					if (skillId) {
						const repoId = skills.get(skillId)?.repositoryId;
						const repository = repositories.find(
							repository => repository.id === repoId
						);
						if (repository) {
							updateSelectedRepository(repository);
							setSelectedRepository({ ...repository });
						}
					}

					return {
						previousSkill: previousSelection,
						currentSkill: skillId
					};
				});
			}
		},
		[updateSkillDisplay, repositories, updateSelectedRepository]
	);

	return (
		<div className="bg-gray-50">
			<SidebarEditorLayout
				sidebar={
					<SidebarContentEditor
						skill={selectedSkill}
						changeEditTarget={changeEditTarget}
						repository={selectedRepository}
					/>
				}
			>
				{!!showCyclesDialog && <ShowCyclesDialog cycleParticipants={cycles} />}
				<SkillFolderTable
					repository={repository}
					skillDisplayData={skillDisplayData}
					selectedSkill={selectedSkill}
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
			<span className="text-2xl font-semibold text-secondary">Skillkarten editieren</span>

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
