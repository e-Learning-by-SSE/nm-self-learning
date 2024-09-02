import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
ChartJS.register(...registerables);

export function DailyPlot({ data, label }: { data: Record<string, number>; label: string }) {
	const labels = Object.keys(data).map(k => new Date(k).toLocaleDateString());
	const values = Object.values(data).map(v => v / 1000);
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
	return <Line data={chartData} />;
}

function parseWeekYear(weekYearStr: string) {
	const [year, week] = weekYearStr.split("-W").map(Number);

	// Create a new date object representing the start of the year
	const januaryFirst = new Date(year, 0, 1);

	// Calculate the number of days to add to reach the first day of the specified week
	const daysToAdd = (week - 1) * 7;

	// Find the first Thursday in January
	const dayOfWeek = januaryFirst.getDay(); // 0 (Sunday) to 6 (Saturday)
	const firstThursdayOffset = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;

	// Add the offset and daysToAdd to January 1st to get the correct date
	januaryFirst.setDate(januaryFirst.getDate() + firstThursdayOffset + daysToAdd);
	console.log(januaryFirst.toLocaleDateString());

	return januaryFirst;
}

export function WeeklyPlot({ data, label }: { data: Record<string, number>; label: string }) {
	const labels = Object.keys(data).map(k => parseWeekYear(k).toLocaleDateString());
	const values = Object.values(data).map(v => v / 1000);
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

	return <Bar data={chartData} />;
}
