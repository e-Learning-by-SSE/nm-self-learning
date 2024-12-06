import { trpc } from "@self-learning/api-client";
import { SkillFolderEditor } from "@self-learning/teaching";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";

export function CourseSkillView({ repository }: { repository: SkillRepositoryModel | undefined }) {
	return <div>{<SkillRepository repository={repository} />}</div>;
}

export function SkillRepository({ repository }: { repository: SkillRepositoryModel | undefined }) {
	if (!repository) {
		return <div>No repository</div>;
	}

	const { data: skills, isLoading } = trpc.skill.getSkillsFromRepository.useQuery({
		repoId: repository.id
	});

	const skillContent = new Map<string, SkillFormModel>();
	skills?.forEach(skill => {
		skillContent.set(skill.id, skill);
	});

	return (
		<div>
			<SkillFolderEditor repository={repository} skills={skillContent} />
		</div>
	);
}
