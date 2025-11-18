import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import { CodingSvg, EnvStudySvg, ServerSvg } from "@self-learning/ui/static";
import { SoftwareEngineerSvg } from "@self-learning/ui/static";
import { PersonalInformationSvg } from "@self-learning/ui/static";
import { TutorialSvg } from "@self-learning/ui/static";
import { Card } from "@self-learning/ui/common";
import { withTranslations } from "@self-learning/api";
import { useTranslation } from "next-i18next";

export default function AdminPage() {
	const appVersion = process.env.APP_VERSION || "Version not available";
	const { t } = useTranslation("pages-admin");

	return (
		<AdminGuard>
			<CenteredSection>
				<h1 className="mb-16 text-5xl">{t("Management")}</h1>

				<div className="grid grid-cols-2 gap-8">
					<Card
						href="/admin/lessons"
						imageElement={<TutorialSvg />}
						title={t("Manage Lessons")}
					/>

					<Card
						href="/admin/courses"
						imageElement={<SoftwareEngineerSvg />}
						title={t("Manage Courses")}
					/>

					<Card
						href="/admin/subjects"
						imageElement={<EnvStudySvg />}
						title={t("Manage Topics")}
					/>

					<Card
						href="/admin/authors"
						imageElement={<PersonalInformationSvg />}
						title={t("Manage Authors")}
					/>
					<Card
						href="/admin/licenses"
						imageElement={<PersonalInformationSvg />}
						title={t("Manage Licenses")}
					/>
					<Card
						href="/admin/users"
						imageElement={<PersonalInformationSvg />}
						title={t("Manage Users")}
					/>
					<Card
						href="/admin/api-docs"
						imageElement={<CodingSvg />}
						title={t("REST API Documentation")}
					/>
					<Card
						href="/admin/llm-config"
						imageElement={<ServerSvg />}
						title={t("LLM Configuration")}
					/>
				</div>
				<div className="text-center text-sm text-gray-500 mt-8">
					{t("App Version: {{version}}", { version: appVersion })}
				</div>
			</CenteredSection>
		</AdminGuard>
	);
}

export const getServerSideProps = withTranslations(["common", "pages-admin"]);
