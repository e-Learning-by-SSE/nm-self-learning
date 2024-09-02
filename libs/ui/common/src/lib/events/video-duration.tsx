import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { sumByDate, sumByWeek, UserEvent } from "@self-learning/util/common";
import { useState } from "react";
import { DailyPlot, WeeklyPlot } from "./unary-charts";

type Preview = "Table" | "Daily" | "Weekly";

function computeDuration(events: UserEvent[]) {
	// Filter out cases where the user manually moves the slider
	events = events.filter((event, index) => {
		if (event.action === "VIDEO_JUMP" && index < events.length - 1) {
			const next = events[index + 1];
			// SKIP Jump if next event is also a JUMP (user just moved the slider)
			if (next.action === "VIDEO_JUMP") {
				return false;
			}
		}
		return true;
	});

	let totalWatchTime = 0;
	let start: number | undefined = undefined;
	const data = events.map(event => {
		if (event.action === "VIDEO_PLAY" && event.payload) {
			start = event.createdAt.getTime();
		}
		if (event.action === "VIDEO_JUMP" && event.payload) {
			const payload = event.payload as Record<string, number>;
			if (!start) {
				return { ...event, totalWatchTime };
			}
			const watchTime = event.createdAt.getTime() - start;
			totalWatchTime += watchTime;
			start = payload["videoLand"];
			return { ...event, totalWatchTime };
		}
		if (event.action === "VIDEO_PAUSE" || event.action === "VIDEO_STOP") {
			if (!start) {
				return { ...event, totalWatchTime };
			}
			const watchTime = event.createdAt.getTime() - start;
			totalWatchTime += watchTime;
			start = undefined;
			return { ...event, totalWatchTime };
		}
		if (event.action === "VIDEO_END") {
			// Reset computation
			const result = { ...event, totalWatchTime };
			start = undefined;
			totalWatchTime = 0;
			return result;
		}

		return { ...event, totalWatchTime };
	});
	return data;
}

export function VideoDuration() {
	const [previewSelection, setPreviewSelection] = useState<Preview>("Table");
	const { data, isLoading } = trpc.events.get.useQuery({
		action: [
			"VIDEO_PLAY",
			"VIDEO_PAUSE",
			"VIDEO_JUMP",
			"VIDEO_STOP",
			"VIDEO_END"
			// "VIDEO_OPENED",
			// "VIDEO_START",
			// "VIDEO_RESOLUTION",
		]
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No data</div>;
	}
	const computedData = computeDuration(data);
	const filteredData = computedData.filter((event, index) => {
		if (index < computedData.length - 1) {
			const next = computedData[index + 1];
			// Keep only if next one belongs to a new data series -> watch time is reset
			if (next.totalWatchTime < event.totalWatchTime) {
				return true;
			}
		}
		if (index === computedData.length - 1) {
			return true;
		}
		return false;
	});

	const dailyData = sumByDate(filteredData, "totalWatchTime");

	const weeklyData = sumByWeek(filteredData, "totalWatchTime");

	return (
		<>
			<div className="bg-gray-50 pt-4">
				<div className="flex space-x-4">
					<button
						className="bg-red-500 text-white px-4 py-2 rounded"
						onClick={e => setPreviewSelection("Table")}
					>
						Table
					</button>
					<button
						className="bg-pink-600 text-white px-4 py-2 rounded"
						onClick={e => setPreviewSelection("Daily")}
					>
						Daily
					</button>
					<button
						className="bg-amber-500 text-white px-4 py-2 rounded"
						onClick={e => setPreviewSelection("Weekly")}
					>
						Weekly
					</button>
				</div>
			</div>

			{previewSelection === "Table" ? (
				<TableData
					computedData={computedData}
					filteredData={filteredData}
					dailyData={dailyData}
					weeklyData={weeklyData}
				/>
			) : null}
			{previewSelection === "Daily" ? (
				<DailyPlot data={dailyData} label="Tägliche Lernzeit" />
			) : null}
			{previewSelection === "Weekly" ? (
				<WeeklyPlot data={weeklyData} label="Wöchentliche Lernzeit" />
			) : null}
		</>
	);
}

type TableDataProps = UserEvent & { totalWatchTime: number };

function TableData({
	computedData,
	filteredData,
	dailyData,
	weeklyData
}: {
	computedData: TableDataProps[];
	filteredData: TableDataProps[];
	dailyData: Record<string, number>;
	weeklyData: Record<string, number>;
}) {
	return (
		<>
			<h1 className="text-center text-3xl">Video Duration</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>Action</TableHeaderColumn>
						<TableHeaderColumn>ResourceID</TableHeaderColumn>
						<TableHeaderColumn>PayLoad</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
					</>
				}
			>
				{computedData.map(event => (
					<tr key={event.id}>
						<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>{event.action}</TableDataColumn>
						<TableDataColumn>{event.resourceId}</TableDataColumn>
						<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
						<TableDataColumn>
							{(event.totalWatchTime / 1000).toFixed(2)}
						</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Filtered Data</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>Action</TableHeaderColumn>
						<TableHeaderColumn>ResourceID</TableHeaderColumn>
						<TableHeaderColumn>PayLoad</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
					</>
				}
			>
				{filteredData.map(event => (
					<tr key={event.id}>
						<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
						<TableDataColumn>{event.action}</TableDataColumn>
						<TableDataColumn>{event.resourceId}</TableDataColumn>
						<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
						<TableDataColumn>
							{(event.totalWatchTime / 1000).toFixed(2)}
						</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Daily Sums</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Date</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
					</>
				}
			>
				{Object.keys(dailyData).map(day => (
					<tr key={day}>
						<TableDataColumn>{day}</TableDataColumn>
						<TableDataColumn>{(dailyData[day] / 1000).toFixed(2)}</TableDataColumn>
					</tr>
				))}
			</Table>

			<h1 className="text-center text-3xl">Weekly Sums</h1>
			<Table
				head={
					<>
						<TableHeaderColumn>Week</TableHeaderColumn>
						<TableHeaderColumn>WatchTime</TableHeaderColumn>
					</>
				}
			>
				{Object.keys(weeklyData).map(week => (
					<tr key={week}>
						<TableDataColumn>{week}</TableDataColumn>
						<TableDataColumn>{(weeklyData[week] / 1000).toFixed(2)}</TableDataColumn>
					</tr>
				))}
			</Table>
		</>
	);
}
