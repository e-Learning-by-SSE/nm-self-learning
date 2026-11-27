import { database } from "./prisma";

/** UTC midnight representing the calendar date in Berlin, suitable for a PostgreSQL DATE. */
export function berlinCalendarDay(now: Date): Date {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Berlin",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(now);
	const part = (name: string) => Number(parts.find(value => value.type === name)?.value);
	return new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
}

export function signInPeriodStarts(now: Date) {
	const today = berlinCalendarDay(now);
	const year = today.getUTCFullYear();
	const month = today.getUTCMonth();
	return {
		today,
		semester: new Date(
			Date.UTC(month < 3 ? year - 1 : year, month < 3 || month >= 9 ? 9 : 3, 1)
		),
		year: new Date(Date.UTC(year, 0, 1))
	};
}

export async function recordDailySignIn(userId: string, now = new Date()) {
	const day = berlinCalendarDay(now);
	await database.dailySignIn.upsert({
		where: { userId_day: { userId, day } },
		create: { userId, day },
		update: {}
	});
}

export async function getSignInStatistics(now = new Date()) {
	const { today, semester, year } = signInPeriodStarts(now);
	const [counts, registrationHistory, tracking] = await Promise.all([
		database.$queryRaw<Array<{ today: number; semester: number; year: number }>>`
			SELECT
				COUNT(DISTINCT "userId") FILTER (WHERE "day" = ${today}::date)::int AS "today",
				COUNT(DISTINCT "userId") FILTER (WHERE "day" >= ${semester}::date AND "day" <= ${today}::date)::int AS "semester",
				COUNT(DISTINCT "userId") FILTER (WHERE "day" >= ${year}::date AND "day" <= ${today}::date)::int AS "year"
			FROM "DailySignIn"
		`,
		getEstimatedRegistrationHistory(now),
		database.signInTracking.findUniqueOrThrow({ where: { id: 1 } })
	]);
	return {
		...counts[0],
		total: registrationHistory.at(-1)?.total ?? 0,
		registrationHistory,
		trackingStartedAt: tracking.startedAt
	};
}

/** Estimated registrations among current users, based on their earliest token expiry. */
export async function getEstimatedRegistrationHistory(now = new Date()) {
	const today = berlinCalendarDay(now);
	const currentMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
	return database.$queryRaw<Array<{ month: string; total: number }>>`
		WITH user_months AS (
			SELECT LEAST(
				date_trunc('month', timezone('Europe/Berlin', to_timestamp(MIN(a.expires_at)))),
				${currentMonth}::date::timestamp
			) AS month
			FROM "Account" a
			JOIN "User" u ON u.id = a."userId"
			WHERE a.provider <> 'demo' AND a.type <> 'demo-account'
				AND u.name NOT ILIKE '%test%' AND u.name NOT ILIKE '%demo%'
				AND u.name NOT ILIKE '%fixture%' AND a.expires_at IS NOT NULL
			GROUP BY a."userId"
		), monthly AS (
			SELECT month, COUNT(*)::int AS added FROM user_months GROUP BY month
		), months AS (
			SELECT generate_series(MIN(month), ${currentMonth}::date::timestamp, interval '1 month') AS month
			FROM monthly
		)
		SELECT to_char(months.month, 'YYYY-MM') AS month,
			SUM(COALESCE(monthly.added, 0)) OVER (ORDER BY months.month)::int AS total
		FROM months LEFT JOIN monthly ON months.month = monthly.month
		ORDER BY months.month
	`;
}
