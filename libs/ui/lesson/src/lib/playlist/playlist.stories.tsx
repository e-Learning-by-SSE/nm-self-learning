import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Playlist } from "./playlist";

const fakeLessons: Parameters<typeof Playlist>[0]["lessons"] = new Array(10)
	.fill(0)
	.map((_, index) => ({
		slug: `a-beginners-guide-to-react-introduction-${index}`,
		title: "A Beginners Guide to React Introduction",
		lessonId: index.toString(),
		isCompleted: index < 4
	}));

export default {
	component: Playlist,
	title: "Lesson/Playlist"
} as ComponentMeta<typeof Playlist>;

const Template: ComponentStory<typeof Playlist> = args => (
	<div className="card gradient h-[728px] w-[420px] overflow-hidden px-8">
		<Playlist {...args} />
	</div>
);

export const Default = Template.bind({});
Default.args = {
	lessons: fakeLessons,
	subtitle: "Chapter: Webtechnologies (4/20)",
	course: {
		title: "Software Engineering",
		slug: "software-engineering"
	},
	currentLesson: {
		slug: "a-beginners-guide-to-react-introduction-2",
		title: "A Beginners Guide to React Introduction",
		lessonId: "2"
	}
};
