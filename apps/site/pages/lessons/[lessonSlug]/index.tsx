import { PlayIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import {
	getStaticPropsForStandaloneLessonLayout,
	LicenseLabel,
	StandaloneLessonLayout,
	StandaloneLessonLayoutProps
} from "@self-learning/lesson";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { findContentType, LessonContent, LessonMeta } from "@self-learning/types";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { PdfViewer, VideoPlayer } from "@self-learning/ui/lesson";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import { useState } from "react";
import { withAuth, withTranslations } from "@self-learning/api";
import {
	Authors,
	DefaultLicenseLabel,
	MediaTypeSelector,
	SelfRegulatedPreQuestion,
	usePreferredMediaType
} from "@self-learning/lesson";

export type StandaloneLessonProps = StandaloneLessonLayoutProps & {
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
		preQuestion: CompiledMarkdown | null;
		subtitle: CompiledMarkdown | null;
	};
};

export const getServerSideProps = withTranslations(["common"], async context => {
	return withAuth(async _user => {
		const props = await getStaticPropsForStandaloneLessonLayout(context.params);

		if ("notFound" in props) return { notFound: true };

		const { lesson } = props;

		lesson.quiz = null;
		let mdDescription = null;
		let mdArticle = null;
		let mdQuestion = null;
		let mdSubtitle = null;

		if (lesson.description) {
			mdDescription = await compileMarkdown(lesson.description);
		}

		if (lesson.subtitle && lesson.subtitle.length > 0) {
			mdSubtitle = await compileMarkdown(lesson.subtitle);
		}

		const { content: article } = findContentType("article", lesson.content as LessonContent);

		if (article) {
			mdArticle = await compileMarkdown(article.value.content ?? "Kein Inhalt.");
			article.value.content = "(replaced)";
		}

		if (lesson.lessonType === LessonType.SELF_REGULATED) {
			mdQuestion = await compileMarkdown(lesson.selfRegulatedQuestion ?? "Kein Inhalt.");
		}

		return {
			props: {
				...props,
				markdown: {
					article: mdArticle,
					description: mdDescription,
					preQuestion: mdQuestion,
					subtitle: mdSubtitle
				}
			}
		};
	})(context);
});

export default function StandaloneLessonPage({ lesson, markdown }: StandaloneLessonProps) {
	const [showDialog, setShowDialog] = useState(lesson.lessonType === LessonType.SELF_REGULATED);

	const { content: video } = findContentType("video", lesson.content as LessonContent);
	const { content: pdf } = findContentType("pdf", lesson.content as LessonContent);

	const preferredMediaType = usePreferredMediaType(lesson);

	if (showDialog && markdown.preQuestion) {
		return (
			<article className="flex flex-col gap-4">
				<SelfRegulatedPreQuestion
					setShowDialog={setShowDialog}
					question={markdown.preQuestion}
				/>
			</article>
		);
	}

	return (
		<article className="flex flex-col gap-4">
			{preferredMediaType === "video" && (
				<div className="aspect-video w-full xl:max-h-[75vh]">
					{video?.value.url ? (
						<VideoPlayer parentLessonId={lesson.lessonId} url={video.value.url} />
					) : (
						<div className="py-16 text-center text-red-500">Error: Missing URL 2y</div>
					)}
				</div>
			)}

			<StandaloneLessonHeader
				lesson={lesson}
				mdDescription={markdown.description}
				mdSubtitle={markdown.subtitle}
			/>

			{preferredMediaType === "article" && markdown.article && (
				<MarkdownContainer className="mx-auto w-full pt-4">
					<MDXRemote {...markdown.article} />
				</MarkdownContainer>
			)}

			{preferredMediaType === "pdf" && pdf?.value.url && (
				<div className="h-[90vh] xl:h-[80vh]">
					<PdfViewer url={pdf.value.url} />
				</div>
			)}
		</article>
	);
}

StandaloneLessonPage.getLayout = StandaloneLessonLayout;

function StandaloneLessonHeader({
	lesson,
	mdDescription,
	mdSubtitle
}: {
	lesson: StandaloneLessonProps["lesson"];
	mdDescription?: CompiledMarkdown | null;
	mdSubtitle?: CompiledMarkdown | null;
}) {
	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-wrap justify-between gap-4">
				<div className="flex w-full flex-col">
					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-2">
							<h1 className="text-4xl">{lesson.title}</h1>
						</span>
						<StandaloneLessonControls lesson={lesson} />
					</span>
					{mdSubtitle && (
						<MarkdownContainer className="mt-2 text-light">
							<MDXRemote {...mdSubtitle} />
						</MarkdownContainer>
					)}

					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-3">
							<Authors authors={lesson.authors} />
						</span>
						<div className="mt-3">
							{!lesson.license ? (
								<DefaultLicenseLabel />
							) : (
								<LicenseLabel license={lesson.license} />
							)}
						</div>
					</span>

					<div className="pt-4">
						<MediaTypeSelector lesson={lesson} />
					</div>
				</div>
			</div>

			{mdDescription && (
				<MarkdownContainer className="mx-auto pb-4">
					<MDXRemote {...mdDescription} />
				</MarkdownContainer>
			)}
		</div>
	);
}

function StandaloneLessonControls({ lesson }: { lesson: StandaloneLessonProps["lesson"] }) {
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			{hasQuiz && (
				<Link
					href={`/lessons/${lesson.slug}/quiz`}
					className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
					data-testid="quizLink"
				>
					<span>Zur Lernkontrolle</span>
					<PlayIcon className="h-6 shrink-0" />
				</Link>
			)}
		</div>
	);
}
