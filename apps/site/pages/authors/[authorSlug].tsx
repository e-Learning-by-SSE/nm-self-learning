import { getAuthorBySlug } from "@self-learning/cms-api";
import { compileMarkdown } from "@self-learning/markdown";
import { ImageCard } from "@self-learning/ui/common";
import { CenteredContainer, ItemCardGrid } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote";

type Author = ResolvedValue<typeof getAuthorBySlug>;

type AuthorPageProps = {
	author: Author;
	aboutMeMarkdown: Awaited<ReturnType<typeof compileMarkdown>> | null;
};

export const getStaticProps: GetStaticProps<AuthorPageProps> = async ({ params }) => {
	const slug = params?.authorSlug as string | undefined;

	if (!slug) {
		throw new Error("No slug provided.");
	}

	const author = (await getAuthorBySlug(slug)) as Author;

	let aboutMeMarkdown = null;

	if (author.aboutMe && author.aboutMe?.length > 0) {
		aboutMeMarkdown = await compileMarkdown(author.aboutMe);
		author.aboutMe = null;
	}

	return {
		props: {
			author,
			aboutMeMarkdown
		}
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

export default function AuthorPage({ author, aboutMeMarkdown }: AuthorPageProps) {
	return (
		<div className="gradient min-h-screen pb-32">
			<CenteredContainer className="gap-8">
				<AuthorHeader author={author} />

				{/* <div className="card glass w-full">
					<div className="prose">
						<MDXRemote {...aboutMeMarkdown}></MDXRemote>
					</div>
				</div> */}

				<span>
					<h2 className="text-3xl">Kurse</h2>
					<Link href={`/authors/${author.slug}/courses`}>
						<a className="text-sm text-secondary hover:underline">Alle anzeigen</a>
					</Link>
				</span>
				<ItemCardGrid>
					{author.courses?.data.map(({ attributes }) => (
						<Link href={`/courses/${attributes!.slug}`} key={attributes!.slug}>
							<a>
								<ImageCard
									slug={attributes!.slug}
									title={attributes!.title}
									subtitle={attributes!.subtitle ?? ""}
									imgUrl={attributes!.image?.data?.attributes?.url}
								/>
							</a>
						</Link>
					))}
				</ItemCardGrid>

				<span className="mt-8 mb-8 h-[1px] bg-indigo-300"></span>

				<span className="">
					<h2 className="text-3xl">Nanomodule</h2>
					<Link href={`/authors/${author.slug}/lessons`}>
						<a className="text-sm text-secondary hover:underline">Alle anzeigen</a>
					</Link>
				</span>
				<ItemCardGrid>
					{author.nanomodules?.data.map(({ attributes }) => (
						<Link href={`/courses/${attributes!.slug}`} key={attributes?.slug}>
							<a>
								<ImageCard
									slug={attributes!.slug}
									title={attributes!.title}
									subtitle={attributes!.subtitle ?? ""}
									imgUrl={attributes!.image?.data?.attributes?.url}
								/>
							</a>
						</Link>
					))}
				</ItemCardGrid>
			</CenteredContainer>
		</div>
	);
}

export function AuthorHeader({ author }: { author: Author }) {
	return (
		<div className="glass flex flex-wrap items-center gap-8 rounded-b-lg px-8 py-4">
			<div className="relative mx-auto shrink-0 sm:mx-0">
				<Image
					className="rounded-lg"
					height="128"
					width="128"
					src={`http://localhost:1337${author?.image?.data?.attributes?.url}` ?? ""}
					alt={author?.image?.data?.attributes?.alternativeText ?? ""}
				></Image>
			</div>
			<div className="mx-auto flex flex-col place-items-center sm:mx-0">
				<h1 className="text-3xl sm:text-6xl">{author.name}</h1>

				<div className="mt-4 flex flex-wrap place-content-center items-center gap-4">
					{author.teams?.data.map(({ attributes }) => (
						<TeamChip
							key={attributes!.slug}
							slug={attributes!.slug}
							name={attributes!.title}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export function TeamChip({ slug, name }: { slug: string; name: string }) {
	return (
		<Link href={`/teams/${slug}`}>
			<a className="rounded-full bg-secondary py-2 px-4 text-sm font-semibold text-white">
				{name}
			</a>
		</Link>
	);
}
