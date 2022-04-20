import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AuthorChip } from "./author-chip";

export default {
	component: AuthorChip,
	title: "Common/Authors/AuthorChip"
} as ComponentMeta<typeof AuthorChip>;

const Template: ComponentStory<typeof AuthorChip> = args => (
	<div className="multi-gradient w-fit p-16">
		<AuthorChip {...args} />
	</div>
);

export const WithImage = Template.bind({});
WithImage.args = {
	name: "Max Mustermann",
	slug: "max-mustermann",
	imgUrl: "/uploads/patrick_bateman_ba863d3f83.jpg"
};

export const BlurredImage = Template.bind({});
BlurredImage.args = {
	name: "Max Mustermann",
	slug: "max-mustermann",
	imgUrl: "/invalid-url"
};

export const NoImage = Template.bind({});
NoImage.args = {
	name: "Max Mustermann",
	slug: "max-mustermann",
	imgUrl: null
};
