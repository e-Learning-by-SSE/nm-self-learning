import { trpc } from "@self-learning/api-client";
import { Table, TableDataColumn, TableHeaderColumn } from "@self-learning/ui/common";
import { UserEvent } from "@self-learning/api";

function computeDuration(events: UserEvent[]) {
	let totalWatchTime = 0;
	let start: number | undefined = undefined;
	let speed = 1;
	const data = events.map(event => {
		if (event.action === "VIDEO_PLAY" && event.payload) {
			start = event.createdAt.getTime();
		}
		if (event.action === "VIDEO_SPEED" && event.payload) {
			const payload = event.payload as Record<string, number>;
			speed = payload["videoSpeed"];
		}
		if (event.action === "VIDEO_JUMP" && event.payload) {
			const payload = event.payload as Record<string, number>;
			if (!start) {
				return { ...event, speed, totalWatchTime };
			}
			const watchTime = event.createdAt.getTime() - start;
			totalWatchTime += watchTime;
			start = payload["videoLand"];
			return { ...event, speed, totalWatchTime };
		}
		if (event.action === "VIDEO_PAUSE" || event.action === "VIDEO_STOP") {
			if (!start) {
				return { ...event, speed, totalWatchTime };
			}
			const watchTime = event.createdAt.getTime() - start;
			totalWatchTime += watchTime;
			start = undefined;
			return { ...event, speed, totalWatchTime };
		}

		return { ...event, speed, totalWatchTime };
	});
	return data;
}

export function VideoDuration() {
	const { data, isLoading } = trpc.events.get.useQuery({
		action: [
			"VIDEO_PLAY",
			"VIDEO_PAUSE",
			// "VIDEO_END", Redundant to PAUSE
			"VIDEO_JUMP", // Probably not needed
			//"VIDEO_OPENED", Redundant to Start
			"VIDEO_SPEED",
			"VIDEO_RESOLUTION", // Probably not needed
			//"VIDEO_START",
			"VIDEO_STOP"
		]
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No data</div>;
	}
	const computedData = computeDuration(data);

	return (
		<Table
			head={
				<>
					<TableHeaderColumn>Date</TableHeaderColumn>
					<TableHeaderColumn>Action</TableHeaderColumn>
					<TableHeaderColumn>ResourceID</TableHeaderColumn>
					<TableHeaderColumn>PayLoad</TableHeaderColumn>
					<TableHeaderColumn>Speed</TableHeaderColumn>
					<TableHeaderColumn>WatchTime (Total)</TableHeaderColumn>
				</>
			}
		>
			{computedData.map(event => (
				<tr key={event.id}>
					<TableDataColumn>{event.createdAt.toLocaleString()}</TableDataColumn>
					<TableDataColumn>{event.action}</TableDataColumn>
					<TableDataColumn>{event.resourceId}</TableDataColumn>
					<TableDataColumn>{JSON.stringify(event.payload)}</TableDataColumn>
					<TableDataColumn>{event.speed}</TableDataColumn>
					<TableDataColumn>{event.totalWatchTime}</TableDataColumn>
				</tr>
			))}
		</Table>
	);
}
