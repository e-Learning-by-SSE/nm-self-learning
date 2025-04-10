import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { DropdownButton } from "./dropdown-button";

// ✅ Meta setup
const meta: Meta<typeof DropdownButton> = {
	title: "Common/DropdownButton",
	component: DropdownButton,
	tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof DropdownButton>;

// ✅ Base style classes
const baseBg = "bg-emerald-500 text-white rounded px-4 py-2";
const baseHover = "hover:bg-emerald-600";

// ✅ Story 1: Default dropdown
export const Default: Story = {
	render: () => (
		<DropdownButton title="Dropdown" backgroundColor={baseBg} hover={baseHover}>
			<span className="ml-2">Options</span>
			<div className="bg-white p-2 shadow">
				<button className="block w-full text-left hover:bg-gray-100 p-2">Option 1</button>
				<button className="block w-full text-left hover:bg-gray-100 p-2">Option 2</button>
			</div>
		</DropdownButton>
	)
};

// ✅ Story 2: Dropdown from top
export const DropUp: Story = {
	render: () => (
		<DropdownButton
			title="Dropdown"
			backgroundColor="bg-blue-500 text-white rounded px-4 py-2"
			hover="hover:bg-blue-600"
			position="top"
		>
			<span className="ml-2">Drop Up</span>
			<div className="bg-white p-2 shadow">
				<button className="block w-full text-left hover:bg-gray-100 p-2">
					Top Option 1
				</button>
				<button className="block w-full text-left hover:bg-gray-100 p-2">
					Top Option 2
				</button>
			</div>
		</DropdownButton>
	)
};

// ✅ Story 3: Custom chevron color
export const WithCustomChevron: Story = {
	render: () => (
		<DropdownButton
			title="Dropdown"
			backgroundColor="bg-gray-800 text-white rounded px-4 py-2"
			hover="hover:bg-gray-700"
			chevronColor="text-yellow-400"
		>
			<span className="ml-2">Custom Chevron</span>
			<div className="bg-white p-2 shadow">
				<button className="block w-full text-left hover:bg-gray-100 p-2">Alpha</button>
				<button className="block w-full text-left hover:bg-gray-100 p-2">Beta</button>
			</div>
		</DropdownButton>
	)
};
