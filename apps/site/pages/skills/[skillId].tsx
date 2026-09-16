import { withTranslations } from "@self-learning/api";
import { CreateAndViewSkills, I18N_NAMESPACE } from "@self-learning/teaching";
import { AuthorGuard } from "@self-learning/ui/layouts";
import { useRouter } from "next/router";
import { SkillFormModel } from "@self-learning/types";
import { withAuth } from "@self-learning/util/auth";

export const getServerSideProps = withTranslations(
	["common", ...I18N_NAMESPACE],
	withAuth(async () => ({ props: {} }))
);

export default function SkillPage() {
	const skillId = useRouter().query.skillId;
	const selected = typeof skillId === "string" ? ({ id: skillId } as SkillFormModel) : undefined;
	return (
		<AuthorGuard>
			<CreateAndViewSkills initialSkills={[]} selectedSkill={selected} />
		</AuthorGuard>
	);
}
