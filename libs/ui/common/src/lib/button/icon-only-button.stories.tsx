import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { PlusButton, TrashcanButton, XButton, PencilButton } from "./icon-only-button";

// ✅ Meta setup
const meta: Meta = {
	title: "Common/Icon Buttons",
	tags: ["autodocs"]
};

export default meta;
type Story = StoryObj;

// A little layout helper for spacing
const ButtonWrapper = ({ children }: { children: React.ReactNode }) => (
	<div className="flex items-center gap-4 p-4 bg-white rounded">{children}</div>
);

// ✅ Story 1: Plus button (3 sizes)
export const PlusButtons: Story = {
	render: () => (
		<ButtonWrapper>
			<PlusButton title="Add small" size="small" onAdd={() => alert("Added small")} />
			<PlusButton title="Add medium" size="medium" onAdd={() => alert("Added medium")} />
			<PlusButton title="Add large" size="large" onAdd={() => alert("Added large")} />
		</ButtonWrapper>
	)
};

// ✅ Story 2: Trashcan with and without label
export const TrashButtons: Story = {
	render: () => (
		<ButtonWrapper>
			<TrashcanButton title="Delete" onClick={() => alert("Deleted")} />
			<TrashcanButton
				title="Delete with label"
				label="Delete"
				onClick={() => alert("Deleted with label")}
			/>
		</ButtonWrapper>
	)
};

// ✅ Story 3: X button in different sizes
export const XButtons: Story = {
	render: () => (
		<ButtonWrapper>
			<XButton title="Close (S)" size="small" onClick={() => alert("Closed small")} />
			<XButton title="Close (M)" size="medium" onClick={() => alert("Closed medium")} />
			<XButton title="Close (L)" size="large" onClick={() => alert("Closed large")} />
		</ButtonWrapper>
	)
};

// ✅ Story 4: Pencil button (icon-only and icon + label)
export const PencilButtons: Story = {
	render: () => (
		<ButtonWrapper>
			<PencilButton title="Edit icon-only" onClick={() => alert("Edited")} />
			<PencilButton
				title="Edit with text"
				buttonTitle="Edit"
				onClick={() => alert("Edited with text")}
			/>
		</ButtonWrapper>
	)
};
