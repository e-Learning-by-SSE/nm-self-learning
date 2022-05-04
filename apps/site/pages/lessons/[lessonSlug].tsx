import { PlayIcon } from "@heroicons/react/solid";
import { getNanomoduleBySlug } from "@self-learning/cms-api";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import { Playlist } from "@self-learning/ui/lesson";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";

type Nanomodule = Exclude<Awaited<ReturnType<typeof getNanomoduleBySlug>>, null | undefined>;

type NanomoduleProps = {
	nanomodule: Nanomodule;
};

export const getStaticProps: GetStaticProps<NanomoduleProps> = async ({ params }) => {
	const slug = params?.lessonSlug as string;

	if (!slug) {
		throw new Error("No slug provided.");
	}

	const nanomodule = (await getNanomoduleBySlug(slug)) as Nanomodule;

	return {
		props: { nanomodule },
		revalidate: 60,
		notFound: !nanomodule
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

type Lesson = { title: string; slug: string; imgUrl?: string };

const fakeLessons: Lesson[] = [
	{
		slug: "a-beginners-guide-to-react-introduction",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "2",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "3",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "4",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "5",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "6",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "7",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "8",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "9",
		title: "A Beginners Guide to React Introduction"
	},
	{
		slug: "10",
		title: "A Beginners Guide to React Introduction"
	}
];

export default function Nanomodule({ nanomodule }: NanomoduleProps) {
	const { title } = nanomodule;
	//const { url } = nanomodule.content[0] as cmsTypes.ComponentNanomoduleYoutubeVideo;
	const url = "http://localhost:1337/uploads/sample_video_7b4e24c005.mp4";

	const authors = nanomodule.authors?.data.map(
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

			<div className="flex min-h-screen flex-col bg-neutral-200 md:pb-16 md:pt-4">
				<div className="mx-auto flex w-full flex-col gap-4 lg:container">
					<VideoPlayerWithPlaylist videoUrl={url as string} />
					<LessonHeader lesson={nanomodule} authors={authors} />
				</div>
			</div>
		</>
	);
}

function VideoPlayerWithPlaylist({ videoUrl }: { videoUrl: string }) {
	return (
		<div className="grid w-full xl:grid-cols-4">
			<div className="h-[512px] bg-black lg:h-[720px] xl:col-span-3">
				{/* <YoutubeEmbed url={videoUrl}></YoutubeEmbed> */}
				{/* <VideoPlayer url={videoUrl} /> */}
			</div>
			<div className="max-h-[512px] overflow-hidden xl:col-span-1 xl:max-h-[720px]">
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

function LessonHeader({ lesson, authors }: { lesson: Nanomodule; authors: AuthorProps[] }) {
	return (
		<div className="flex flex-col px-2 sm:px-0">
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
