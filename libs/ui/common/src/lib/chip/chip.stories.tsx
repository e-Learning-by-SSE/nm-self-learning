import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./chip";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Chip> = {
	title: "Components/Chip",
	component: Chip,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"],
	argTypes: {
		onRemove: { action: "removed" },
		displayImage: { control: "boolean" },
		imgUrl: { control: "text" },
		children: { control: "text" }
	}
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
	args: {
		children: "Default Chip",
		displayImage: false,
		onRemove: action("chip removed")
	}
};

export const WithImage: Story = {
	args: {
		children: "Chip with Image",
		displayImage: true,
		imgUrl: "https://picsum.photos/200",
		onRemove: action("chip removed")
	}
};

export const WithoutRemoveButton: Story = {
	args: {
		children: "Chip without Remove Button",
		displayImage: false,
		onRemove: undefined
	}
};

export const WithImageWithoutRemoveButton: Story = {
	args: {
		children: "Chip with Image, no Remove Button",
		displayImage: true,
		imgUrl: "https://picsum.photos/200",
		onRemove: undefined
	}
};

export const WithPlaceholder: Story = {
	args: {
		children: "Chip with Placeholder Image",
		displayImage: true,
		imgUrl: null,
		onRemove: action("chip removed")
	}
};

export const WithComplexContent: Story = {
	args: {
		displayImage: true,
		imgUrl: "https://picsum.photos/200",
		onRemove: action("chip removed"),
		children: (
			<>
				<span className="font-medium">Primary Text</span>
				<span className="text-gray-500 text-xs">Secondary Text</span>
			</>
		)
	}
};
