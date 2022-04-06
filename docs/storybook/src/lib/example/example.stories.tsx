import { Meta, Story } from "@storybook/react";
import { Example } from "./example";

export default {
	component: Example,
	title: "Example"
} as Meta;

const Template: Story<unknown> = args => (
	<div className="bg-green-200 p-8">
		<Example />
	</div>
);

export const Primary = Template.bind({});
Primary.args = {};
