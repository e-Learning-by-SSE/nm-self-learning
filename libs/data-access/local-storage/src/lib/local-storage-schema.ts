// for build optimization, this should import from @self-learning/types and not from feature libraries

export interface LocalStorageKeyTypeMap {
	["test_key"]: Date | { test: string } | number | { objDate: Date };
	["settings_firstLoginDialog_lastRendered"]: Date;
}

export type LocalStorageKeys = keyof LocalStorageKeyTypeMap;
