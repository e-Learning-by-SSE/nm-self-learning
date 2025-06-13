import { GetServerSideProps } from "next";
import { getAuthenticatedUser } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { LoadingBox } from "@self-learning/ui/common";
import { SkillFormModel } from "@self-learning/types";
import { SkillFolderEditor } from "@self-learning/teaching";
import { getParentSkills } from "../../../../libs/data-access/api/src/lib/trpc/routers/skill.router";
import { useRequiredSession } from "@self-learning/ui/layouts";

export const getServerSideProps: GetServerSideProps<{ transformedSkills: SkillFormModel[] }>
	= async ctx => {
	const user = await getAuthenticatedUser(ctx);

	if (!user) {
		return {
			redirect: {
				destination: `/403`, // your new URL here
				permanent: false
			}
		};
	}

	const skills = await getParentSkills();

	const transformedSkills: SkillFormModel[] = skills.map(skill => ({
		name: skill.name,
		description: skill.description,
		id: skill.id,
		authorId: skill.authorId,
		children: skill.children.map(child => child.id),
		parents: skill.parents.map(parent => parent.id)
	}));

	return { props: { transformedSkills } };
};

export default function CreateAndViewRepository({
	initialSkills
}: {
	initialSkills: SkillFormModel[];
}) {
	const { data: skills = initialSkills, isLoading } = trpc.skill.getParentSkills.useQuery();

	const session = useRequiredSession();
	const username = session.data?.user.name;

	const { data: author } = trpc.author.getByUsername.useQuery({
		username: username ?? ""
	});

	if (isLoading) {
		<LoadingBox />;
	}

	if (!author) {
		return <div>Author Missing</div>;
	}

	const treeContent = new Map<string, SkillFormModel>();

	skills?.forEach(skill => {
		treeContent.set(skill.id, skill);
	});

	if (isLoading) {
		return <LoadingBox />;
	}

	return <SkillFolderEditor skills={treeContent} authorId={author.id} />;
}
