import { act, renderHook } from "@testing-library/react";
import { readFileSync } from "fs";
import { createInstance } from "i18next";
import { resolve } from "path";
import { I18nextProvider } from "react-i18next";
import { useTimeIntervalFormatter } from "./use-time-interval-formatter";

// Exercise language changes with the real provider instead of the shared translation mock.
jest.unmock("react-i18next");

it("formats in the provider's language and updates after a language change", async () => {
	const i18n = createInstance();
	const localesPath = resolve(__dirname, "../../../../../../apps/site/public/locales");
	await i18n.init({
		lng: "en",
		fallbackLng: "de",
		defaultNS: "common",
		interpolation: { escapeValue: false },
		resources: {
			de: {
				common: JSON.parse(readFileSync(resolve(localesPath, "de/common.json"), "utf8"))
			},
			en: { common: JSON.parse(readFileSync(resolve(localesPath, "en/common.json"), "utf8")) }
		}
	});

	const { result } = renderHook(() => useTimeIntervalFormatter(), {
		wrapper: ({ children }) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
	});

	expect(result.current(90060000)).toBe("1 day, 1 hour, and 1 minute");
	await act(async () => {
		await i18n.changeLanguage("de");
	});
	expect(result.current(90060000)).toBe("1 Tag, 1 Stunde und 1 Minute");
});
