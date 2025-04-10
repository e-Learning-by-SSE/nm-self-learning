import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { StarRating } from "./star-rating";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof StarRating> = {
	title: "Components/StarRating",
	component: StarRating,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"],
	argTypes: {
		rating: { control: { type: "range", min: 0, max: 5, step: 1 } },
		onChange: { action: "rating changed" }
	}
};

export default meta;
type Story = StoryObj<typeof StarRating>;

// Basic StarRating with control
export const Default: Story = {
	args: {
		rating: 3,
		onChange: action("rating changed")
	}
};

// Star ratings with different initial values
export const EmptyRating: Story = {
	args: {
		rating: 0,
		onChange: action("rating changed")
	}
};

export const FullRating: Story = {
	args: {
		rating: 5,
		onChange: action("rating changed")
	}
};

// Interactive example with state
export const Interactive: Story = {
	render: () => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [rating, setRating] = useState(3);

		return <StarRating rating={rating} onChange={setRating} />;
	}
};
