import { renderTemplate } from "./template-engine";

describe("renderTemplate", () => {
	it("renders the 'streakReminderFirst' template with all variables", () => {
		const variables = {
			userName: "Max",
			currentStreak: 5,
			loginUrl: "https://example.com/login"
		};

		const result = renderTemplate("streakReminderFirst", variables);

		expect(result.subject).toBe("Lerne heute um deine 5-Tage Lernstreak zu erhalten! 🔥");
		expect(result.html).toContain("Hallo Max,");
		expect(result.html).toContain("<strong>5 Tage</strong>");
		expect(result.html).toContain('href="https://example.com/login"');
		expect(result.html).toContain("Jetzt weiterlernen");
		expect(result.text).toBeDefined();
	});

	it("leaves placeholders unchanged if variables are missing", () => {
		const variables = {
			userName: "Anna"
			// currentStreak and loginUrl missing
		};

		const result = renderTemplate("streakReminderFirst", variables);

		expect(result.subject).toBe(
			"Lerne heute um deine {{currentStreak}}-Tage Lernstreak zu erhalten! 🔥"
		);
		expect(result.html).toContain("Anna");
		expect(result.html).toContain("<strong>{{currentStreak}} Tage</strong>");
		expect(result.html).toContain('href="{{loginUrl}}"');
	});

	it("ignores extra variables not used in the template", () => {
		const variables = {
			userName: "Lisa",
			currentStreak: 3,
			loginUrl: "https://example.com/login",
			extra: "should be ignored"
		};

		const result = renderTemplate("streakReminderFirst", variables);

		expect(result.subject).toBe("Lerne heute um deine 3-Tage Lernstreak zu erhalten! 🔥");
		expect(result.html).toContain("Hallo Lisa,");
		expect(result.html).not.toContain("extra");
	});
});
