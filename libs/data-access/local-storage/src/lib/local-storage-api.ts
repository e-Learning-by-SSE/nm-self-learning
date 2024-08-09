import { LocalStorageKeys, LocalStorageKeyTypeMap } from "./local-storage-schema";

export function loadFromLocalStorage<K extends keyof LocalStorageKeyTypeMap>(
	key: K
): LocalStorageKeyTypeMap[K] | null {
	const rawData = localStorage.getItem(key);
	if (rawData) {
		return JSON.parse(rawData) as LocalStorageKeyTypeMap[K];
	}
	return null;
}

export function saveToLocalStorage<K extends LocalStorageKeys>(
	key: K,
	data: LocalStorageKeyTypeMap[K]
): void {
	window.localStorage.setItem(key, JSON.stringify(data));
}

export async function removeFromLocalStorage<K extends LocalStorageKeys>(key: K) {
	window.localStorage.removeItem(key);
}
