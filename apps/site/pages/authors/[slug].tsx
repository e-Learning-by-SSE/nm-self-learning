import { getAuthorBySlug } from "@self-learning/cms-api";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";

type Author = Exclude<Awaited<ReturnType<typeof getAuthorBySlug>>, null>;

type AuthorProps = {
	author: Author;
};

export const getStaticProps: GetStaticProps<AuthorProps> = async ({ params }) => {
	const slug = params?.slug as string | undefined;

	if (!slug) {
		throw new Error("No slug provided.");
	}

	const author = (await getAuthorBySlug(slug)) as Author;
	console.log(author);

	return {
		props: {
			author
		}
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	};
};

export default function Author({ author }: AuthorProps) {
	return (
		<div className="mx-auto flex flex-col items-center gap-16 py-16 px-2 md:px-0 lg:max-w-screen-lg">
			<div className="flex items-center gap-8">
				<h1 className="text-5xl">{author.name}</h1>

				<div className="relative">
					<Image
						className="rounded-full"
						height="128"
						width="128"
						src={`http://localhost:1337${author?.image?.data?.attributes?.url}` ?? ""}
						alt={author?.image?.data?.attributes?.alternativeText ?? ""}
					></Image>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				{author.nanomodules?.data.map(({ attributes }) => (
					<div key={attributes?.slug} className="flex gap-4 rounded bg-slate-100 p-4">
						<Image
							height="128"
							width="128"
							src={
								`http://localhost:1337${attributes?.image?.data?.attributes?.url}` ??
								""
							}
							alt={attributes?.image?.data?.attributes?.alternativeText ?? ""}
						></Image>
						<div className="flex flex-col justify-between">
							<div className="flex flex-col gap-4">
								<Link href={`/lessons/${attributes?.slug}`}>
									<a className="font-bold">{attributes?.title}</a>
								</Link>
								<div className="">{attributes?.subtitle}</div>
							</div>
							<div className="flex flex-col self-end text-right text-xs">
								<span>
									Created: {new Date(attributes?.createdAt).toLocaleDateString()}
								</span>
								<span>
									Updated: {new Date(attributes?.updatedAt).toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
