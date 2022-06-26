import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Playlist, PlaylistSubtitle } from "./playlist";

export default {
	component: Playlist,
	title: "Lesson/Playlist"
} as ComponentMeta<typeof Playlist>;

const Template: ComponentStory<typeof Playlist> = args => (
	<div className="card gradient h-[728px] w-[500px] overflow-hidden px-8">
		<Playlist {...args} />
	</div>
);

const fakeLessons: Parameters<typeof Playlist>[0]["lessons"] = new Array(10)
	.fill(0)
	.map((_, index) => ({
		slug: `a-beginners-guide-to-react-introduction-${index}`,
		title: "A Beginners Guide to React Introduction",
		lessonId: index.toString(),
		isCompleted: index < 4
	}));

export const Standalone = Template.bind({});
Standalone.args = {
	index: 1,
	lessons: fakeLessons,
	title: "Software Engineering",
	subtitleElement: (
		<PlaylistSubtitle
			chapter={{
				isActive: true,
				lessons: fakeLessons,
				title: "Software Engineering"
			}}
		/>
	),
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
