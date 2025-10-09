import { insertPlaceholder, parseCloze } from "./cloze-parser";

describe("Cloze Parser", () => {
	describe("parseCloze", () => {
		it("One sentence", () => {
			const gaps = parseCloze("Text before {C: [#a, b]} Text after");
			expect(gaps).toHaveLength(1);
			expect(gaps).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "endIndex": 23,
			    "startIndex": 12,
			    "type": "C",
			    "values": Array [
			      Object {
			        "isCorrect": false,
			        "text": "a",
			      },
			      Object {
			        "isCorrect": true,
			        "text": "b",
			      },
			    ],
			  },
			]
		`);
		});

		it("Two sentences", () => {
			const gaps = parseCloze(
				"This is the {C: [#a, b]} first sentence. This is the {C: [c, #d]} second sentence."
			);
			expect(gaps).toHaveLength(2);
		});

		it("Two lines", () => {
			const gaps = parseCloze(
				"This is the {C: [#a, b]} first sentence.\nThis is the {C: [c, #d]} second sentence."
			);
			// Is the same as inline snapshot above only exported as a file
			expect(gaps).toMatchSnapshot();
		});

		it("Two lines but with whitespace in the first", () => {
			const gaps = parseCloze("  \n This is the {C: [c, #d]} second sentence.");
			// Is the same as inline snapshot above only exported as a file
			expect(gaps).toMatchSnapshot();
		});

		it("should handle latex correctly", () => {
			const text = "{T: [$$latex1$$, #$$latex2$$]}";
			const result = parseCloze(text);
			// Is the same as inline snapshot above only exported as a file
			expect(result).toMatchSnapshot();
		});

		it("should handle dashes in answer options correctly", () => {
			const text = "{C: [#a-b, c-d]}";
			const gaps = parseCloze(text);
			expect(gaps).toHaveLength(1);
		});
	});

	describe("insertPlaceholder", () => {
		it("{C: [#a, b]} -> {GAP}", () => {
			const text = "{C: [#a, b]}";
			const result = insertPlaceholder(text, parseCloze(text));
			expect(result).toEqual("{GAP}");
		});

		it("Before {C: [#a, b]} -> Before {GAP}", () => {
			const text = "ABC {C: [#a, b]}";
			const result = insertPlaceholder(text, parseCloze(text));
			expect(result).toMatchInlineSnapshot(`"ABC {GAP}"`);
		});

		it("{C: [#a, b]} After -> {GAP} After", () => {
			const text = "ABC {C: [#a, b]}";
			const result = insertPlaceholder(text, parseCloze(text));
			expect(result).toMatchInlineSnapshot(`"ABC {GAP}"`);
		});

		it("Front {C: [#a, b]} Middle {C: [#a, b]} Back -> Front {GAP} Middle {GAP} Back", () => {
			const text = "Front {C: [#a, b]} Middle {C: [#a, b]} Back";
			const result = insertPlaceholder(text, parseCloze(text));
			expect(result).toMatchInlineSnapshot(`"Front {GAP} Middle {GAP} Back"`);
		});
	});
});
