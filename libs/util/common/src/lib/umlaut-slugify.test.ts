import { slugify } from "./umlaut-slugify";

describe("umlautSlugify", () => {
	it("should replace umlauts with their corresponding ASCII characters", () => {
		const text = "Möbelstück über Äpfel und Öfen";
		const expected = "Moebelstueck-ueber-Aepfel-und-Oefen";
		const result = slugify(text);
		expect(result).toEqual(expected);
	});

	it("should handle lowercase and uppercase umlauts", () => {
		const text = "Äpfel und Öfen ÜBER ÄPFEL UND ÖFEN";
		const expected = "Aepfel-und-Oefen-UEBER-AEPFEL-UND-OEFEN";
		const result = slugify(text);
		expect(result).toEqual(expected);
	});

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
});
