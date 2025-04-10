import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ImageOrPlaceholder } from "./image-placeholder";

const meta: Meta<typeof ImageOrPlaceholder> = {
	title: "Components/ImageOrPlaceholder",
	component: ImageOrPlaceholder,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"],
	argTypes: {
		src: { control: "text" },
		alt: { control: "text" },
		className: { control: "text" },
		width: { control: "number" },
		height: { control: "number" }
	}
};

export default meta;
type Story = StoryObj<typeof ImageOrPlaceholder>;

export const WithImage: Story = {
	args: {
		src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png",
		className: "h-50 w-50 rounded-lg"
	}
};

export const WithPlaceholder: Story = {
	args: {
		src: undefined,
		className: "h-10 w-10 rounded-lg"
	}
};
