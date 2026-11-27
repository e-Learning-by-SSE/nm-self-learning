import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend
} from "chart.js";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function RegistrationHistory({ data }: { data: Array<{ month: string; total: number }> }) {
	const { t } = useTranslation("pages-admin-user-statistics");
	const { locale } = useRouter();
	const formatter = new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "short",
		timeZone: "UTC"
	});
	const labels = data.map(point => formatter.format(new Date(`${point.month}-01T00:00:00Z`)));

	return (
		<section className="mt-12" aria-labelledby="registration-history-title">
			<h2 id="registration-history-title" className="mb-2 text-2xl font-semibold">
				{t("Registration_History_Title")}
			</h2>
			<p className="mb-6 text-c-text-muted">{t("Registration_History_Explanation")}</p>
			{!data.length ? (
				<p>{t("Registration_History_Empty")}</p>
			) : (
				<>
					<div
						className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
						role="region"
						aria-labelledby="registration-history-title"
						tabIndex={0}
					>
						<div style={{ height: 340, minWidth: Math.max(480, data.length * 36) }}>
							<Line
								role="img"
								aria-label={t("Registration_History_Title")}
								data={{
									labels,
									datasets: [
										{
											label: t("Registration_History_Users"),
											data: data.map(point => point.total),
											borderColor: "#2563eb",
											backgroundColor: "#2563eb",
											tension: 0.15
										}
									]
								}}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
								}}
							/>
						</div>
					</div>
					<details className="mt-4">
						<summary>{t("Registration_History_Table")}</summary>
						<div
							className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
							role="region"
							aria-label={t("Registration_History_Table")}
							tabIndex={0}
						>
							<table className="w-full text-left text-sm">
								<thead className="border-b border-neutral-200 bg-neutral-50">
									<tr>
										<th scope="col" className="px-5 py-4 font-semibold">
											{t("Registration_History_Month")}
										</th>
										<th scope="col" className="px-5 py-4 font-semibold">
											{t("Registration_History_New_Users")}
										</th>
										<th scope="col" className="px-5 py-4 font-semibold">
											{t("Registration_History_Users")}
										</th>
									</tr>
								</thead>
								<tbody>
									{data.map((point, index) => (
										<tr
											key={point.month}
											className="border-b border-neutral-100 last:border-0"
										>
											<th scope="row" className="px-5 py-4 font-medium">
												{labels[index]}
											</th>
											<td className="px-5 py-4">
												{point.total - (data[index - 1]?.total ?? 0)}
											</td>
											<td className="px-5 py-4">{point.total}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</details>
				</>
			)}
		</section>
	);
}
