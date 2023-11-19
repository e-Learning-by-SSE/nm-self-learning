import {SidebarEditorLayout} from "@self-learning/ui/layouts";
import {createContext, useEffect, useMemo, useState} from "react";
import {trpc} from "@self-learning/api-client";
import {DialogHandler, Divider, LoadingBox} from "@self-learning/ui/common";
import FolderListView from "./folder-list-view";
import {SkillFormModel} from "@self-learning/types";
import {RepositoryInfoMemorized} from "./repository-edit-form";
import {SkillInfoForm} from "./skill-edit-form";
import {SkillProps} from "../../../../../../../apps/site/pages/skills/repository/[repoSlug]";
import {checkForCycles, FolderItem} from "./cycle-detection/cycle-detection";

export type SkillSelectHandler = (selectedSkill: SkillFormModel | null) => void;

export interface FolderContextProps {
	handleSelection: SkillSelectHandler;
	skillMap: Map<string, FolderItem>;
}

export const FolderContext = createContext<FolderContextProps>({
	handleSelection: () => {
	},
	skillMap: new Map<string, FolderItem>()
});

export function FolderSkillEditor({skillProps}: { skillProps: SkillProps }) {
	const {data: repository, isLoading} = trpc.skill.getRepository.useQuery({
		id: skillProps.repoId
	});
	const [selectedItem, setSelectedItem] = useState<{
		selected: SkillFormModel;
		previousSkill: SkillFormModel | null;
	} | null>(null);


	const skillMap = useMemo(() => {
		return new Map<string, FolderItem>(
			skillProps.skills.map(skill => [skill.id, {skill: skill, selectedSkill: false}])
		);
	}, [skillProps.skills]);

	useEffect(() => {
		const getCyclen = async () => {
			await checkForCycles(skillMap);
		};
		getCyclen();
	}, [skillMap]);


	const changeSelectedItem: SkillSelectHandler = item => {
		if (!item) return;
		console.log("changed item", item);
		setSelectedItem({selected: item, previousSkill: selectedItem?.selected ?? null});
	};

	return (
		<div className="bg-gray-50">
			<FolderContext.Provider
				value={{handleSelection: changeSelectedItem, skillMap: skillMap}}
			>
				{isLoading ? (
					<LoadingBox/>
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
										<RepositoryInfoMemorized repository={repository}/>
										<Divider/>
									</>
								)}

								{selectedItem ? (
									<SkillInfoForm
										skill={selectedItem.selected}
										previousSkill={selectedItem.previousSkill}
									/>
								) : (
									"Einen Skill aus der Liste auswählen um das Bearbeiten zu starten..."
								)}
							</>
						}
					>
						{repository && <FolderListView repository={repository} skillMap={skillMap}/>}
					</SidebarEditorLayout>
				)}
				<DialogHandler id={"simpleDialog"}/>
			</FolderContext.Provider>
		</div>
	);
}
