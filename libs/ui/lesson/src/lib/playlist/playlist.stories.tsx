import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Playlist } from "./playlist";

const fakeLessons = [
	{
		slug: "a-beginners-guide-to-react-introduction",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "2",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "3",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "4",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "5",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "6",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "7",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "8",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "9",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "10",
		title: "A Beginners Guide to React Introduction"
	}
];

export default {
	component: Playlist,
	title: "Lesson/Playlist"
} as ComponentMeta<typeof Playlist>;

const Template: ComponentStory<typeof Playlist> = args => (
	<div className="card multi-gradient h-[728px] w-[420px] overflow-hidden px-8">
		<Playlist {...args} />
	</div>
);

export const Default = Template.bind({});
Default.args = {
	lessons: fakeLessons,
	chapter: {
		title: "Chapter: Webtechnologies (4/20)"
	},
	course: {
		title: "Software Engineering"
	},
	currentLesson: {
		slug: "a-beginners-guide-to-react-introduction",
		title: "A Beginners Guide to React Introduction"
	}
};
