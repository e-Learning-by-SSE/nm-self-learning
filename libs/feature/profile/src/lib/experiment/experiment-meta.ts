import { isWithinInterval } from "date-fns";

export const EXPERIMENT_END_DATE = new Date("2025-07-15T23:59:59Z");
export const EXPERIMENT_START_DATE = new Date("2025-06-01T00:00:00Z");

export const isExperimentActive = () => {
	return isWithinInterval(new Date(), {
		start: EXPERIMENT_START_DATE,
		end: EXPERIMENT_END_DATE
	});
};
