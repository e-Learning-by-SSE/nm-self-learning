import { database } from "@self-learning/database";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { ImageCard } from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";

type Author = ResolvedValue<typeof getAuthor>;

type AuthorPageProps = {
	author: Author;
	aboutMeMarkdown: CompiledMarkdown | null;
};

export const getStaticProps: GetStaticProps<AuthorPageProps> = async ({ params }) => {
	const slug = params?.authorSlug as string | undefined;

	if (!slug) {
		throw new Error("No slug provided.");
	}

	const author = await getAuthor(slug);

	let aboutMeMarkdown = null;

	// if (author.aboutMe && author.aboutMe?.length > 0) {
	// 	aboutMeMarkdown = await compileMarkdown(author.aboutMe);
	// 	author.aboutMe = null;
	// }

	if (!author) {
		return {
			notFound: true
		};
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

function getAuthor(slug: string | undefined) {
	return database.author.findUnique({
		where: { slug },
		select: {
			slug: true,
			displayName: true,
			imgUrl: true,
			teams: {
				select: {
					name: true,
					slug: true
				}
			},
			courses: {
				select: {
					slug: true,
					title: true,
					subtitle: true,
					imgUrl: true
				}
			}
		}
	});
}

export default function AuthorPage({ author, aboutMeMarkdown }: AuthorPageProps) {
	return (
		<div className="min-h-screen">
			<CenteredSection className="gradient">
				<AuthorHeader author={author} />
			</CenteredSection>

			{aboutMeMarkdown && (
				<CenteredSection className="bg-white">
					<div className="prose max-w-full">
						<MDXRemote {...aboutMeMarkdown}></MDXRemote>
					</div>
				</CenteredSection>
			)}

			<CenteredSection className="bg-gray-50">
				<div className="flex flex-col gap-8">
					<span>
						<h2 className="text-3xl">Kurse</h2>
						<Link href={`/authors/${author.slug}/courses`}>
							<a className="text-sm text-secondary hover:underline">Alle anzeigen</a>
						</Link>
					</span>
					<ItemCardGrid>
						{author.courses.map(course => (
							<Link href={`/courses/${course.slug}`} key={course.slug}>
								<a>
									<ImageCard
										slug={course.slug}
										title={course.title}
										subtitle={course.subtitle}
										imgUrl={course.imgUrl}
									/>
								</a>
							</Link>
						))}
					</ItemCardGrid>
				</div>
			</CenteredSection>

			{/* <CenteredSection className="bg-white">
				<div className="flex flex-col gap-8">
					<span className="">
						<h2 className="text-3xl">Nanomodule</h2>
						<Link href={`/authors/${author.slug}/lessons`}>
							<a className="text-sm text-secondary hover:underline">Alle anzeigen</a>
						</Link>
					</span>
					<ItemCardGrid>
						{author.lessons?.data.map(({ attributes }) => (
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
				</div>
			</CenteredSection> */}
		</div>
	);
}

export function AuthorHeader({ author }: { author: Author }) {
	return (
		<div className="flex flex-col place-items-center gap-16">
			<div className="relative mx-auto shrink-0 lg:mx-0">
				{author.imgUrl && (
					<Image
						className="rounded-lg"
						height="256"
						width="256"
						src={author.imgUrl}
						alt=""
					></Image>
				)}
			</div>
			<div className="flex flex-col place-items-center gap-16">
				<h1 className="text-3xl sm:text-6xl">{author.displayName}</h1>
				{author.teams.length > 0 && (
					<div className="flex flex-wrap gap-4">
						{author.teams.map(({ slug, name }) => (
							<TeamChip key={slug} slug={slug} name={name} />
						))}
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
