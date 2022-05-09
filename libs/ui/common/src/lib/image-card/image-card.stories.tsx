import { CollectionIcon, VideoCameraIcon } from "@heroicons/react/outline";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ImageCard, ImageCardBadge } from "./image-card";

export default {
	component: ImageCard,
	title: `Common/${ImageCard.name}`
} as ComponentMeta<typeof ImageCard>;

const Template: ComponentStory<typeof ImageCard> = args => (
	<div className="max-w-sm">
		<ImageCard {...args} />
	</div>
);

export const Default = Template.bind({});
Default.args = {
	slug: "computer-science",
	title: "Computer Science",
	subtitle:
		"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid repudiandae quas alias cum necessitatibus!"
};

export const WithFooter = Template.bind({});
WithFooter.args = {
	slug: "computer-science",
	title: "Computer Science",
	subtitle: "You can render arbitrary React elements in the footer.",
	footer: (
		<>
			<span className="flex items-center gap-3">
				<CollectionIcon className="h-5" />
				<span>12 Courses</span>
			</span>
			<span className="flex items-center gap-3">
				<VideoCameraIcon className="h-5" />
				<span>123 Nanomodule</span>
			</span>
		</>
	)
};

export const WithBadge = Template.bind({});
WithBadge.args = {
	slug: "computer-science",
	title: "Computer Science",
	subtitle:
		"You can pass an 'ImageCardBadge' component to the badge prop to render a badge with arbitrary text and background color.",
	badge: <ImageCardBadge text="Recommended" className="bg-emerald-500" />
};
