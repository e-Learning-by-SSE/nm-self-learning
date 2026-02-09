import { LessonContent, ResolvedValue } from "@self-learning/types";
import Head from "next/head";
import { getCourse, LessonData } from "../lesson-data-access";
import { LessonOutlineContext } from "../lesson-outline-context";
import { useNavigableContent } from "@self-learning/ui/layouts";
import { useState } from "react";
import { useAiTutor, AiTutor, FloatingTutorButton } from "@self-learning/ai-tutor";

export type BaseLessonLayoutProps = {
	title: string;
	playlistArea: React.ReactNode;
	children: React.ReactNode;
	course?: ResolvedValue<typeof getCourse>;
	lesson?: LessonData;
};

export function BaseLessonLayout({ lesson, title, playlistArea, children }: BaseLessonLayoutProps) {
	const lessonContent = (lesson?.content || []) as LessonContent;
	const [targetIndex, setTargetIndex] = useState<number | undefined>(undefined);
	const ctx = useNavigableContent(lessonContent, false, false);

	const contextValue = { ...ctx, targetIndex, setTargetIndex };
	const tutorState = useAiTutor();
	return (
		<LessonOutlineContext.Provider value={contextValue}>
			<Head>
				<title>{title}</title>
			</Head>

			<div className="flex flex-col bg-c-surface-2">
				<div className="mx-auto flex w-full max-w-[1920px] flex-col-reverse gap-8 px-4 xl:grid xl:grid-cols-[400px_1fr]">
					{playlistArea}
					<div className="w-full pt-8 pb-16">{children}</div>
				</div>
			</div>
			<FloatingTutorButton
				onToggle={tutorState.toggleTutor}
				disabled={tutorState.isAnimating}
			/>

			<AiTutor tutorState={tutorState} />
		</LessonOutlineContext.Provider>
	);
}
