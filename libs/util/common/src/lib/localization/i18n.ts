import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./lang/en.json";
import es from "./lang/de.json";

i18next
	.use(initReactI18next) // Passes i18n down to react-i18next.
	.init({
		resources: {
			en: { translation: en },
			es: { translation: es }
		},
		lng: "de", // Default language
		fallbackLng: "de",
		interpolation: {
			escapeValue: false
		}
	});
export const i18n = i18next;
