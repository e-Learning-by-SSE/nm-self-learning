import { render, screen } from "@testing-library/react";
import { OnlineHelpLink } from "./online-help-link";

let language = "en";
jest.mock("next-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key, i18n: { language } })
}));

describe("OnlineHelpLink", () => {
	beforeEach(() => {
		language = "en";
	});

	it("normalizes the locale and URL, and responds to new configuration", () => {
		language = "DE-DE";
		const { rerender } = render(
			<OnlineHelpLink
				baseUrl="https://help.example///"
				languages=" en, DE "
				relativePath="/course#intro"
			/>
		);
		expect(screen.getByTestId("online-help-link").getAttribute("href")).toBe(
			"https://help.example/de/course#intro"
		);
		rerender(
			<OnlineHelpLink
				baseUrl="https://other.example"
				languages="fr,en"
				relativePath="course"
			/>
		);
		expect(screen.getByTestId("online-help-link").getAttribute("href")).toBe(
			"https://other.example/fr/course"
		);
	});

	it("uses default languages and falls back for an unsupported locale", () => {
		language = "fr";
		render(
			<OnlineHelpLink baseUrl="https://help.example" languages={null} relativePath="course" />
		);
		expect(screen.getByTestId("online-help-link").getAttribute("href")).toBe(
			"https://help.example/en/course"
		);
	});

	it("uses de when the configured language list contains no locales", () => {
		render(
			<OnlineHelpLink baseUrl="https://help.example" languages=" , " relativePath="course" />
		);
		expect(screen.getByTestId("online-help-link").getAttribute("href")).toBe(
			"https://help.example/de/course"
		);
	});

	it.each([
		{ baseUrl: null, relativePath: "course" },
		{ baseUrl: "https://help.example", relativePath: "" },
		{ baseUrl: "https://help.example", relativePath: "///" }
	])("hides the link when its URL is incomplete", ({ baseUrl, relativePath }) => {
		render(<OnlineHelpLink baseUrl={baseUrl} languages={null} relativePath={relativePath} />);
		expect(screen.queryByTestId("online-help-link")).toBeNull();
	});
});
