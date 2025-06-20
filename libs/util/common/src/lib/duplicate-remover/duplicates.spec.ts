import { IdSet } from "./duplicates";
import "@testing-library/jest-dom";

describe("IdSet", () => {
	it("should return the correct element when using the get method", () => {
		const idSet = new IdSet([{ id: "1" }, { id: 2 }]);

		// Test getting an element by object
		const element1 = idSet.get({ id: "1" });
		expect(element1).toEqual({ id: "1" });

		// Test getting an element by id
		const element2 = idSet.get(2);
		expect(element2).toEqual({ id: 2 });

		// Test getting a non-existent element
		const nonExistent = idSet.get("3");
		expect(nonExistent).toBeUndefined();
	});

	it("should return all elements when using the entries method", () => {
		const idSet = new IdSet([{ id: "1" }, { id: 2 }]);

		const entries = idSet.entries();
		expect(entries).toEqual([{ id: "1" }, { id: 2 }]);
	});

	it("should clear the set when using the clear method", () => {
		const idSet = new IdSet([{ id: "1" }, { id: 2 }]);

		idSet.clear();
		expect(idSet.entries()).toEqual([]);
	});

	it("should initialize with an array of items", () => {
		const initialArray = [{ id: 1 }, { id: 2 }, { id: 3 }];
		const idSet = new IdSet(initialArray);

		expect(idSet.size).toBe(3);
		expect(idSet.has({ id: 1 })).toBe(true);
		expect(idSet.has({ id: 2 })).toBe(true);
		expect(idSet.has({ id: 3 })).toBe(true);
	});

	it("should initialize with a Set of items", () => {
		const initialSet = new Set([{ id: 1 }, { id: 2 }, { id: 3 }]);
		const idSet = new IdSet(initialSet);

		expect(idSet.size).toBe(3);
		expect(idSet.has({ id: 1 })).toBe(true);
		expect(idSet.has({ id: 2 })).toBe(true);
		expect(idSet.has({ id: 3 })).toBe(true);
	});

	it("should initialize with another IdSet", () => {
		const initialIdSet = new IdSet([{ id: 1 }, { id: 2 }, { id: 3 }]);
		const idSet = new IdSet(initialIdSet);

		expect(idSet.size).toBe(3);
		expect(idSet.has({ id: 1 })).toBe(true);
		expect(idSet.has({ id: 2 })).toBe(true);
		expect(idSet.has({ id: 3 })).toBe(true);
	});

	it("should initialize as empty when no initial values are provided", () => {
		const idSet = new IdSet();

		expect(idSet.size).toBe(0);
	});

	// it("should create a deep copy of the items when initialized with an array", () => {
	// 	const initialArray = [{ id: 1 }, { id: 2 }];
	// 	const idSet = new IdSet(initialArray);

	// 	// Modify the original array
	// 	initialArray[0].id = 99;

	// 	// Ensure the IdSet does not reflect the changes
	// 	const entries = idSet.entries();
	// 	expect(entries).toEqual([{ id: 1 }, { id: 2 }]);
	// });
});
