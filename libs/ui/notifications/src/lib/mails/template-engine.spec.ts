import { renderTemplate } from "./template-engine";

describe("renderTemplate", () => {
	it("renders the 'streak-reminder' template with all variables", () => {
		const variables = {
			userName: "Max",
			currentStreak: 5,
			loginUrl: "https://example.com/login"
		};

		const result = renderTemplate("streakReminder", variables);

		expect(result.subject).toBe("Dein 5-Tage Lernstreak ist in Gefahr! 🔥");
		expect(result.html).toContain("🔥 Nicht aufgeben, Max!");
		expect(result.html).toContain("<strong>5-Tage Lernstreak</strong>");
		expect(result.html).toContain('href="https://example.com/login"');
		expect(result.html).toContain("Jetzt einloggen");
		expect(result.text).toBeUndefined();
	});

	it("leaves placeholders unchanged if variables are missing", () => {
		const variables = {
			userName: "Anna"
			// currentStreak and loginUrl missing
		};

		const result = renderTemplate("streakReminder", variables);

		expect(result.subject).toBe("Dein {{currentStreak}}-Tage Lernstreak ist in Gefahr! 🔥");
		expect(result.html).toContain("Anna");
		expect(result.html).toContain("<strong>{{currentStreak}}-Tage Lernstreak</strong>");
		expect(result.html).toContain('href="{{loginUrl}}"');
	});

	it("ignores extra variables not used in the template", () => {
		const variables = {
			userName: "Lisa",
			currentStreak: 3,
			loginUrl: "https://example.com/login",
			extra: "should be ignored"
		};

		const result = renderTemplate("streakReminder", variables);

		expect(result.subject).toBe("Dein 3-Tage Lernstreak ist in Gefahr! 🔥");
		expect(result.html).toContain("Nicht aufgeben, Lisa!");
		expect(result.html).not.toContain("extra");
	});
});
