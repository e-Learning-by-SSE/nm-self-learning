import { ChevronDownIcon, ChevronUpIcon, LockClosedIcon, PlayIcon } from "@heroicons/react/solid";
import { cmsTypes, getNanomoduleBySlug } from "@self-learning/cms-api";
import { AuthorProps, AuthorsList } from "@self-learning/ui/common";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

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

			<div className="flex min-h-screen flex-col bg-indigo-50 md:py-16">
				<div className="flex w-full flex-col gap-4 2xl:px-64">
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
			<div className="h-[512px] lg:h-[728px] xl:col-span-3">
				<YoutubeEmbed url={videoUrl}></YoutubeEmbed>
			</div>
			<div className="max-h-[728px] w-full overflow-hidden xl:col-span-1">
				<Playlist />
			</div>
		</div>
	);
}

type Lesson = { title: string; slug: string; imgUrl: string };

function Playlist() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div
			className={`w-full border border-white bg-white bg-opacity-75 backdrop-blur ${
				collapsed ? "h-fit" : "h-full"
			}`}
		>
			<div className="flex items-center justify-between gap-4 py-3 px-3">
				<div className="flex flex-col gap-1">
					<span className="text-base font-semibold">Dein Lernpfad</span>
					<span className="text-sm">Kapitel: Grundlagen (4/20)</span>
				</div>

				<button
					className="rounded-full p-2 hover:bg-neutral-200"
					title="Show/Hide Playlist"
					onClick={() => setCollapsed(previous => !previous)}
				>
					{collapsed ? (
						<ChevronDownIcon className="h-6" />
					) : (
						<ChevronUpIcon className="h-6" />
					)}
				</button>
			</div>
			{!collapsed && (
				<div className="playlist-scroll overflow-auto">
					<div className="flex flex-grow flex-col divide-y divide-white">
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
							isActive={true}
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
							isLocked={true}
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
							isLocked={true}
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
							imgUrl="http://localhost:1337/uploads/a_beginners_guide_to_react_39990bb89a.webp"
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
						/>
						<Lesson
							slug="a-beginners-guide-to-react-introduction"
							title="A Beginners Guide to React Introduction"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

function Lesson({
	title,
	slug,
	imgUrl,
	isActive,
	isLocked
}: {
	title: string;
	slug: string;
	imgUrl?: string;
	isActive?: boolean;
	isLocked?: boolean;
}) {
	return (
		<Link href={`lessons/${slug}`}>
			<a
				className={`flex h-20 w-full ${
					isActive ? "bg-indigo-500 text-white" : "bg-indigo-100 hover:bg-indigo-200"
				}`}
			>
				<div className="relative aspect-square h-full">
					{imgUrl ? (
						<Image layout="fill" className="bg-white" src={imgUrl} alt="" />
					) : (
						<div className="h-full w-full bg-neutral-500"></div>
					)}
				</div>
				<div className="flex w-full items-center gap-3 overflow-hidden px-3">
					{isActive && <PlayIcon className="h-6 shrink-0" />}
					{isLocked && <LockClosedIcon className="h-6 shrink-0" />}
					<div className="max-w-md truncate text-sm font-semibold">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint fugiat aperiam
						sequi error veritatis excepturi quibusdam illum nisi eius praesentium
						perferendis quidem repellendus dicta, accusantium pariatur modi molestias.
						Similique, dolores!
					</div>
				</div>
			</a>
		</Link>
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
