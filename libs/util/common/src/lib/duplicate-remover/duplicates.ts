// copied from nm-skill-lib version 0.2.0
// should be removed as soon as the lib is updated
// TODO spark-sse
export type IdElement = { id: string | number };

export function duplicateRemover(initialBuffer: (string | number)[] = []) {
	const alreadyComputedSkillsBuffer = new Set<string | number>(initialBuffer);

	return function ({ id }: IdElement) {
		if (!alreadyComputedSkillsBuffer.has(id)) {
			alreadyComputedSkillsBuffer.add(id);
			return true;
		}
		return false;
	};
}

export function idGuard(element: unknown): element is IdElement {
	return (
		typeof element === "object" &&
		element !== null &&
		"id" in element &&
		(typeof (element as IdElement).id === "string" ||
			typeof (element as IdElement).id === "number")
	);
}

export function idChecker(elementA: IdElement) {
	return function (elementB: IdElement) {
		return elementA.id === elementB.id;
	};
}

export function sortById(a: IdElement, b: IdElement) {
	if (typeof a.id === "number" && typeof b.id === "number") {
		return a.id - b.id;
	}
	return String(a.id).localeCompare(String(b.id));
}

/**
 * A set that stores elements by their id and ensures that no element is stored twice.
 *
 * Can be used as a drop-in replacement for a Set or Map, but is maybe not as efficient in some manners. It's not fully compatible with the Set and Map interface, but provides a similar API.
 * @author Marcel Spark
 */

export class IdSet<T extends IdElement = IdElement> {
	private items: Record<string, T>;

	constructor(initialValues: T[] | Set<T> | IdSet<T> = []) {
		this.items = {};

		if (Array.isArray(initialValues)) {
			initialValues.forEach(item => this.add(item));
		} else if (initialValues instanceof Set) {
			initialValues.forEach(item => this.add(item));
		} else if (initialValues instanceof IdSet) {
			initialValues.forEach(item => this.add(item));
		}
	}

	/**
	 * Adds an element and returns *true* if the element was added or *false* if it was already in the set.
	 * @param item The element to add.
	 * @returns *true* if the element was added, *false* if it was already in the set.
	 */
	add(item: T): boolean {
		const key = item.id;
		if (!this.items[key]) {
			this.items[key] = item;
			return true;
		}
		return false;
	}

	/**
	 * Checks if the set contains an element with the same id.
	 * @param item The element to check.
	 * @returns *true* if the element is in the set, *false* otherwise.
	 */
	has(item: T): boolean {
		return !!this.items[item.id.toString()];
	}

	/**
	 * Returns the element with the same id or *undefined* if it is not in the set.
	 * @param item The element to get, either as an object with an id or a string id.
	 * @returns The element with the same id or *undefined* if it is not in the set.
	 */
	get(item: T): T | undefined;
	get(id: T["id"]): T | undefined;
	get(itemOrId: T | T["id"]): T | undefined {
		if (idGuard(itemOrId)) {
			return this.items[itemOrId.id];
		} else {
			return this.items[itemOrId.toString()];
		}
	}

	/**
	 * Returns all elements in the set. Keeps compatibility with the Set and Map interface.
	 * @returns All elements in the set.
	 */
	values(): T[] {
		return this.entries();
	}
	entries(): T[] {
		return Object.values(this.items);
	}

	/**
	 * Clears the set.
	 */
	clear(): void {
		this.items = {};
	}

	/**
	 * Deletes an element and returns *true* if the element was deleted or *false* if it was not in the set.
	 * @param item The element to delete.
	 * @returns *true* if the element was deleted, *false* if it was not in the set.
	 */
	delete(item: T | T["id"]): boolean {
		let key: string;
		if (idGuard(item)) {
			key = item.id.toString();
		} else {
			key = item.toString();
		}
		if (this.items[key]) {
			delete this.items[key];
			return true;
		}
		return false;
	}

	/**
	 * Returns the number of stored elements.
	 * @returns The number of stored elements.
	 */
	get size(): number {
		return Object.keys(this.items).length; //  Access time is O(n) instead of O(1) like a map
	}

	/**
	 * Returns an *iterator* to be used in *for* loops.
	 * @returns An *iterator* to be used in *for* loops.
	 */
	[Symbol.iterator](): Iterator<T> {
		const values = Object.values(this.items);
		let index = 0;
		return {
			next(): IteratorResult<T> {
				if (index < values.length) {
					return { value: values[index++], done: false };
				} else {
					return { value: null, done: true };
				}
			}
		};
	}

	/**
	 * Provides a *forEach* method to iterate over the stored elements.
	 * @param callback The function to be applied on all elements.
	 */
	forEach(callback: (item: T, index: number) => void): void {
		let index = 0;
		for (const item of this) {
			callback(item, index++);
		}
	}
}
