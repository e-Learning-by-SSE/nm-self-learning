import i18next from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18next
	.use(Backend)
	.use(LanguageDetector)
	.init({
		fallbackLng: "en",
		supportedLngs: ["en", "de"],
		ns: ["common"],
		defaultNS: "common",
		interpolation: { escapeValue: false },
		backend: {
			loadPath: "/i18next/{{lng}}/{{ns}}.json"
		}
	});

export default i18next;
