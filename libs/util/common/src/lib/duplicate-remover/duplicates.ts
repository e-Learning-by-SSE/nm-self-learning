// copied from nm-skill-lib version 0.2.0
// should be removed as soon as the lib is updated
// TODO spark-sse

type IdElement = { id: string | number };

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
 * @author Marcel Spark
 */
export class IdSet<T extends IdElement> {
	private items: Record<string, T>;

	constructor(initialValues: T[] = []) {
		this.items = {};
		initialValues.forEach(item => this.add(item));
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
	 * Deletes an element and returns *true* if the element was deleted or *false* if it was not in the set.
	 * @param item The element to delete.
	 * @returns *true* if the element was deleted, *false* if it was not in the set.
	 */
	delete(item: T): boolean {
		const key = item.id.toString();
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
		return Object.keys(this.items).length;
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
