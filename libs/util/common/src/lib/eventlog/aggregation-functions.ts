type NumericProperty<T> = {
	[K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Base = Record<string, any> & { createdAt: Date };

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

export function sumByDate<T extends Base>(data: T[], key: NumericProperty<T>) {
	return data.reduce(
		(acc, event) => {
			const date = event.createdAt.toISOString().split("T")[0]; // Extract the YYYY-MM-DD part
			let prevValue = acc[date] ?? 0;
			prevValue += event[key];
			acc[date] = prevValue;
			return acc;
		},
		{} as Record<string, number>
	);
}

export function sumByWeek<T extends Base>(data: T[], key: NumericProperty<T>) {
	return data.reduce(
		(acc, event) => {
			const week = getWeek(event.createdAt);
			let prevValue = acc[week] ?? 0;
			prevValue += event[key];
			acc[week] = prevValue;
			return acc;
		},
		{} as Record<string, number>
	);
}

export function msToHMS(ms: number) {
	const seconds = Math.floor(ms / 1000);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;
	return `${hours}:${minutes}:${remainingSeconds}`;
}
