import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { RepositoryInfoMemorized, SkillInfoForm } from "./folder-content-form";
import { useState } from "react";
import { trpc } from "@self-learning/api-client";
import { Divider, LoadingBox } from "@self-learning/ui/common";
import FolderListView from "./folder-list-view";
import { SkillFormModel } from "@self-learning/types";

export type SkillSelectHandler = (selectedSkill: SkillFormModel) => void;

export function FolderSkillEditor({ repositoryID }: { repositoryID: string }) {
	const { data: repository, isLoading } = trpc.skill.getRepository.useQuery({ id: repositoryID });
	const [selectedItem, setSelectedItem] = useState<SkillFormModel | null>(null);
	const changeSelectedItem: SkillSelectHandler = item => {
		setSelectedItem(item);
	};

	return (
		<div className="bg-gray-50">
			<SidebarEditorLayout
				sidebar={
					<>
						<div>
							<span className="text-2xl font-semibold text-secondary">
								Skilltree editieren
							</span>
						</div>

						{isLoading ? (
							<LoadingBox />
						) : (
							<>
								{repository && (
									<>
										<RepositoryInfoMemorized repository={repository} />
										<Divider />
									</>
								)}
							</>
						)}
						<SkillInfoForm skill={selectedItem} />
					</>
				}
			>
				{isLoading ? (
					<LoadingBox />
				) : (
					<div>
						{repository && (
							<FolderListView repository={repository} onSelect={changeSelectedItem} />
						)}
					</div>
				)}
			</SidebarEditorLayout>
		</div>
	);
}
