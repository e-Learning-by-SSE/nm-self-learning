// for build optimization, this should import from @self-learning/types and not from feature libraries

import { LessonContent } from "@self-learning/types";

export interface LocalStorageKeyTypeMap {
	// Data for testing. Should not be set in production
	["test_key"]: Date | { test: string } | number | { objDate: Date };

	// LearningDiary preference for compact view inside the page viewer
	["ltb_pageViewer_compactPreference"]: boolean;

	// Preference Setting: What media type is shown as default when open a lesson
	["user_preferredMediaType"]: LessonContent[number]["type"];

	// Preference Setting: Should the sidebar* be hidden. *Sidebar is a layout component, eg. the playlist area in lessons
	["user_hideSidebar"]: boolean;
}

export type LocalStorageKeys = keyof LocalStorageKeyTypeMap;
