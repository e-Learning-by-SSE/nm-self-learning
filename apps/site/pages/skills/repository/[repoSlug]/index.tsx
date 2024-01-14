import { FolderSkillEditor} from "@self-learning/teaching";
import { GetServerSideProps } from "next";
import { database } from "@self-learning/database";
import { SkillFormModel } from "@self-learning/types";
import { getAuthenticatedUser } from "@self-learning/api";

async function createNew(userId: string) {
	const newRep = {
		ownerId: userId,
		name: "Neue Skillkarte: " + Date.now(),
		description: "Beschreibung der Skillkarte"
	};
	const result = await database.skillRepository.create({
		data: newRep
	});

	console.log("New repository created", {
		repoId: result.id,
		ownerId: result.ownerId
	});
	const newRepoSlug = result.id; // route to created repo
	return {
		redirect: {
			destination: `/skills/repository/${newRepoSlug}`, // your new URL here
			permanent: false
		}
	};
}

async function getSkills(repoId: string) {
	const skills = await database.skill.findMany({
		where: { repositoryId: repoId },
		select: {
			id: true,
			name: true,
			description: true,
			repositoryId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } },
			repository: true
		}
	});

	const transformedSkill = skills.map(skill => {
		return {
			id: skill.id,
			name: skill.name,
			description: skill.description,
			repositoryId: skill.repositoryId,
			children: skill.children.map(child => child.id),
			parents: skill.parents.map(parent => parent.id)
		};
	});
	return transformedSkill;
}

export type SkillProps = { repoId: string; skills: SkillFormModel[] };

export const getServerSideProps: GetServerSideProps<SkillProps> = async ctx => {
	const repoId = ctx.query.repoSlug as string;
	const user = await getAuthenticatedUser(ctx);

	if (!user) {
		return {
			redirect: {
				destination: `/403`, // your new URL here
				permanent: false
			}
		};
	}

	if (!repoId || repoId === "") return { notFound: true };

	if (repoId === "create") {
		return await createNew(user.id);
	}

	const transformedSkill = await getSkills(repoId);

	return { props: { repoId, skills: transformedSkill }, notFound: false };
};

export default function CreateAndViewRepository(skills: SkillProps) {
	return (
		<div>
			<FolderSkillEditor skillProps={skills} />
		</div>
	);
}
