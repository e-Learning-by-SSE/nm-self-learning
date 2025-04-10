import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Alert, warningType } from "./alert";

const meta: Meta<typeof Alert> = {
	title: "Components/Alert",
	component: Alert,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"],
	argTypes: {
		type: {
			control: "object"
		}
	}
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Basic string message alerts
export const Warning: Story = {
	args: {
		type: {
			severity: "WARNING",
			message: "This is a warning alert message"
		} as warningType
	}
};

export const Error: Story = {
	args: {
		type: {
			severity: "ERROR",
			message: "This is an error alert message"
		} as warningType
	}
};

export const Information: Story = {
	args: {
		type: {
			severity: "INFORMATION",
			message: "This is an information alert message"
		} as warningType
	}
};

export const Success: Story = {
	args: {
		type: {
			severity: "SUCCESS",
			message: "This is a success alert message"
		} as warningType
	}
};

// Alerts with more complex content
export const WarningWithHTML: Story = {
	args: {
		type: {
			severity: "WARNING",
			message: (
				<>
					<strong>Warning:</strong> This action cannot be undone. Please{" "}
					<a href="#" className="underline">
						read the documentation
					</a>{" "}
					before proceeding.
				</>
			)
		} as warningType
	}
};

export const ErrorWithHTML: Story = {
	args: {
		type: {
			severity: "ERROR",
			message: (
				<>
					<strong>Error:</strong> Connection failed.
					<ul className="list-disc ml-5 mt-2">
						<li>Check your internet connection</li>
						<li>Verify server status</li>
						<li>Try again later</li>
					</ul>
				</>
			)
		} as warningType
	}
};

export const LongInformation: Story = {
	args: {
		type: {
			severity: "INFORMATION",
			message: (
				<>
					<span className="font-bold block mb-1">System Maintenance Notice</span>
					<p>
						The system will undergo scheduled maintenance on Saturday, April 5th, from
						2:00 AM to 4:00 AM UTC. During this time, the service might experience
						intermittent downtime.
					</p>
					<p className="mt-2">We apologize for any inconvenience this may cause.</p>
				</>
			)
		} as warningType
	}
};

export const SuccessWithDetails: Story = {
	args: {
		type: {
			severity: "SUCCESS",
			message: (
				<>
					<span className="font-bold">Operation successful!</span>
					<div className="text-sm mt-1">Transaction ID: #AF728BC1</div>
				</>
			)
		} as warningType
	}
};
