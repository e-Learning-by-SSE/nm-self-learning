import { TextEncoder, TextDecoder } from "web-encoding";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock("next-i18next", () => {
	const diary = jest.requireActual<Record<string, string>>(
		"../../../apps/site/public/locales/de/feature-diary.json"
	);
	const common = jest.requireActual<Record<string, string>>(
		"../../../apps/site/public/locales/de/common.json"
	);
	return {
		useTranslation: (namespace: string) => ({
			t: (key: string, values?: Record<string, string>) => {
				const [resourceNamespace, resourceKey] = key.includes(":")
					? key.split(":")
					: [namespace, key];
				const resource = resourceNamespace === "common" ? common : diary;
				const value: string = resource[resourceKey] ?? key;
				return value.replace(/{{(\w+)}}/g, (_, name: string) => values?.[name] ?? "");
			},
			i18n: { language: "de" }
		}),
		Trans: ({ i18nKey }: { i18nKey: string }) => diary[i18nKey]
	};
});
