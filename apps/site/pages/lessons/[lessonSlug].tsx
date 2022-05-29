import { PlayIcon } from "@heroicons/react/solid";
import { cmsTypes, getLessonBySlug } from "@self-learning/cms-api";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import { Playlist } from "@self-learning/ui/lesson";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";

type LessonProps = {
	lesson: ResolvedValue<typeof getLessonBySlug>;
};

export const getStaticProps: GetStaticProps<LessonProps> = async ({ params }) => {
	const slug = params?.lessonSlug as string;

	if (!slug) {
		throw new Error("No slug provided.");
	}

	const lesson = await getLessonBySlug(slug);

	return {
		props: { lesson: lesson as Defined<typeof lesson> },
		revalidate: 60,
		notFound: !lesson
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

type Lesson = { title: string; slug: string; imgUrl?: string };

const fakeLessons: Lesson[] = new Array(25).fill(0).map((_, index) => ({
	slug: index.toString(),
	title: "A Beginners Guide to React Introduction"
}));

export default function Lesson({ lesson }: LessonProps) {
	const { title } = lesson;
	const { url } = lesson.content?.[0] as cmsTypes.ComponentContentYoutubeVideo;

	const authors = lesson.authors?.data.map(
		author =>
			({
				name: author.attributes?.name,
				slug: author.attributes?.slug,
				imgUrl: author.attributes?.image?.data?.attributes?.url
			} as AuthorProps)
	) as AuthorProps[];

	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>

			<div className=" bg-gray-50 md:pb-32">
				<div className="flex flex-col gap-4">
					<VideoPlayerWithPlaylist videoUrl={url as string} />
					<LessonHeader lesson={lesson} authors={authors} />
				</div>
			</div>
		</>
	);
}

function VideoPlayerWithPlaylist({ videoUrl }: { videoUrl: string }) {
	return (
		<div className="mx-auto flex w-full flex-col bg-white xl:max-h-[75vh] xl:flex-row xl:px-4">
			<div className="aspect-video grow bg-black">
				<YoutubeEmbed url={videoUrl}></YoutubeEmbed>
				{/* <VideoPlayer url={videoUrl} /> */}
			</div>
			<div className="h-[400px] overflow-hidden xl:h-auto xl:min-w-[400px]">
				<Playlist
					lessons={fakeLessons}
					currentLesson={fakeLessons[0]}
					course={{ title: "Dein Lernpfad" }}
					chapter={{ title: "Kapitel: Grundlagen (4/20)" }}
				/>
			</div>
		</div>
	);
}

function YoutubeEmbed({ url }: { url: string }) {
	const videoId = useMemo(() => url.match(/\?v=(.+)$/)?.at(1), [url]);

	return (
		<iframe
			height="100%"
			width="100%"
			src={`https://www.youtube-nocookie.com/embed/${videoId}`}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
	);
}

function VideoPlayer({ url }: { url: string }) {
	return (
		<div className="flex h-full w-full bg-black">
			<video controls src={url}></video>
		</div>
	);
}

function LessonHeader({
	lesson,
	authors
}: {
	lesson: LessonProps["lesson"];
	authors: AuthorProps[];
}) {
	return (
		<div className="mx-auto flex w-full flex-col px-2 sm:px-0 lg:container">
			<div className="gradient card flex flex-wrap justify-between gap-8">
				<Link href={`/lessons/${lesson.slug}/questions`}>
					<a className="btn-primary flex w-full flex-wrap-reverse md:w-fit">
						<span>Zur Lernkontrolle</span>
						<PlayIcon className="h-6 shrink-0" />
					</a>
				</Link>
			</div>

			<div className="mx-auto mt-8 flex flex-grow flex-col items-center gap-8">
				<h1 className="text-4xl xl:text-6xl">{lesson.title}</h1>
				{lesson.subtitle && (
					<div className="max-w-3xl text-xl tracking-tight text-indigo-700">
						{lesson.subtitle}
					</div>
				)}
				<AuthorsList authors={authors} />

				<div className="glass card center max-w-3xl">
					{lesson.description && <p>{lesson.description}</p>}
				</div>
			</div>
		</div>
	);
}
