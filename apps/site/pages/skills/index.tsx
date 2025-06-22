import { withAuth, withTranslations } from "@self-learning/api";
import { SkillFormModel } from "@self-learning/types";
import {
	getParentSkills,
	transformSkills
} from "../../../../libs/data-access/api/src/lib/trpc/routers/skill.router";
import { CreateAndViewSkills } from "@self-learning/teaching";

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

		const skills = transformSkills(await getParentSkills());

		return {
			props: { skills }
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
