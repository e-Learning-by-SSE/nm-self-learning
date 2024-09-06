import { UserEvent } from "@self-learning/database";

const CONSIDERED_EVENTS = [
	"VIDEO_PLAY",
	"VIDEO_PAUSE",
	"VIDEO_STOP",
	"VIDEO_JUMP",
	"VIDEO_SPEED",
	"VIDEO_END"
] as const;
type EventType = (typeof CONSIDERED_EVENTS)[number];

export type MetricResultTemp = UserEvent & {
	totalWatchTime: number;
	speed: number;
	effectivelyWatched: number;
	watchedAtSpeed: Record<string, number>;
};

function filterEvents(events: UserEvent[]): UserEvent[] {
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

	// Filter out events that are not considered
	return events.filter(event => CONSIDERED_EVENTS.includes(event.action as EventType));
}

class WatchedSpeed {
	private watchedAtSpeed: Record<string, number> = {};
	private minSpeed = 0;
	private maxSpeed = 0;

	constructor(private speeds?: number[]) {
		if (speeds) {
			this.minSpeed = Math.min(...speeds);
			this.maxSpeed = Math.max(...speeds);
		}
		this.reset();
	}

	addWatchedSpeed(speed: number, watchTime: number) {
		if (this.speeds) {
			let bucket = "other";
			if (speed < this.minSpeed) {
				bucket = this.minSpeed.toString();
			} else if (speed > this.maxSpeed) {
				bucket = this.maxSpeed.toString();
			} else if (this.speeds.includes(speed)) {
				bucket = speed.toString();
			}
			this.watchedAtSpeed[bucket] += watchTime;
		}
	}

	getWatchedAtSpeed() {
		return this.watchedAtSpeed;
	}

	reset() {
		this.watchedAtSpeed = {};
		if (this.speeds) {
			this.speeds.forEach(speed => {
				this.watchedAtSpeed[speed.toString()] = 0;
			});
			this.watchedAtSpeed["other"] = 0;
		}
	}
}

export function computeDuration(events: UserEvent[], speeds?: number[]): MetricResultTemp[] {
	events = filterEvents(events);

	let totalWatchTime = 0;
	let start: number | undefined = undefined;
	let effectivelyWatched = 0;
	let speed = 1;
	const watchedAtSpeed = new WatchedSpeed(speeds);
	const data = events.map(event => {
		if (event.action === "VIDEO_PLAY") {
			start = event.createdAt.getTime();
		}
		if (event.action === "VIDEO_JUMP") {
			if (start) {
				const watchTime = event.createdAt.getTime() - start;
				effectivelyWatched += watchTime * speed;
				totalWatchTime += watchTime;
				watchedAtSpeed.addWatchedSpeed(speed, watchTime);
			}
			start = event.createdAt.getTime();
			return {
				...event,
				totalWatchTime,
				speed,
				effectivelyWatched,
				watchedAtSpeed: watchedAtSpeed.getWatchedAtSpeed()
			};
		}
		if (event.action === "VIDEO_SPEED") {
			if (start) {
				// Video was playing, continue to play
				const watchTime = event.createdAt.getTime() - start;
				effectivelyWatched += watchTime * speed;
				totalWatchTime += watchTime;
				watchedAtSpeed.addWatchedSpeed(speed, watchTime);
				start = event.createdAt.getTime();
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const payload = event.payload as Record<string, any>;
			speed = payload["videoSpeed"];
			return {
				...event,
				totalWatchTime,
				speed,
				effectivelyWatched,
				watchedAtSpeed: watchedAtSpeed.getWatchedAtSpeed()
			};
		}
		if (event.action === "VIDEO_PAUSE" || event.action === "VIDEO_STOP") {
			if (!start) {
				return {
					...event,
					totalWatchTime,
					speed,
					effectivelyWatched,
					watchedAtSpeed: watchedAtSpeed.getWatchedAtSpeed()
				};
			}
			const watchTime = event.createdAt.getTime() - start;
			effectivelyWatched += watchTime * speed;
			totalWatchTime += watchTime;
			watchedAtSpeed.addWatchedSpeed(speed, watchTime);
			start = undefined;
			return {
				...event,
				totalWatchTime,
				speed,
				effectivelyWatched,
				watchedAtSpeed: watchedAtSpeed.getWatchedAtSpeed()
			};
		}
		if (event.action === "VIDEO_END") {
			// Reset computation
			if (start) {
				const watchTime = event.createdAt.getTime() - start;
				totalWatchTime += watchTime;
				effectivelyWatched += watchTime * speed;
				watchedAtSpeed.addWatchedSpeed(speed, watchTime);
			}
			const result = {
				...event,
				totalWatchTime,
				speed,
				effectivelyWatched,
				watchedAtSpeed: watchedAtSpeed.getWatchedAtSpeed()
			};
			start = undefined;
			totalWatchTime = 0;
			effectivelyWatched = 0;
			watchedAtSpeed.reset();
			return result;
		}

		return {
			...event,
			totalWatchTime,
			speed,
			effectivelyWatched,
			watchedAtSpeed: watchedAtSpeed.getWatchedAtSpeed()
		};
	});

	return data;

	// return data.map(event => {
	// 	const { createdAt, totalWatchTime, speed, effectivelyWatched, watchedAtSpeed } = event;
	// 	const result: Record<string, number> = {
	// 		totalWatchTime,
	// 		speed,
	// 		effectivelyWatched,
	// 		...watchedAtSpeed
	// 	};
	// 	return { createdAt, values: result };
	// });
}
