import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { PrimaryButton, StrokedButton, RedButton, GreyBoarderButton, IconButton } from "./button";
import { PencilIcon } from "@heroicons/react/24/solid"; // example icon, make sure lucide-react is installed

const meta: Meta = {
	title: "Common/Buttons",
	tags: ["autodocs"]
};

export default meta;

// 👇 Create a section for each variant

export const Primary: StoryObj = {
	render: () => <PrimaryButton>Primary</PrimaryButton>
};

export const Stroked: StoryObj = {
	render: () => <StrokedButton>Stroked</StrokedButton>
};

export const Red: StoryObj = {
	render: () => <RedButton label="Delete" onClick={() => alert("Deleted!")} className="" />
};

export const GreyBorder: StoryObj = {
	render: () => <GreyBoarderButton>Grey Border</GreyBoarderButton>
};

export const WithIcon: StoryObj = {
	render: () => (
		<IconButton
			icon={<PencilIcon className="h-4 w-4" />}
			text="Edit"
			onClick={() => alert("Edit clicked")}
		/>
	)
};
