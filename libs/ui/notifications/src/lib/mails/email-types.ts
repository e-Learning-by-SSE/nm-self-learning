export type CourseReminderContext = {
	userName: string;
	courseName: string;
	courseUrl: string;
	progress: number;
};

export type StreakReminderContext = {
	userName: string;
	currentStreak: number;
	loginUrl: string;
};

export type EmailContext =
	| { type: "courseReminder"; data: CourseReminderContext }
	| { type: "streakReminder"; data: StreakReminderContext };
