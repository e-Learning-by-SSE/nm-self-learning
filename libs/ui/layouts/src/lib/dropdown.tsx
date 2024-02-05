import React, { useEffect, useState } from "react";

type DropDownProps = {
	langs: string[][];
	showDropDown: boolean;
	toggleDropDown: () => void; // Funktion ohne Parameter und ohne Rückgabewert
	langSelection: (lang: string) => void; // Funktion mit einem string-Parameter und ohne Rückgabewert
};

const DropDown: React.FC<DropDownProps> = ({
	langs,
	langSelection
}: DropDownProps): JSX.Element => {
	const [showDropDown, setShowDropDown] = useState<boolean>(false);

	/**
	 * Handle passing the language
	 * back to the parent component
	 *
	 * @param lang  The selected language
	 */
	const onClickHandler = (lang: string): void => {
		langSelection(lang);
	};

	useEffect(() => {
		setShowDropDown(showDropDown);
	}, [showDropDown]);

	return (
		<div
			style={{
				position: "absolute",
				bottom: "23px",
				minWidth: "105px",
				zIndex: "10"
			}}
			className={showDropDown ? "" : "border border-gray-300"}
		>
			{langs[0].map((lang: string, index: number): JSX.Element => {
				return (
					<div
						style={{
							alignItems: "center",
							display: "flex"
						}}
						className={"bg-white hover:bg-green-400  hover:text-white"}
						key={index}
						onClick={(): void => {
							onClickHandler(lang);
						}}
					>
						<img src="&#127465" alt="pic" width={30} height={30}></img>
						<div style={{ minWidth: "70px" }}>
							<p className="text-center">{lang}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default DropDown;
