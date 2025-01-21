import { trpc } from "@self-learning/api-client";
import { SkillFolderEditor } from "@self-learning/teaching";
import { SkillRepositoryModel, SkillRepositoryTreeNodeModel } from "@self-learning/types";
import { useState } from "react";

export function CourseSkillView({
	repositories,
	repository
}: {
	repositories: SkillRepositoryModel[];
	repository: SkillRepositoryModel;
}) {
	return <div>{<SkillRepository repositories={repositories} repository={repository} />}</div>;
}

export function SkillRepository({
	repositories,
	repository
}: {
	repositories: SkillRepositoryModel[];
	repository: SkillRepositoryModel;
}) {
	const [selectedRepository, setSelectedRepository] = useState<SkillRepositoryModel>(repository);

	const updateSelectedRepository = (repository: SkillRepositoryModel) => {
		setSelectedRepository(repository);
	};

	const treeContent = new Map<string, SkillRepositoryTreeNodeModel>();

	repositories?.forEach(repo => {
		treeContent.set(repo.id, repo);
		const { data: skills } = trpc.skill.getSkillsFromRepository.useQuery({
			repoId: repo.id
		});

		skills?.forEach(skill => {
			treeContent.set(skill.id, skill);
		});
	});

	return (
		<div>
			<SkillFolderEditor
				repositories={repositories}
				repository={selectedRepository}
				skills={treeContent}
				updateSelectedRepository={updateSelectedRepository}
			/>
		</div>
	);
}
