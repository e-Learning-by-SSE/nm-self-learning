import { Story, Meta } from "@storybook/react";
import Example from "./example";

export default {
	component: Example,
	title: "Example"
} as Meta;

const Template: Story<{ text: string }> = args => <Example text={args.text} />;

export const Primary = Template.bind({});
Primary.args = {
	text: "Hello world"
};
