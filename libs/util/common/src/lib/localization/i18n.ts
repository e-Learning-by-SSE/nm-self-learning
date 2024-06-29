import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./lang/en.json";
import de from "./lang/de.json";

i18next
	.use(initReactI18next) // Passes i18n down to react-i18next.
	.use(LanguageDetector)
	.init({
		resources: {
			en: { translation: en },
			de: { translation: de }
		},
		lng: "de", // Default language
		fallbackLng: "de",
		preload: ["de", "en"],
		interpolation: {
			escapeValue: false
		}
	});
export const i18n = i18next;
