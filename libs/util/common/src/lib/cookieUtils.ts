export function setCookie(name: string, value: string, days?: number): void {
	let expires = "";
	if (days !== undefined) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function setJsonCookie(name: string, value: unknown, days?: number): void {
	setCookie(name, JSON.stringify(value), days);
}

export function getCookie(name: string): string | null {
	const nameEQ = name + "=";
	const ca = document.cookie.split(";");

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
	}

	return null;
}

export function getJsonCookie(name: string): unknown | null {
	const cookie = getCookie(name);
	if (cookie) {
		return JSON.parse(cookie);
	}
	return null;
}
