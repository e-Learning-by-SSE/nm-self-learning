import { parseTestCases } from "./evaluate";

describe("parseTestCases", () => {
	it("Single test case", () => {
		const stdout = `### TEST
1 + 1
### EXPECTED
2
### ACTUAL
2`;
		const result = parseTestCases(stdout);
		expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "actual": Array [
		      "2",
		    ],
		    "expected": Array [
		      "2",
		    ],
		    "title": "1 + 1",
		    "verdict": true,
		  },
		]
	`);
	});

	it("Two test cases", () => {
		const stdout = `### TEST
First
### EXPECTED
1
### ACTUAL
1
### TEST
Second
### EXPECTED
2
### ACTUAL
2`;
		const result = parseTestCases(stdout);
		expect(result).toHaveLength(2);
		expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "actual": Array [
		      "1",
		    ],
		    "expected": Array [
		      "1",
		    ],
		    "title": "First",
		    "verdict": true,
		  },
		  Object {
		    "actual": Array [
		      "2",
		    ],
		    "expected": Array [
		      "2",
		    ],
		    "title": "Second",
		    "verdict": true,
		  },
		]
	`);
	});

	it("Order of ACTUAL and EXPECTED does not matter", () => {
		const stdout = `### TEST
First
### EXPECTED
1
### ACTUAL
2
### TEST
Second
### ACTUAL
3
### EXPECTED
4`;
		const result = parseTestCases(stdout);
		expect(result).toHaveLength(2);

		const [first, second] = result;
		expect(first.expected).toEqual(["1"]);
		expect(first.actual).toEqual(["2"]);
		expect(second.actual).toEqual(["3"]);
		expect(second.expected).toEqual(["4"]);
	});

	it("Multiple lines output", () => {
		const stdout = `### TEST
test
### EXPECTED
a
b
c
### ACTUAL
d
e
f`;
		const result = parseTestCases(stdout);
		const [test] = result;

		expect(test.expected).toEqual(["a", "b", "c"]);
		expect(test.actual).toEqual(["d", "e", "f"]);
	});

	it("No output", () => {
		const stdout = `### TEST
First
### EXPECTED
1
### ACTUAL
### TEST
Second
### ACTUAL
3
### EXPECTED
4`;
		const result = parseTestCases(stdout);
		const [first] = result;

		expect(first.actual).toEqual([]);
		expect(result).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "actual": Array [],
		    "expected": Array [
		      "1",
		    ],
		    "title": "First",
		    "verdict": false,
		  },
		  Object {
		    "actual": Array [
		      "3",
		    ],
		    "expected": Array [
		      "4",
		    ],
		    "title": "Second",
		    "verdict": false,
		  },
		]
	`);
	});

	it("Blank lines", () => {
		const stdout = `### TEST
### EXPECTED
### ACTUAL`;
		const result = parseTestCases(stdout);
		const [test] = result;

		expect(test.title).toEqual("");
		expect(test.actual).toEqual([]);
		expect(test.expected).toEqual([]);
	});
});
