import { trpc } from "@self-learning/api-client";
import { SkillFolderEditor } from "@self-learning/teaching";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
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

	const { data: skills, isLoading } = trpc.skill.getSkillsFromRepository.useQuery({
		repoId: selectedRepository.id
	});

	const skillContent = new Map<string, SkillFormModel>();
	// skills?.forEach(skill => {
	// 	skillContent.set(skill.id, skill);
	// });

	repositories.forEach(repo => {
		const { data: skills, isLoading } = trpc.skill.getSkillsFromRepository.useQuery({
			repoId: repo.id
		});
		const repoId: string = "RPO." + repo.id;

		const repoTopSkills: string[] = [];
		skills?.forEach(skill => {
			if (skill.parents.length === 0) {
				repoTopSkills.push(skill.id);
				skillContent.set(skill.id, { ...skill, parents: [repoId] });
			} else {
				skillContent.set(skill.id, skill);
			}
		});

		const repoInSkillTree = {
			id: repoId,
			name: repo.name,
			description: null,
			repositoryId: "",
			children: repoTopSkills,
			parents: []
		};

		skillContent.set(repoId, repoInSkillTree);
	});

	return (
		<div>
			<SkillFolderEditor
				repositories={repositories}
				repository={selectedRepository}
				skills={skillContent}
				updateSelectedRepository={updateSelectedRepository}
			/>
		</div>
	);
}
