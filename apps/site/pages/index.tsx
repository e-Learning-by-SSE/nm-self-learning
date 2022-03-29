import type { User } from "@prisma/client";
import { database } from "@self-learning/database";
import { compileMarkdown, extractFrontMatter, MarkdownDocument } from "@self-learning/markdown";
import { readFile } from "fs/promises";
import { GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";

type IndexPageProps = {
	users: User[];
	mdDocument: MarkdownDocument;
	mdContent: Awaited<ReturnType<typeof compileMarkdown>>;
};

export const getStaticProps: GetStaticProps<IndexPageProps> = async ({ params }) => {
	const users = await database.user.findMany();

	const markdown = await readFile(
		"./libs/util/markdown/src/lib/test-examples/with-frontmatter.md",
		"utf8"
	);
	const mdDocument = extractFrontMatter(markdown);
	const mdContent = await compileMarkdown(mdDocument.content ?? "");
	mdDocument.content = null;

	return {
		props: {
			users,
			mdDocument,
			mdContent
		}
	};
};

export function Index({ users, mdDocument, mdContent }: IndexPageProps) {
	return (
		<div className="flex items-center justify-center h-full flex-col gap-16">
			<h1 className="font-bold text-6xl">Hello World</h1>
			<ul>
				{users.map(user => (
					<li key={user.id}>{user.displayName}</li>
				))}
			</ul>
			<div className="prose prose-slate">
				<MDXRemote {...mdContent}></MDXRemote>
			</div>
		</div>
	);
}

export default Index;
