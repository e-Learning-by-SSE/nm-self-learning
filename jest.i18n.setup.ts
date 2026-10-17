// Keep component tests independent of translation resources and avoid the
// react-i18next warning when no i18next instance is configured.
jest.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "en", changeLanguage: async () => {} }
	}),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Trans: ({ i18nKey }: any) => i18nKey,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	I18nextProvider: ({ children }: any) => children,
	initReactI18next: { type: "3rdParty", init: () => {} }
}));
