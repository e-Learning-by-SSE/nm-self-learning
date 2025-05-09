import SuperJSON from "superjson";
import { LocalStorageKeys, LocalStorageKeyTypeMap } from "./local-storage-schema";

export function loadFromLocalStorage<K extends keyof LocalStorageKeyTypeMap>(
	key: K
): LocalStorageKeyTypeMap[K] | null {
	if (typeof window === "undefined") return null;

	const rawData = window?.localStorage.getItem(key);
	if (rawData) {
		return SuperJSON.parse<LocalStorageKeyTypeMap[K]>(rawData);
	}
	return null;
}

export function saveToLocalStorage<K extends LocalStorageKeys>(
	key: K,
	data: LocalStorageKeyTypeMap[K]
): void {
	window.localStorage.setItem(key, SuperJSON.stringify(data));
}

export async function removeFromLocalStorage<K extends LocalStorageKeys>(key: K) {
	window?.localStorage.removeItem(key);
}
