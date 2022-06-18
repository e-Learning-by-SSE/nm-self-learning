import { matchKey, transformFormData } from "./form-utils";

describe("Form Utils", () => {
	describe("matchKey", () => {
		test.each([
			["people[0][name]", { key: "people", index: 0, property: "name" }],
			["people[1][name]", { key: "people", index: 1, property: "name" }],
			["r[2][d2]", { key: "r", index: 2, property: "d2" }],
			["items[2]", null],
			["[0][name]", null]
		])("%s", (input, expected) => {
			expect(matchKey(input)).toEqual(expected);
		});
	});

	describe("transformFormData", () => {
		it("Empty object -> {}", () => {
			const input = {};
			const result = transformFormData(input);
			expect(result).toEqual({});
		});

		it("No transformation needed -> No Changes", () => {
			const input = {
				name: "Max Mustermann",
				age: "42"
			};
			const result = transformFormData(input);
			expect(result).toEqual(input);
		});

		it("One list key -> Adds list with one item", () => {
			const input = {
				name: "Max Mustermann",
				age: "42",
				"people[0][country]": "Germany"
			};
			const result = transformFormData(input);
			expect(result).toEqual({
				name: input.name,
				age: input.age,
				people: [
					{
						country: "Germany"
					}
				]
			});
		});

		it("Multiple keys of one list -> Adds all items to correct key", () => {
			const input = {
				"characters[0][lowerCase]": "a",
				"characters[0][upperCase]": "A",
				"characters[1][lowerCase]": "b",
				"characters[1][upperCase]": "B"
			};
			const result = transformFormData(input);
			expect(result).toEqual({
				characters: [
					{ lowerCase: "a", upperCase: "A" },
					{ lowerCase: "b", upperCase: "B" }
				]
			});
		});

		it("Multiple keys with different lists -> Adds all items to correct key", () => {
			const input = {
				"characters[0][lowerCase]": "a",
				"characters[0][upperCase]": "A",
				"people[0][name]": "Max",
				"people[0][age]": "42",
				"characters[1][lowerCase]": "b",
				"characters[1][upperCase]": "B"
			};
			const result = transformFormData(input);
			expect(result).toEqual({
				characters: [
					{ lowerCase: "a", upperCase: "A" },
					{ lowerCase: "b", upperCase: "B" }
				],
				people: [
					{
						name: "Max",
						age: "42"
					}
				]
			});
		});
	});
});
