import { NextComponentType, NextPageContext } from "next";
import { BaseLessonLayout } from "./base-layout";
import { LessonData } from "../lesson-data-access";

export type StandaloneLessonLayoutProps = {
	lesson: LessonData;
};

export function StandaloneLessonLayout(
	Component: NextComponentType<NextPageContext, unknown, StandaloneLessonLayoutProps>,
	pageProps: StandaloneLessonLayoutProps
) {
	const playlistArea = <StandaloneLessonPlaylistArea {...pageProps} />;

	return (
		<BaseLessonLayout
			key={pageProps.lesson.lessonId}
			title={pageProps.lesson.title}
			playlistArea={playlistArea}
			lesson={pageProps.lesson}
		>
			<Component {...pageProps} />
		</BaseLessonLayout>
	);
}

function StandaloneLessonPlaylistArea({ lesson }: StandaloneLessonLayoutProps) {
	return (
		<aside className="playlist-scroll sticky top-[61px] w-full overflow-auto border-t border-r-c-border pb-8 xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r xl:pr-4">
			{/** to be implemented */}
		</aside>
	);
}
