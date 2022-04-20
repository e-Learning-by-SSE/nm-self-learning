import { PlayIcon } from "@heroicons/react/solid";
import { cmsTypes, getNanomoduleBySlug } from "@self-learning/cms-api";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import { Playlist } from "@self-learning/ui/lesson";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
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
	const { title, subtitle, description, slug } = nanomodule;
	const imgUrl = `http://localhost:1337${nanomodule.image?.data?.attributes?.url}`;
	const imgAlt = nanomodule.image?.data?.attributes?.alternativeText ?? "";
	const { url } = nanomodule.content[0] as cmsTypes.ComponentNanomoduleYoutubeVideo;

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

			<div className="flex min-h-screen flex-col bg-neutral-200 md:py-16">
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
		<div className="grid w-full gap-8 xl:grid-cols-4">
			<div className="h-[512px] lg:h-[728px] xl:col-span-3">
				<YoutubeEmbed url={videoUrl}></YoutubeEmbed>
			</div>
			<div className="max-h-[728px] overflow-hidden xl:col-span-1">
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
			src={`https://www.youtube-nocookie.com//embed/${videoId}`}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
	);
}

// function VideoPlayer({ url }: { url: string}) {
// 	<video controls src={url} type={}></video>;
// }

// export function NanomoduleDynamicZone(content: NanomoduleContentDynamicZone) {
// 	if (content.__typename === "ComponentNanomoduleYoutubeVideo") {
// 		return <YoutubeEmbed url={content.url as string} />;
// 	}

// 	if (content.__typename === "ComponentNanomoduleVideo") {
// 		return
// 	}
// }

function LessonHeader({ lesson, authors }: { lesson: Nanomodule; authors: AuthorProps[] }) {
	return (
		<div className="flex flex-col-reverse justify-between gap-4 px-2 2xl:flex-row 2xl:px-0">
			<div className="flex flex-grow flex-col">
				<AuthorsList authors={authors} />
				<h1 className="mb-8 mt-8 text-4xl md:text-6xl">{lesson.title}</h1>
				{lesson.subtitle && <div className="text-lg tracking-tight">{lesson.subtitle}</div>}
			</div>
			<button className="btn-primary h-fit flex-grow-0 xl:w-fit ">
				<span>Zur Lernkontrolle</span>
				<PlayIcon className="h-6" />
			</button>
		</div>
	);
}
