import { trpc } from "@self-learning/api-client";
import { SkillFolderEditor } from "@self-learning/teaching";
import { SkillFormModel } from "@self-learning/types";

export function CourseSkillView({ authorId }: { authorId: number }) {
	const allSkills = new Map<string, SkillFormModel>();

	const { data: skills } = trpc.skill.getSkillsByAuthorId.useQuery();

	skills?.forEach(skill => {
		allSkills.set(skill.id, skill);
	});

	return (
		<div>
			<SkillFolderEditor skills={allSkills} authorId={authorId} />
		</div>
	);
}
