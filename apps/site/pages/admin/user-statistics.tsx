import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { LoadingBox } from "@self-learning/ui/common";
import { AdminGuard, CenteredSection } from "@self-learning/ui/layouts";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { RegistrationHistory } from "../../components/admin/registration-history";

function Statistics() {
	const { t } = useTranslation("pages-admin-user-statistics");
	const { locale } = useRouter();
	const { data, isLoading, isError } = trpc.admin.userStatistics.useQuery();

	if (isLoading) return <LoadingBox />;
	if (isError || !data) return <p role="alert">{t("Load_Error")}</p>;

	const started = new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeZone: "Europe/Berlin"
	}).format(new Date(data.trackingStartedAt));
	const metrics = [
		{ label: t("Today"), value: data.today },
		{ label: t("Semester"), value: data.semester },
		{ label: t("Year"), value: data.year },
		{ label: t("Registered_Users"), value: data.total }
	];
	return (
		<>
			<p className="mb-2 text-c-text-muted">{t("Sign_In_Explanation")}</p>
			<p className="mb-8 text-c-text-muted">{t("Tracking_Started", { date: started })}</p>
			<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{metrics.map(metric => (
					<div
						key={metric.label}
						className="rounded-lg border border-c-border bg-white p-6"
					>
						<dt>{metric.label}</dt>
						<dd className="mt-2 text-3xl font-semibold">
							{new Intl.NumberFormat(locale).format(metric.value)}
						</dd>
					</div>
				))}
			</dl>
			<RegistrationHistory data={data.registrationHistory} />
		</>
	);
}

export default function UserStatisticsPage() {
	const { t } = useTranslation("pages-admin-user-statistics");
	return (
		<AdminGuard>
			<CenteredSection>
				<h1 className="mb-8 text-5xl">{t("Title")}</h1>
				<Statistics />
			</CenteredSection>
		</AdminGuard>
	);
}

export const getServerSideProps = withTranslations(["common", "pages-admin-user-statistics"]);
