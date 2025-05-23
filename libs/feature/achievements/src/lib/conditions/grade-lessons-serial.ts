import { database } from "@self-learning/database";
import { ConditionChecker } from "../achievement-registry";

export const checkGradeLessonSerial: ConditionChecker = async (achievement, username, _context) => {
	return {
		type: "unchanged"
	};
};
