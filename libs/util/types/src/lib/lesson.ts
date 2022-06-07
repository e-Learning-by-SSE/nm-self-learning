export type LessonContent = LessonContentType[];

export type LessonContentType = VideoContent;

export type VideoContent = {
	type: "video";
	url: string;
};
