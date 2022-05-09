import { ComponentMeta, ComponentStory } from "@storybook/react";
import { TopicHeader } from "./topic-header";

export default {
	component: TopicHeader,
	title: "Layouts/TopicHeader"
} as ComponentMeta<typeof TopicHeader>;

const Template: ComponentStory<typeof TopicHeader> = args => (
	<div className="gradient max-w-3xl rounded-lg px-8 pb-32">
		<TopicHeader {...args} />
	</div>
);

export const Default = Template.bind({});
Default.args = {
	imgUrlBanner: null,
	parentLink: "/",
	parentTitle: "Fachbereich",
	title: "Softwareentwicklung",
	subtitle:
		"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid repudiandae quas alias cum necessitatibus!"
};

export const WithChildren = Template.bind({});
WithChildren.args = {
	imgUrlBanner: null,
	parentLink: "/",
	parentTitle: "Fachbereich",
	title: "Softwareentwicklung",
	subtitle:
		"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid repudiandae quas alias cum necessitatibus!",
	children: (
		<div className="mt-8 flex gap-4">
			<button className="btn-primary">Children</button>
			<button className="btn-secondary">Children</button>
			<button className="btn-stroked">Children</button>
		</div>
	)
};
