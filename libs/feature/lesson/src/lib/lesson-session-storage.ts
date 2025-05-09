const getDialogSeenKey = (lessonId: string) => `selfRegulatedSeen-${lessonId}`;

export function hasAnsweredSelfRegulated(lessonId: string) {
	return sessionStorage.getItem(getDialogSeenKey(lessonId)) === "true";
}

export function markSelfRegulatedAnswered(lessonId: string) {
	sessionStorage.setItem(getDialogSeenKey(lessonId), "true");
}

export function clearSelfRegulatedAnswered(lessonId: string) {
	sessionStorage.removeItem(getDialogSeenKey(lessonId));
}
