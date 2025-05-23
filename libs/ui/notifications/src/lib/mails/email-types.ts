export type CourseReminderContext = {
	userName: string;
	courseName: string;
	courseUrl: string;
	progress: number;
};

export type AchievementContext = {
	userName: string;
	achievementTitle: string;
	achievementDescription: string;
	xpReward: number;
};

export type StreakReminderContext = {
	userName: string;
	currentStreak: number;
	loginUrl: string;
};

export type EmailContext =
	| { type: "course-reminder"; data: CourseReminderContext }
	| { type: "achievement-unlocked"; data: AchievementContext }
	| { type: "streak-reminder"; data: StreakReminderContext };
