import { LearningActivity, LearningSequence } from "@self-learning/types";

export interface LocalStorageKeyTypeMap {
	["la_sequence"]: LearningSequence;
	["la_activity"]: LearningActivity;
}

export type LocalStorageKeys = keyof LocalStorageKeyTypeMap;
