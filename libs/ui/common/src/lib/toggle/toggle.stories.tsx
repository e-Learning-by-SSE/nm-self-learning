import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./toggle";

const meta: Meta<typeof Toggle> = {
	title: "Components/Toggle",
	component: Toggle,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const ToggledOff: Story = {
	args: {
		value: false,
		onChange: () => {},
		label: "Toggle me"
	}
};

export const ToggledOn: Story = {
	args: {
		value: true,
		onChange: () => {},
		label: "Toggle me"
	}
};

export const Interactive: Story = {
	render: () => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [isToggled, setIsToggled] = useState(false);

		return (
			<div className="flex flex-col items-center gap-4">
				<Toggle value={isToggled} onChange={setIsToggled} label="Interactive toggle" />
				<p className="text-sm text-gray-600">Current state: {isToggled ? "On" : "Off"}</p>
			</div>
		);
	}
};
