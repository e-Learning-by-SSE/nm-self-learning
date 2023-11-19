import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { createContext, useState } from "react";
import { trpc } from "@self-learning/api-client";
import {  DialogHandler, Divider, LoadingBox } from "@self-learning/ui/common";
import FolderListView from "./folder-list-view";
import { SkillFormModel } from "@self-learning/types";
import { RepositoryInfoMemorized } from "./repository-edit-form";
import { SkillInfoForm } from "./skill-edit-form";

export type SkillSelectHandler = (selectedSkill: SkillFormModel | null) => void;
export interface FolderContextProps {
	handleSelection: SkillSelectHandler;
}
export const FolderContext = createContext<FolderContextProps>({ handleSelection: () => {} });

export function FolderSkillEditor({ repositoryID }: { repositoryID: string }) {
	const { data: repository, isLoading } = trpc.skill.getRepository.useQuery({ id: repositoryID });
	const [selectedItem, setSelectedItem] = useState<SkillFormModel | null>(null);

	const changeSelectedItem: SkillSelectHandler = item => {
		console.log("changed item", item);
		setSelectedItem(item);
	};

	return (
		<div className="bg-gray-50">
			<FolderContext.Provider value={{ handleSelection: changeSelectedItem }}>
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
									<SkillInfoForm skill={selectedItem} />
								) : (
									"Einen Skill aus der Liste auswählen um das Bearbeiten zu starten..."
								)}
							</>
						}
					>
						{repository && <FolderListView repository={repository} />}
					</SidebarEditorLayout>
				)}
				<DialogHandler id={"simpleDialog"} />
			</FolderContext.Provider>
		</div>
	);
}
