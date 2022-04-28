import type { User } from "@prisma/client";
import { database } from "@self-learning/database";
import { compileMarkdown, extractFrontMatter, MarkdownDocument } from "@self-learning/markdown";
import { readFile } from "fs/promises";
import { GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";

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
		<div className="flex h-full flex-col items-center gap-16 py-16">
			<h1 className="text-6xl font-bold">Hello World</h1>
			<Link href="/lessons/a-beginners-guide-to-react-introduction">
				<a className="underline">Lesson #1</a>
			</Link>
			<Link href="/courses/the-example-course">
				<a className="underline">Course #1</a>
			</Link>{" "}
			<ul>
				{users.map(user => (
					<li key={user.username}>{user.displayName}</li>
				))}
			</ul>
			<div className="prose prose-slate">
				<MDXRemote {...mdContent}></MDXRemote>
			</div>
		</div>
	);
}

export default Index;
