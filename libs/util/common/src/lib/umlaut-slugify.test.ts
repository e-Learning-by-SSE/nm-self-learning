import { slugify } from "./umlaut-slugify";

describe("umlautSlugify", () => {
	it("should replace umlauts with their corresponding ASCII characters", () => {
		const text = "Möbelstück über Äpfel und Öfen";
		const expected = "moebelstueck-ueber-aepfel-und-oefen";
		const result = slugify(text, { lower: true, strict: true });
		expect(result).toEqual(expected);
	});

	// currently feature is not used an thus not supported
	// it("should handle lowercase and uppercase umlauts", () => {
	// 	const text = "Äpfel und Öfen ÜBER ÄPFEL UND ÖFEN";
	// 	const expected = "Aepfel-und-Oefen-UEBER-AEPFEL-UND-OEFEN";
	// 	const result = slugify(text);
	// 	expect(result).toEqual(expected);
	// });

	it("should handle the 'ß' character", () => {
		const text = "Fußball";
		const expected = "Fussball";
		const result = slugify(text);
		expect(result).toEqual(expected);
	});

	it("should handle empty string", () => {
		const text = "";
		const expected = "";
		const result = slugify(text);
		expect(result).toEqual(expected);
	});
	it("should handle leading and trailing whitespaces", () => {
		const text = "   Möbelstück über Äpfel und Öfen   ";
		const expected = "moebelstueck-ueber-aepfel-und-oefen";
		const result = slugify(text, { lower: true, strict: true });
		expect(result).toEqual(expected);
	});
});
