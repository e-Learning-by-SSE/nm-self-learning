import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { DialogHandler, Divider, LoadingBox } from "@self-learning/ui/common";
import FolderListView from "./folder-list-view";
import { SkillFormModel } from "@self-learning/types";
import { RepositoryInfoMemorized } from "./repository-edit-form";

import { SelectedSkillsInfoForm } from "./skill-edit-form";
import { SkillProps } from "../../../../../../../apps/site/pages/skills/repository/[repoSlug]";
import { checkForCycles, FolderItem } from "./cycle-detection/cycle-detection";

export type SkillSelectHandler = (
	selectedSkill: SkillFormModel[] | null,
	skillMap: Map<string, FolderItem>
) => void;

export function FolderSkillEditor({ skillProps }: { skillProps: SkillProps }) {
	const { data: repository, isLoading } = trpc.skill.getRepository.useQuery({
		id: skillProps.repoId
	});
	const [selectedItem, setSelectedItem] = useState<{
		selected: SkillFormModel[];
		previousSkill: SkillFormModel | null;
	} | null>(null);

	const memorizedSkillMap = useMemo(() => {
		return new Map<string, FolderItem>(
			skillProps.skills.map(skill => [skill.id, { skill: skill, selectedSkill: false }])
		);
	}, [skillProps.skills]);
	
	const [skillMap, setSkillMap] = useState<Map<string, FolderItem>>(memorizedSkillMap);

	useEffect(() => {
		const getCycles = async () => {
			await checkForCycles(skillMap);
		};
		getCycles();
	}, [skillMap]);

	const changeSelectedItem: SkillSelectHandler = item => {
		if (!item) {
			setSelectedItem(null);
			return;
		}
		let previousItem = null;

		if (selectedItem?.selected.length === 1) {
			previousItem = selectedItem.selected[0];
		}

		setSelectedItem({
			selected: item,
			previousSkill: previousItem
		});
	};

	const changeContentOfSkillMap = (skillMap: Map<string, FolderItem>) => {
		setSkillMap(skillMap);
	}

	return (
		<div className="bg-gray-50">
			{isLoading ? (
				<LoadingBox />
			) : (
				<SidebarEditorLayout
					sidebar={
						<>
							<div>
								<span className="text-2xl font-semibold text-secondary">
									Skillkarten editieren
								</span>
							</div>

							{repository && (
								<>
									<RepositoryInfoMemorized repository={repository} />
									<Divider />
								</>
							)}

							{selectedItem ? (
								<SelectedSkillsInfoForm
									skills={selectedItem.selected}
									previousSkill={selectedItem.previousSkill}
									skillMap={skillMap}
									handleSelection={changeSelectedItem}
									handleChangeOfItems={changeContentOfSkillMap}
								/>
							) : (
								"Einen Skill aus der Liste auswählen um das Bearbeiten zu starten..."
							)}
						</>
					}
				>
					{repository && <FolderListView repository={repository} initialSkillMap={skillMap} handleSelection={changeSelectedItem} />}
				</SidebarEditorLayout>
			)}
			<DialogHandler id={"simpleDialog"} />
		</div>
	);
}
