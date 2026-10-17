import { withTranslations } from "@self-learning/api";
import { CreateAndViewSkills, I18N_NAMESPACE } from "@self-learning/teaching";
import { AuthorGuard } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";

export const getServerSideProps = withTranslations(
	["common", ...I18N_NAMESPACE],
	withAuth(async () => ({ props: {} }))
);

export default function SkillsPage() {
	return (
		<AuthorGuard>
			<CreateAndViewSkills initialSkills={[]} />
		</AuthorGuard>
	);
}
