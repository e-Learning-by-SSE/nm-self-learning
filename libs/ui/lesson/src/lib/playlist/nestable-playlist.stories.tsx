import { ComponentMeta, ComponentStory } from "@storybook/react";
import { NestablePlaylist } from "./playlist";

export default {
	component: NestablePlaylist,
	title: "Lesson/Playlist"
} as ComponentMeta<typeof NestablePlaylist>;

const Template: ComponentStory<typeof NestablePlaylist> = args => (
	<div className="gradient card w-full max-w-[500px]">
		<NestablePlaylist {...args} />
	</div>
);

export const With_Nested_Playlists = Template.bind({});
With_Nested_Playlists.args = {
	course: {
		title: "Software Engineering",
		slug: "software-engineering"
	},
	currentLesson: {
		lessonId: "2",
		slug: "2",
		title: "Lesson 2",
		isCompleted: false
	},
	content: [
		{
			title: "Introduction",
			isActive: true,
			lessons: ["1", "2", "3"].map(n => ({
				lessonId: n,
				slug: n,
				title: `Lesson ${n}`,
				isCompleted: n === "1"
			}))
		},
		{
			title: "Background",
			isActive: false,
			lessons: ["4", "5", "6"].map(n => ({
				lessonId: n,
				slug: n,
				title: `Lesson ${n}`,
				isCompleted: false
			}))
		},
		{
			title: "Outro",
			isActive: false,
			lessons: ["7"].map(n => ({
				lessonId: n,
				slug: n,
				title: `Lesson ${n}`,
				isCompleted: false
			}))
		}
	],
	courseCompletion: {
		chapters: [],
		completedLessons: {
			"1": { createdAt: new Date(2022, 4, 20), slug: "n", title: "Lesson 1" }
		},
		courseCompletionPercentage: (1 / 7) * 100
	}
};
