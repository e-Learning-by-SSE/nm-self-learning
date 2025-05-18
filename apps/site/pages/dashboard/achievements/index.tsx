import { withAuth, withTranslations } from "@self-learning/api";
import { AchievementOverview } from "@self-learning/settings";
import { DashboardSidebarLayout } from "@self-learning/ui/layouts";
import { NextComponentType, NextPageContext } from "next";

function AchievementLayout(
	Component: NextComponentType<NextPageContext, unknown, Record<string, never>>,
	pageProps: Record<string, never>
) {
	return (
		<DashboardSidebarLayout>
			<Component {...pageProps} />
		</DashboardSidebarLayout>
	);
}

function AchievementsPage() {
	return (
		<div className="bg-gray-50">
			<div className="max-w-7xl mx-auto py-8">
				<AchievementOverview />
			</div>
		</div>
	);
}

AchievementsPage.getLayout = AchievementLayout;

export const getServerSideProps = withAuth(withTranslations(["common"]));

export default AchievementsPage;
