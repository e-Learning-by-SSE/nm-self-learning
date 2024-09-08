import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SelflearnLogo } from "./logo-selflearning"; // Adjust the import path as necessary

describe("SelflearnLogo", () => {
	it("renders the SelflearnLogo component with mandatory width and height", () => {
		const width = 100;
		const height = 100;
		const altText = "Selflearn Logo";

		render(<SelflearnLogo width={width} height={height} alt={altText} />);

		const logo = screen.getByAltText(altText);
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute("width", width.toString());
		expect(logo).toHaveAttribute("height", height.toString());
	});

	it("passes other props correctly", () => {
		const width = 100;
		const height = 100;
		const className = "custom-class";

		render(<SelflearnLogo width={width} height={height} className={className} />);

		const logo = screen.getByAltText("Selflearn Logo");
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute("width", width.toString());
		expect(logo).toHaveAttribute("height", height.toString());
		expect(logo).toHaveClass(className);
	});
});
