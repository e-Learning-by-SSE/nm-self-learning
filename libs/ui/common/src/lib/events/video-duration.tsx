import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { UserEvent } from "@self-learning/util/common";

/**
 * Adapted function to compute the week of the year.
 * However, usually IsoWeek will start the week by Thursday, this function
 * starts a week by Monday.
 * @param date The date to compute the week
 * @returns year-week
 * @see https://weeknumber.com/how-to/javascript
 */
function getWeek(date: Date): string {
	const tempDate = new Date(date.getTime());
	tempDate.setUTCHours(0, 0, 0, 0);
	tempDate.setUTCDate(tempDate.getUTCDate() + 1 - (tempDate.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
	const weekNo = Math.ceil(((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return `${tempDate.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

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

	const dailyData = filteredData.reduce(
		(acc, event) => {
			const date = event.createdAt.toISOString().split("T")[0]; // Extract the YYYY-MM-DD part
			let previouslyWatched = acc[date] ?? 0;
			previouslyWatched += event.totalWatchTime;
			acc[date] = previouslyWatched;
			return acc;
		},
		{} as Record<string, number>
	);

	const weeklyData = filteredData.reduce(
		(acc, event) => {
			const week = getWeek(event.createdAt);
			let previouslyWatched = acc[week] ?? 0;
			previouslyWatched += event.totalWatchTime;
			acc[week] = previouslyWatched;
			return acc;
		},
		{} as Record<string, number>
	);

	Object.keys(dailyData).forEach(day => {
		console.log(`${day}: ${dailyData[day]}`);
	});

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
