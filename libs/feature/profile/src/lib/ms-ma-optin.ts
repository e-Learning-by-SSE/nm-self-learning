/**
 * Designated for use in the MS-MA project
 */
export function useGamificationOptIn() {
	return isGamificationOptInEnabled();
}

export function isGamificationOptInEnabled() {
	// TODO
	return process.env.NODE_ENV === "development"; // || process.env.NODE_ENV === "test";
}
