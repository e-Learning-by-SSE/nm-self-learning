import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./toast";

const meta: Meta<typeof Toast> = {
	title: "Components/Toast",
	component: Toast,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
	args: {
		type: "success",
		title: "Success!",
		subtitle: "Your changes have been saved successfully.",
		id: "success-toast"
	}
};
