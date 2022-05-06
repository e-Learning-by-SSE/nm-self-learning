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
		<div className="gradient min-h-screen">
			<div className="gradient">
				<CenteredContainer className="py-16">
					<AuthorHeader author={author} aboutMeMarkdown={aboutMeMarkdown} />
				</CenteredContainer>
			</div>

			<div className="bg-white py-16">
				<CenteredContainer className="gap-8">
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

					{/* <span className="mt-8 mb-8 h-[1px] bg-indigo-300"></span> */}
				</CenteredContainer>
			</div>

			<div className="bg-gray-100 py-16">
				<CenteredContainer className="gap-8">
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
		</div>
	);
}

export function AuthorHeader({
	author,
	aboutMeMarkdown
}: {
	author: Author;
	aboutMeMarkdown: AuthorPageProps["aboutMeMarkdown"];
}) {
	return (
		<div className="flex flex-col gap-8 lg:flex-row">
			<div className="relative mx-auto shrink-0 lg:mx-0">
				<Image
					className="rounded-lg"
					height="256"
					width="256"
					src={`http://localhost:1337${author?.image?.data?.attributes?.url}` ?? ""}
					alt={author?.image?.data?.attributes?.alternativeText ?? ""}
				></Image>
			</div>
			<div className="flex flex-col place-items-center lg:place-content-start">
				<h1 className="text-center text-3xl sm:text-6xl lg:self-start">{author.name}</h1>

				<div className="mt-8 flex flex-wrap place-content-center gap-4 lg:self-start">
					{author.teams?.data.map(({ attributes }) => (
						<TeamChip
							key={attributes!.slug}
							slug={attributes!.slug}
							name={attributes!.title}
						/>
					))}
				</div>

				{aboutMeMarkdown && (
					<div className="card glass mt-8 w-fit">
						<div className="prose max-w-full">
							<MDXRemote {...aboutMeMarkdown}></MDXRemote>
						</div>
					</div>
				)}
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
