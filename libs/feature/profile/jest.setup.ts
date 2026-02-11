import { TextEncoder, TextDecoder } from "web-encoding";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Avoid warning:
// react-i18next:: useTranslation: You will need to pass in an i18next instance by using initReactI18next { code: 'NO_I18NEXT_INSTANCE' }
jest.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "en", changeLanguage: async () => {} }
	}),
	Trans: ({ i18nKey }: any) => i18nKey,
	I18nextProvider: ({ children }: any) => children,
	initReactI18next: { type: "3rdParty", init: () => {} }
}));
