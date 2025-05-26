import { database } from "@self-learning/database";
import { EventTypeMap } from "@self-learning/types";
import { endOfDay, secondsToMinutes, startOfDay } from "date-fns";
import { ConditionChecker } from "../achievement-registry";

export const checkTimeLearnedToday: ConditionChecker = async (achievement, username, _context) => {
	if (achievement.meta?.group !== "focus_time") throw new Error("Invalid achievement group");

	//to create compiler error when this
	const payloadField =
		"completionState" as const satisfies keyof EventTypeMap["LESSON_LEARNING_SUBMIT"];
	const dailySubmissions = await database.eventLog.findMany({
		where: {
			username,
			type: "LESSON_LEARNING_SUBMIT",
			createdAt: {
				gte: startOfDay(new Date()),
				lte: endOfDay(new Date())
			},
			payload: {
				path: [payloadField],
				equals: "completed"
			}
		},
		select: {
			payload: true
		},
		orderBy: {
			createdAt: "desc"
		}
	});

	const effectiveTimeLearnedToday = dailySubmissions.reduce((acc, submission) => {
		const typedSubmission =
			submission.payload as unknown as EventTypeMap["LESSON_LEARNING_SUBMIT"];
		const timeLearned = typedSubmission.effectiveTimeLearned ?? 0;
		return acc + timeLearned;
	}, 0);

	const learnedMinutes = secondsToMinutes(effectiveTimeLearnedToday);
	console.warn(
		`Achievement check for focus_time: ${username} has learned ${effectiveTimeLearnedToday} seconds and ${learnedMinutes} minutes today`
	);
	if (learnedMinutes == achievement.progressValue) {
		return { newValue: null }; // no change, already at the same value
	}

	// save smaller numbers in db as well since a new day could start with zero progress
	return { newValue: learnedMinutes };
};
