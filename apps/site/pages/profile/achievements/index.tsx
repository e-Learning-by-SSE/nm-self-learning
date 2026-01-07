import { withTranslations } from "@self-learning/api";
import { AchievementOverview } from "@self-learning/achievements";
import { CenteredSection } from "@self-learning/ui/layouts";
import { NextComponentType, NextPageContext } from "next";
import { withAuth } from "@self-learning/util/auth";

function AchievementLayout(
	Component: NextComponentType<NextPageContext, unknown, Record<string, never>>,
	pageProps: Record<string, never>
) {
	return (
		<CenteredSection>
			<Component {...pageProps} />
		</CenteredSection>
	);
}

function AchievementsPage() {
	return (
		<div>
			<div className="max-w-7xl mx-auto py-8">
				<AchievementOverview />
			</div>
		</div>
	);
}

AchievementsPage.getLayout = AchievementLayout;

export const getServerSideProps = withAuth(withTranslations(["common"]));

export default AchievementsPage;
