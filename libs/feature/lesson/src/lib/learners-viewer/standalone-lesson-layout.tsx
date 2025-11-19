import { NextComponentType, NextPageContext } from "next";
import type { ParsedUrlQuery } from "querystring";
import { LessonData, getLesson } from "../lesson-data-access";
import { BaseLessonLayout } from "./base-layout";

export type StandaloneLessonLayoutProps = {
	lesson: LessonData;
};

export async function getSspStandaloneLessonLayout(
	params?: ParsedUrlQuery | undefined
): Promise<StandaloneLessonLayoutProps | { notFound: true }> {
	const lessonSlug = params?.["lessonSlug"] as string;
	if (!lessonSlug) {
		throw new Error("No lesson slug provided.");
	}

	const lesson = await getLesson(lessonSlug);

	if (!lesson) {
		return { notFound: true };
	}

	return { lesson };
}

export function StandaloneLessonLayout(
	Component: NextComponentType<NextPageContext, unknown, StandaloneLessonLayoutProps>,
	pageProps: StandaloneLessonLayoutProps
) {
	const playlistArea = <StandaloneLessonPlaylistArea {...pageProps} />;

	return (
		<BaseLessonLayout
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
		<aside className="playlist-scroll sticky top-[61px] w-full overflow-auto border-t border-r-gray-200 pb-8 xl:h-[calc(100vh-61px)] xl:border-t-0 xl:border-r xl:pr-4">
			{/** to be implemented */}
		</aside>
	);
}
