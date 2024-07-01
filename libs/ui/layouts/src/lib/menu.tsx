import React, { useState } from "react";
import DropDown from "./dropdown";
import { i18n } from "@self-learning/util/common";
import { useEffect } from "react";

const langList = [
	["Deutsch", "English"],
	["de", "en"],
	["\u{1F1E9}\u{1F1EA}", "\u{1F1EC}\u{1F1E7}"]
];
const getLangEquivalent = (lang: string) => {
	if (langList[0].includes(lang)) {
		const shortLangIndex = langList[0].indexOf(lang);
		return langList[1][shortLangIndex];
	} else {
		const longLangIndex = langList[1].indexOf(lang);
		return langList[0][longLangIndex];
	}
};
const LangMenu: React.FC = (): JSX.Element => {
	const [showDropDown, setShowDropDown] = useState<boolean>(false);
	const [selectLang, setSelectLang] = useState<string>("");
	const langs = () => {
		return langList;
	};

	/**
	 * Toggle the drop down menu
	 */
	const toggleDropDown = () => {
		setShowDropDown(!showDropDown);
	};

	/**
	 * Hide the drop down menu if click occurs
	 * outside of the drop-down element.
	 *
	 * @param event  The mouse event
	 */
	const dismissHandler = (event: React.FocusEvent<HTMLButtonElement>): void => {
		if (event.currentTarget === event.target) {
			setShowDropDown(false);
		}
	};

	/**
	 * Callback function to consume the
	 * language from the child component
	 *
	 * @param lang  The selected language
	 */
	const langSelection = (lang: string): void => {
		setSelectLang(lang);
		Changer(lang);
	};
	useEffect(() => {
		const localLang = localStorage.getItem("lang");
		if (localLang == null) {
			i18n.changeLanguage("en");
		} else {
			i18n.changeLanguage(localLang);
			setSelectLang(getLangEquivalent(localLang));
		}
	}, []);

	return (
		<button
			onClick={(): void => toggleDropDown()}
			onBlur={(e: React.FocusEvent<HTMLButtonElement>): void => dismissHandler(e)}
		>
			<p className={showDropDown ? "text-secondary" : "hover:text-secondary"}>
				{selectLang ? selectLang : "English"}
			</p>
			{showDropDown && (
				<DropDown
					langs={langs()}
					showDropDown={false}
					toggleDropDown={(): void => toggleDropDown()}
					langSelection={langSelection}
				/>
			)}
		</button>
	);
};

export default LangMenu;

function Changer(lang: string) {
	lang = getLangEquivalent(lang);
	i18n.changeLanguage(lang);
	localStorage.setItem("lang", lang);
}
