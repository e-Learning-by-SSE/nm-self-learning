/**
 * Erzeugt eine Matcher-Funktion, die prüft, ob ein Objekt alle Schlüssel-Wert-Paare
 * eines gegebenen Partial-Objekts enthält (shallow comparison).
 *
 * Nützlich für Array-Methoden wie `.some()` oder `.find()`, um nach Objekten mit
 * bestimmten Eigenschaften zu suchen.
 *
 * @example
 * const hasEmail = matches({ channel: "email", enabled: true });
 * array.some(hasEmail);
 *
 * // Bei optionalen oder undefined-Feldern sollte der Typ explizit angegeben werden:
 * matches<UserNotificationSetting>({ channel: "email", type, enabled: true });
 *
 * @param partial Ein Teilobjekt, dessen Schlüssel-Wert-Paare geprüft werden sollen.
 * @returns Eine Funktion, die ein Objekt entgegennimmt und `true` zurückgibt,
 *          wenn es alle Eigenschaften des Partial-Objekts exakt enthält.
 */
export function matches<T>(partial: Partial<T>) {
	return (obj: T): boolean =>
		(Object.entries(partial) as [keyof T, unknown][]).every(
			([key, value]) => obj[key] === value
		);
}
