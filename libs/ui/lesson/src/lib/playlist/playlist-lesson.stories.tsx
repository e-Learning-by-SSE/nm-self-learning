import { ComponentMeta, ComponentStory } from "@storybook/react";
import { PlaylistLesson } from "./playlist";

export default {
	component: PlaylistLesson,
	title: "Lesson/Playlist/Lesson"
} as ComponentMeta<typeof PlaylistLesson>;

const Template: ComponentStory<typeof PlaylistLesson> = args => (
	<div className="card gradient w-full max-w-[500px]">
		<PlaylistLesson {...args} />
	</div>
);

const defaultLesson: Parameters<typeof PlaylistLesson>[0] = {
	href: "https://youtube.com/watch?v=dQw4w9WgXcQ",
	isActive: false,
	lesson: {
		lessonId: "1",
		slug: "1",
		title: "A Playlist Lesson",
		isCompleted: false
	}
};

export const Inactive = Template.bind({});
Inactive.args = {
	...defaultLesson,
	isActive: false
};

export const Active = Template.bind({});
Active.args = {
	...defaultLesson,
	isActive: true
};

export const Completed = Template.bind({});
Completed.args = {
	...defaultLesson,
	isActive: false,
	lesson: {
		...defaultLesson.lesson,
		isCompleted: true
	}
};
