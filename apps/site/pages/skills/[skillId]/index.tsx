import { GetServerSideProps } from "next";
import { getAuthenticatedUser } from "@self-learning/api";
import { SkillFormModel } from "@self-learning/types";
import {
	getParentSkills,
	transformSkills
} from "../../../../../libs/data-access/api/src/lib/trpc/routers/skill.router";
import CreateAndViewSkills from "../../../../../libs/feature/teaching/src/lib/skills/folder-editor";

export const getServerSideProps: GetServerSideProps<{
	skills: SkillFormModel[];
	selectedSkill?: SkillFormModel;
}> = async ctx => {
	const selectedSkillId = ctx.params?.skillId;

	const user = await getAuthenticatedUser(ctx);

	if (!user) {
		return {
			redirect: {
				destination: `/login`, // your new URL here
				permanent: false
			}
		};
	}

	const skills = transformSkills(await getParentSkills());

	const selectedSkill = skills.find(skill => skill.id === selectedSkillId);

	return { props: { skills, selectedSkill } };
};

export default function Page({
	skills,
	selectedSkill
}: {
	skills: SkillFormModel[];
	selectedSkill?: SkillFormModel;
}) {
	return <CreateAndViewSkills initialSkills={skills} selectedSkill={selectedSkill} />;
}
