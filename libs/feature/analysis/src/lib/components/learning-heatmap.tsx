// import { MatrixDataPoint } from "chartjs-chart-matrix";
import { HeatmapEntry } from "../metrics/learning-intervalls";
import { Matrix } from "./matrix";
import { ChartData, ChartOptions, ScriptableContext } from "chart.js";

function lightenColor(rgb: string, percentage: number): string {
	// Ensure the percentage is between 0 and 100
	percentage = Math.max(0, Math.min(percentage, 1));

	// Extract RGB values from the input string
	const rgbValues = rgb.match(/\d+/g)?.map(Number);
	if (!rgbValues || rgbValues.length !== 3) {
		throw new Error('Invalid RGB format. Expected format: "rgb(r, g, b)"');
	}

	const [r, g, b] = rgbValues;

	// Calculate the lighter color based on the percentage
	const lighten = (color: number) => Math.round(color + (255 - color) * (1 - percentage));

	const newR = lighten(r);
	const newG = lighten(g);
	const newB = lighten(b);
	console.log("New color:", `rgb(${newR}, ${newG}, ${newB})`);

	return `rgb(${newR}, ${newG}, ${newB})`;
}

const Days: Record<string, number> = {
	Monday: 0,
	Tuesday: 1,
	Wednesday: 2,
	Thursday: 3,
	Friday: 4,
	Saturday: 5,
	Sunday: 6
};
function getCoordinate(value: HeatmapEntry) {
	const result = { x: value.time, y: Days[value.day], v: value.v };
	return result;
}

type MatrixCellValue = { x: number; y: number; v: number };

export function HeatMap({ data }: { data: HeatmapEntry[] }) {
	const chartData: ChartData<"matrix"> = {
		datasets: [
			{
				label: "Lernzeiten",
				data: data.map(entry => ({ ...getCoordinate(entry), v: entry.v })),
				backgroundColor(ctx: ScriptableContext<"matrix">) {
					let percentage = (ctx.dataset.data[ctx.dataIndex] as unknown as MatrixCellValue)
						.v;
					if (percentage < 0.1) {
						percentage = 0.3;
					} else if (percentage < 0.2) {
						percentage = 0.4;
					} else if (percentage < 0.5) {
						percentage = 0.5;
					} else if (percentage < 0.6) {
						percentage = 0.6;
					} else if (percentage < 0.8) {
						percentage = 0.8;
					} else {
						percentage = 1;
					}

					return lightenColor("rgb(100, 150, 200)", percentage);
				},
				width: ({ chart }) => (chart.chartArea || {}).width / 24,
				height: ({ chart }) => (chart.chartArea || {}).height / 7,
				borderWidth: 2,
				borderColor: "#fff"
			}
		]
	};

	const options: ChartOptions<"matrix"> = {
		aspectRatio: 3, // width (24h) / height (7 days)
		scales: {
			x: {
				type: "linear",
				position: "top",
				min: -0.5,
				max: 23.5,
				ticks: {
					callback: value => {
						if (typeof value !== "number") return value;
						value = Math.round(value);
						const hour = String(value).padStart(2, "0");
						return `${hour}:00`;
					},
					stepSize: 1,
					display: true
				},
				grid: {
					display: false
				}
			},
			y: {
				type: "linear",
				position: "left",
				min: -0.5,
				max: 6.5,
				ticks: {
					callback: value => {
						if (typeof value !== "number") return value;
						value = Math.floor(value);
						const days = [
							"Montag",
							"Dienstag",
							"Mittwoch",
							"Donnerstag",
							"Freitag",
							"Samstag",
							"Sonntag"
						];
						return days[value as number];
					},
					stepSize: 1
				},
				grid: {
					display: false
				}
			}
		},
		plugins: {
			tooltip: {
				callbacks: {
					label: context => {
						const value =
							(context.dataset.data[context.dataIndex] as unknown as MatrixCellValue)
								.v * 60;
						return `Lernzeit: ${Math.round(value)} Min.`;
					}
				}
			}
		}
	};

	return <Matrix data={chartData} options={options} />;
}
