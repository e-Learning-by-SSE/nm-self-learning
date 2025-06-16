import { GetServerSideProps } from "next";
import { getAuthenticatedUser } from "@self-learning/api";
import { SkillFormModel } from "@self-learning/types";
import {
	getParentSkills,
	transformSkills
} from "../../../../libs/data-access/api/src/lib/trpc/routers/skill.router";
import { CreateAndViewSkills } from "@self-learning/teaching";

export const getServerSideProps: GetServerSideProps<{ skills: SkillFormModel[] }> = async ctx => {
	const user = await getAuthenticatedUser(ctx);

	if (!user) {
		return {
			redirect: {
				destination: `/403`, // your new URL here
				permanent: false
			}
		};
	}

	const skills = transformSkills(await getParentSkills());

	return { props: { skills } };
};

export default function CreateAndViewSkillsPage({
	skills,
	selectedSkill
}: {
	skills: SkillFormModel[];
	selectedSkill?: SkillFormModel;
}) {
	return <CreateAndViewSkills initialSkills={skills} selectedSkill={selectedSkill} />;
}
