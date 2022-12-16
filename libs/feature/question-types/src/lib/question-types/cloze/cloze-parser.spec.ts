import { insertPlaceholder, parseCloze, parseNextGap } from "./cloze-parser";

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
	});

	describe("parseNextGap", () => {
		it.each([
			["{C: [#a, b]}"],
			["{C: [a, #b]}"],
			["{C: [a]}"],
			["{T: [Gap]}"],
			["{T: [Eins, Zwei]}"],
			["{T: [Word with spaces]}"]
		])("%s", text => {
			const gap = parseNextGap(text);
			expect(gap).not.toBeNull();
		});

		it("With text before", () => {
			const gap = parseNextGap("Text before {C: [#a, b]}");
			expect(gap).not.toBeNull();
		});

		it("With text after", () => {
			const gap = parseNextGap("{C: [#a, b]} Text after");
			expect(gap).not.toBeNull();
		});

		it("With surrounding text", () => {
			const gap = parseNextGap("Text before {C: [#a, b]} Text after");
			expect(gap).not.toBeNull();
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
