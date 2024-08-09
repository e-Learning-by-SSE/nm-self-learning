import { localStorageApi } from "./local-storage-api";

describe("localStorageApi", () => {
	it("should work", () => {
		expect(localStorageApi()).toEqual("local-storage-api");
	});
});
