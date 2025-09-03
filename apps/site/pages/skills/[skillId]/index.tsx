import { withAuth, withTranslations } from "@self-learning/api";
import { SkillFormModel } from "@self-learning/types";
import { CreateAndViewSkills } from "@self-learning/teaching";
import {
	getParentSkills,
	transformSkills
} from "libs/data-access/api/src/lib/trpc/routers/skill.router";

export const getServerSideProps = withTranslations(["common"], ctx => {
	return withAuth(async (ctx, user) => {
		if (user.role !== "ADMIN" && !user.isAuthor) {
			return {
				redirect: {
					destination: "/403",
					permanent: false
				}
			};
		}

		const selectedSkillId = ctx.params?.skillId;

		const skills = transformSkills(await getParentSkills());
		const selectedSkill = skills.find(skill => skill.id === selectedSkillId);

		return {
			props: {
				skills,
				selectedSkill
			}
		};
	})(ctx);
});

export default function CreateAndViewSkillsPage({
	skills,
	selectedSkill
}: {
	skills: SkillFormModel[];
	selectedSkill?: SkillFormModel;
}) {
	return <CreateAndViewSkills initialSkills={skills} selectedSkill={selectedSkill} />;
}
