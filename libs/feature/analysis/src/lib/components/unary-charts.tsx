import { Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { toInterval } from "../aggregation-functions";
import { MetricResult } from "../metrics";
ChartJS.register(...registerables);

export function DailyPlot({
	data,
	label,
	metric
}: {
	data: MetricResult[];
	label: string;
	metric: string;
}) {
	const values: number[] = [];
	const labels: string[] = [];
	data.forEach(d => {
		labels.push(new Date(d.createdAt).toLocaleDateString());
		values.push(d.values[metric]);
	});
	const chartData = {
		labels,
		datasets: [
			{
				label,
				data: values,
				fill: false,
				backgroundColor: "rgba(75,192,192,0.4)",
				pointBorderColor: "rgba(75,192,192,1)",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "rgba(75,192,192,1)",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10
			}
		]
	};

	const dailyOptions: ChartOptions<"line"> = {
		scales: {
			x: {
				type: "time",
				time: {
					parser: "dd.MM.yyyy",
					unit: "day",
					tooltipFormat: "dd.MM.yyyy"
				},
				stacked: true,
				ticks: {
					callback: function (value) {
						return new Date(value).toLocaleDateString("default", {
							day: "numeric",
							month: "numeric",
							year: "2-digit"
						});
					}
				}
			},
			y: {
				type: "timeseries",
				time: {
					parser: "HH:mm:ss",
					unit: "millisecond"
				},
				suggestedMin: 0,
				stacked: true,
				ticks: {
					callback: function (value) {
						return toInterval(new Date(value).getTime());
					}
				}
			}
		},
		// React-chartjs-2 uses by default chart.js 3.x, which is used here
		// Tooltip format in y-axis section did not work (displayed always a leading 1: 01:xx:xx), therefore a callback is used
		plugins: {
			tooltip: {
				callbacks: {
					label: function (context) {
						const value = context.parsed.y;
						return toInterval(value ?? 0);
					}
				}
			}
		}
	};

	return <Line data={chartData} options={dailyOptions} />;
}

function parseWeekYear(weekYearStr: string) {
	const [year, week] = weekYearStr.split("-W").map(Number);

	// Create a new date object representing the start of the year
	const date = new Date(year, 0, 1);

	// Calculate the number of days to add to reach the first day of the specified week
	const daysToAdd = (week - 1) * 7;

	// Find the first Thursday in January
	const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
	const firstThursdayOffset = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;

	// Add the offset and daysToAdd to January 1st to get the correct date
	date.setDate(date.getDate() + firstThursdayOffset + daysToAdd);
	console.log(date.toLocaleDateString());

	return date;
}

const DEFAULT_INTERVAL_BASED_BAR_CHART_OPTIONS: ChartOptions<"bar"> = {
	scales: {
		y: {
			type: "timeseries",
			time: {
				parser: "HH:mm:ss",
				unit: "millisecond"
			},
			suggestedMin: 0,
			stacked: true,
			ticks: {
				callback: function (value) {
					return toInterval(new Date(value).getTime());
				}
			}
		}
	},
	// React-chartjs-2 uses by default chart.js 3.x, which is used here
	// Tooltip format in y-axis section did not work (displayed always a leading 1: 01:xx:xx), therefore a callback is used
	plugins: {
		tooltip: {
			callbacks: {
				label: function (context) {
					const value = context.parsed.y;
					return toInterval(value ?? 0);
				}
			}
		}
	}
};

export function WeeklyPlot({
	data,
	label,
	metric
}: {
	data: MetricResult[];
	label: string;
	metric: string;
}) {
	const values: number[] = [];
	const labels: string[] = [];
	data.forEach(d => {
		labels.push(d.createdAt.toLocaleDateString());
		values.push(d.values[metric]);
	});
	const chartData = {
		labels,
		datasets: [
			{
				label,
				data: values,
				fill: false,
				backgroundColor: "rgba(14,165,233,0.4)",
				pointBorderColor: "rgba(14,165,233,1)",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "rgba(14,165,233,1)",
				pointHoverBorderColor: "rgba(14,165,233,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10
			}
		]
	};

	return <Bar data={chartData} options={DEFAULT_INTERVAL_BASED_BAR_CHART_OPTIONS} />;
}

export function MonthlyPlot({
	data,
	label,
	metric
}: {
	data: MetricResult[];
	label: string;
	metric: string;
}) {
	const values: number[] = [];
	const labels: string[] = [];
	data.forEach(d => {
		labels.push(
			new Date(d.createdAt).toLocaleDateString("default", { month: "long", year: "2-digit" })
		);
		values.push(d.values[metric]);
	});
	const chartData = {
		labels,
		datasets: [
			{
				label,
				data: values,
				fill: false,
				backgroundColor: "rgba(14,165,233,0.4)",
				pointBorderColor: "rgba(14,165,233,1)",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "rgba(14,165,233,1)",
				pointHoverBorderColor: "rgba(14,165,233,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10
			}
		]
	};

	return <Bar data={chartData} options={DEFAULT_INTERVAL_BASED_BAR_CHART_OPTIONS} />;
}
