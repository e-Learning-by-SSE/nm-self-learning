import { AppRouter } from "@self-learning/api";
import { inferRouterOutputs } from "@trpc/server";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

type ExperimentShortInfoProps = inferRouterOutputs<AppRouter>["me"]["getExperimentStatus"];

export function ExperimentShortInfo(props: ExperimentShortInfoProps) {
	const router = useRouter();
	const { t } = useTranslation("feature-settings");

	const statusText = () => {
		if (props.isParticipating) {
			return <span className="text-green-600 font-bold">{t("Study_Participant")}</span>;
		}
		return <span className="text-red-600 font-bold">{t("Study_Not_Participating")}</span>;
	};

	return (
		<>
			<div className="space-y-4 border-b border-gray-500 pb-4">
				<p>{t("Study_Description")}</p>
				<p>{t("Study_Voluntary_Notice")}</p>
			</div>
			<p>
				{t("Your_Study_Status")} {statusText()}
			</p>
			<p>
				<button
					className="btn-secondary"
					onClick={() => router.push("/experiment/consent")}
				>
					{t("Study_Information_And_Settings")}
				</button>
			</p>
		</>
	);
}
