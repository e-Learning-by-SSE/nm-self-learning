import { compileMarkdown } from "@self-learning/markdown";
import { CenteredSection } from "@self-learning/ui/layouts";
import { readFile } from "fs/promises";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { MDXRemote } from "next-mdx-remote";
import dynamic from "next/dynamic";
import Link from "next/link";
import { join } from "path";
import { cwd } from "process";

const Math = dynamic(() => import("../../../components/math"));

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
	const slug = ctx.params?.slug as string;
	const path = join(cwd(), "docs", "markdown-examples", slug + ".mdx");
	console.log(path);
	const mdxSource = await readFile(path, "utf-8");
	const markdown = await compileMarkdown(mdxSource);

	return {
		props: { markdown, importMath: slug === "math" }
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return {
		fallback: "blocking",
		paths: []
	};
};

const slugs: string[] = ["simple", "github", "code", "features", "math"];

export default function TestPage({
	markdown,
	importMath
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			{importMath && <Math />}
			<CenteredSection className="mx-auto py-16">
				<h1 className="text-6xl">Markdown Test</h1>

				<div className="flex gap-8 py-8 text-sm text-secondary">
					{slugs.map(slug => (
						<Link key={slug} href={`/teaching/lessons/${slug}`}>
							<a className="font-semibold">{slug}</a>
						</Link>
					))}
				</div>

				<div className="prose border-t border-light-border py-16">
					<MDXRemote {...markdown} />
				</div>
			</CenteredSection>
		</>
	);
}
